use std::env;
use std::rc::Rc;

use iced::widget::canvas::{self, Canvas, Frame, Geometry, Path, Stroke};
use iced::widget::{button, column, container, row, Container};
use iced::{color, mouse, Background, Color, Element, Length, Point, Rectangle, Renderer, Theme};
use rfd::FileDialog;

// use crate::bim::bim_json_object::{bim_json_object_new, BimJsonObject};
// use crate::bim::configuration::ScenarioCfg;
// use crate::bim::run_evacuation_modeling;
use evacuation_core::bim::bim_json_object::{bim_json_object_new, BimJsonObject};
use evacuation_core::bim::configuration::ScenarioCfg;
use evacuation_core::bim::run_evacuation_modeling;

pub struct VisualizationTab {
	cfg: Rc<ScenarioCfg>,
	bim_json: Option<BimJsonObject>,
	scale: f32,
	mouse_left_button_pressed: bool,
	cursor_coordinates: Point,
	translation: iced::Vector,
}

#[derive(Debug, Clone)]
pub enum VisualizationTabMessage {
	CfgTab,
	OpenBuildingFileDialog,
	UpdateScale(f32),
	MouseLeftButtonState(bool),
	MouseCursorMove(Point),
}

impl VisualizationTab {
	pub fn new(cfg: Rc<ScenarioCfg>) -> Self {
		Self {
			cfg,
			bim_json: None,
			scale: 1.0,
			mouse_left_button_pressed: false,
			cursor_coordinates: Default::default(),
			translation: Default::default(),
		}
	}

	#[allow(dead_code)]
	pub fn title(&self) -> String {
		"Visualization".to_string()
	}

	pub fn update(&mut self, message: VisualizationTabMessage) {
		match message {
			VisualizationTabMessage::OpenBuildingFileDialog => {
				let current_dir = env::current_dir().unwrap();
				let choosen_file = FileDialog::new()
					.add_filter("json", &["json"])
					.set_directory(current_dir) // FIXME: kde always opening 'Documents' directory (rfd problem)
					.pick_file();
				if let Some(file) = choosen_file {
					let file_path = file.as_path().to_str().unwrap();
					println!("full path: {}", file_path);
					self.bim_json = Some(bim_json_object_new(file_path));
					let _ = run_evacuation_modeling(file_path, &self.cfg);

					self.scale = 1.0;
					self.translation = iced::Vector { x: 0.0, y: 0.0 };
				} else {
					println!("Files were not selected");
				}
			}
			VisualizationTabMessage::UpdateScale(new_scale) => {
				if new_scale > 0.0 {
					self.scale = new_scale;
				}
			}
			VisualizationTabMessage::MouseLeftButtonState(pressed) => {
				self.mouse_left_button_pressed = pressed;
			}
			VisualizationTabMessage::MouseCursorMove(point) => {
				if self.mouse_left_button_pressed {
					let mut translation_delta = point - self.cursor_coordinates;
					translation_delta.x /= self.scale;
					translation_delta.y /= self.scale;
					self.translation = self.translation + translation_delta;
				}
				self.cursor_coordinates = point;
			}
			VisualizationTabMessage::CfgTab => {}
		}
	}

	pub fn view(&self) -> Element<VisualizationTabMessage> {
		let control_panel = container(
			column![
				button("To configuration tab").on_press(VisualizationTabMessage::CfgTab),
				button("Open file of building")
					.on_press(VisualizationTabMessage::OpenBuildingFileDialog)
			]
			.spacing(10),
		)
		.height(Length::Fill)
		.padding(20)
		.style(|_: &_| container::Appearance {
			background: Some(Background::Color(color!(0x3645ff, 0.1))),
			..Default::default()
		});

		let canvas = Canvas::new(self).width(Length::Fill).height(Length::Fill);

		row!(control_panel, canvas).into()
	}
}

impl canvas::Program<VisualizationTabMessage> for VisualizationTab {
	type State = ();

	fn update(
		&self,
		_state: &mut Self::State,
		event: canvas::Event,
		bounds: Rectangle,
		cursor: mouse::Cursor,
	) -> (canvas::event::Status, Option<VisualizationTabMessage>) {
		if cursor.position_in(bounds).is_none() {
			return (canvas::event::Status::Ignored, None);
		}

		if let canvas::Event::Mouse(mouse_event) = event {
			match mouse_event {
				mouse::Event::WheelScrolled {
					delta: mouse::ScrollDelta::Lines { x: _, y },
				} => {
					return if y > 0.0 {
						(
							canvas::event::Status::Captured,
							Some(VisualizationTabMessage::UpdateScale(self.scale + 0.5)),
						)
					} else {
						(
							canvas::event::Status::Captured,
							Some(VisualizationTabMessage::UpdateScale(self.scale - 0.5)),
						)
					};
				}
				mouse::Event::ButtonPressed(button) => {
					if button == mouse::Button::Left {
						return (
							canvas::event::Status::Captured,
							Some(VisualizationTabMessage::MouseLeftButtonState(true)),
						);
					}
				}
				mouse::Event::ButtonReleased(button) => {
					if button == mouse::Button::Left {
						return (
							canvas::event::Status::Captured,
							Some(VisualizationTabMessage::MouseLeftButtonState(false)),
						);
					}
				}
				mouse::Event::CursorMoved { position } => {
					return (
						canvas::event::Status::Captured,
						Some(VisualizationTabMessage::MouseCursorMove(position)),
					);
				}
				_ => {}
			}
		}

		(canvas::event::Status::Ignored, None)
	}

	fn draw(
		&self,
		_state: &(),
		renderer: &Renderer,
		_theme: &Theme,
		bounds: Rectangle,
		_cursor: mouse::Cursor,
	) -> Vec<Geometry> {
		let mut frame = Frame::new(renderer, bounds.size());
		frame.scale(self.scale);
		frame.translate(self.translation);

		if let Some(bim_json) = &self.bim_json {
			let num_of_level = 0;
			let rooms_paths = bim_json.levels[num_of_level]
				.build_elements
				.iter()
				.map(|build_element| {
					let polygon_point = build_element.polygon.points[0];
					Path::new(|p| {
						p.move_to(Point {
							x: polygon_point.x as f32,
							y: polygon_point.y as f32,
						});
						build_element.polygon.points[1..].iter().for_each(|point| {
							p.line_to(Point {
								x: point.x as f32,
								y: point.y as f32,
							})
						});
					})
				})
				.collect::<Vec<Path>>();

			rooms_paths
				.iter()
				.for_each(|path| frame.stroke(path, Stroke::default()));
		}

		vec![frame.into_geometry()]
	}
}
