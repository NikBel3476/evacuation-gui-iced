use std::env;
use std::rc::Rc;

use evacuation_core::bim::bim_json_object::{bim_json_object_new, BimJsonElement, BimJsonObject};
use evacuation_core::bim::configuration::ScenarioCfg;
use evacuation_core::bim::json_object;
use evacuation_core::bim::run_evacuation_modeling;
use iced::widget::canvas::{self, Canvas, Fill, Frame, Geometry, Path, Stroke};
use iced::widget::{button, column, container, row, text, Container};
use iced::{color, mouse, Background, Color, Element, Length, Point, Rectangle, Renderer, Theme};
use rfd::FileDialog;

pub struct VisualizationTab {
	cfg: Rc<ScenarioCfg>,
	bim_json: Option<BimJsonObject>,
	scale: f32,
	mouse_left_button_pressed: bool,
	cursor_coordinates: Point,
	translation: iced::Vector,
	number_of_level: usize,
	selected_element: Option<BimJsonElement>,
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
			number_of_level: 0,
			selected_element: None,
		}
	}

	pub fn title(&self) -> String {
		"Visualization".to_string()
	}

	fn project(&self, position: Point) -> Point {
		Point::new(
			position.x / self.scale - self.translation.x,
			position.y / self.scale - self.translation.y,
		)
	}

	fn object_at(&self, position: Point) -> Option<&BimJsonElement> {
		match &self.bim_json {
			Some(bim) => bim.levels[self.number_of_level]
				.build_elements
				.iter()
				.find(|element| {
					element
						.polygon
						.is_point_inside(&json_object::Point {
							x: f64::from(position.x),
							y: f64::from(position.y),
						})
						.unwrap()
				}),
			None => None,
		}
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
					let scale_change = new_scale / self.scale;
					self.scale = new_scale;
					self.translation = iced::Vector {
						x: self.translation.x / scale_change,
						y: self.translation.y / scale_change,
					}
				}
			}
			VisualizationTabMessage::MouseLeftButtonState(pressed) => {
				self.mouse_left_button_pressed = pressed;
				if !pressed {
					if let Some(element) = self.object_at(self.project(self.cursor_coordinates)) {
						self.selected_element = Some((*element).clone());
					}
				}
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
		let build_element_info = self.selected_element.as_ref().map(|build_element| {
			column![
				text(format!("Название: {}", build_element.name)).width(Length::Fill),
				text(format!("Кол-во людей: {}", build_element.number_of_people))
					.width(Length::Fill),
				// text(format!("UUID: {}", build_element.uuid)).width(Length::Fill),
				text(format!("Тип: {:?}", build_element.sign)).width(Length::Fill)
			]
		});
		let control_panel = container(
			column![
				button("To configuration tab").on_press(VisualizationTabMessage::CfgTab),
				button("Open file of building")
					.on_press(VisualizationTabMessage::OpenBuildingFileDialog)
			]
			.push_maybe(build_element_info)
			.spacing(10),
		)
		.height(Length::Fill)
		.width(Length::Fixed(250.0))
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
							Some(VisualizationTabMessage::UpdateScale(self.scale * 1.5)),
						)
					} else {
						(
							canvas::event::Status::Captured,
							Some(VisualizationTabMessage::UpdateScale(self.scale / 1.5)),
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
				mouse::Event::CursorMoved { position: _ } => {
					if let Some(position) = cursor.position_in(bounds) {
						return (
							canvas::event::Status::Captured,
							Some(VisualizationTabMessage::MouseCursorMove(position)),
						);
					}
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
		cursor: mouse::Cursor,
	) -> Vec<Geometry> {
		let mut frame = Frame::new(renderer, bounds.size());
		frame.scale(self.scale);
		frame.translate(self.translation);

		if let Some(bim_json) = &self.bim_json {
			let rooms_paths = bim_json.levels[self.number_of_level]
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

			rooms_paths.iter().for_each(|path| {
				frame.fill(path, color!(0xf0ffea, 0.1));
				frame.stroke(path, Stroke::default())
			});
		}

		// Change color element on hover
		let hovered_element = cursor
			.position_in(bounds)
			.map(|position| self.object_at(self.project(position)));

		if let Some(Some(build_element)) = hovered_element {
			let polygon_point = build_element.polygon.points[0];
			let path = Path::new(|p| {
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
			});
			frame.fill(&path, color!(0xf0ffea))
		}

		if let Some(build_element) = &self.selected_element {
			let polygon_point = build_element.polygon.points[0];
			let path = Path::new(|p| {
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
			});
			frame.fill(&path, color!(0xff0400))
		}

		vec![frame.into_geometry()]
	}
}
