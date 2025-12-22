use std::env;
use std::sync::Arc;

use evacuation_core::bim::bim_json_object::{BimJsonElement, BimJsonObject, bim_json_object_new};
use evacuation_core::bim::configuration::ScenarioCfg;
use evacuation_core::bim::json_object;
use evacuation_core::bim::run_evacuation_modeling;
use iced::{
	Background, Element, Length, Point, Rectangle, Renderer, Theme, color, keyboard, mouse,
	widget::{
		button,
		canvas::{self, Canvas, Frame, Geometry, Path, Stroke},
		column, container, row, text,
	},
};
use rfd::FileDialog;

const SCALE_DELTA_MULTIPLIER: f32 = 1.2;

pub struct VisualizationTab {
	cfg: Arc<ScenarioCfg>,
	bim_json: Option<BimJsonObject>,
	scale: f32,
	mouse_left_button_pressed: bool,
	cursor_coordinates: Point,
	translation: iced::Vector,
	number_of_level: usize,
	selected_element: Option<BimJsonElement>,
	selected_element_level: Option<usize>,
}

#[derive(Debug, Clone)]
pub enum VisualizationTabMessage {
	CfgTab,
	OpenBuildingFileDialog,
	UpdateScale(f32),
	MouseLeftButtonState(bool),
	MouseCursorMove(Point),
	ChangeCurrentLevel(usize),
}

impl VisualizationTab {
	pub fn new(cfg: Arc<ScenarioCfg>) -> Self {
		Self {
			cfg,
			bim_json: None,
			scale: 1.0,
			mouse_left_button_pressed: false,
			cursor_coordinates: Default::default(),
			translation: Default::default(),
			number_of_level: 0,
			selected_element: None,
			selected_element_level: None,
		}
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
					let cfg = Arc::clone(&self.cfg);
					let bim_file_path = String::from(file_path);
					std::thread::spawn(move || {
						let _ = run_evacuation_modeling(&bim_file_path, &cfg);
					});

					self.scale = 1.0;
					self.translation = iced::Vector { x: 0.0, y: 0.0 };
					self.selected_element = None;
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
				if !pressed
					&& let Some(element) = self.object_at(self.project(self.cursor_coordinates))
				{
					self.selected_element = Some((*element).clone());
					self.selected_element_level = Some(self.number_of_level);
				}
			}
			VisualizationTabMessage::MouseCursorMove(point) => {
				if self.mouse_left_button_pressed {
					let mut translation_delta = point - self.cursor_coordinates;
					translation_delta.x /= self.scale;
					translation_delta.y /= self.scale;
					self.translation += translation_delta;
				}
				self.cursor_coordinates = point;
			}
			VisualizationTabMessage::ChangeCurrentLevel(level) => {
				self.number_of_level = level;
			}
			VisualizationTabMessage::CfgTab => {}
		}
	}

	pub fn view(&'_ self) -> Element<'_, VisualizationTabMessage> {
		let build_element_info = self.selected_element.as_ref().map(|build_element| {
			column![
				text(format!("Название: {}", build_element.name)).width(Length::Fill),
				text(format!("Кол-во людей: {}", build_element.number_of_people))
					.width(Length::Fill),
				// text(format!("UUID: {}", build_element.uuid)).width(Length::Fill),
				text(format!("Тип: {:?}", build_element.sign)).width(Length::Fill),
				text(format!("Уровень: {}", build_element.z_level)).width(Length::Fill)
			]
		});
		let control_panel = container(
			column![
				button("To configuration tab").on_press(VisualizationTabMessage::CfgTab),
				button("Open file of building")
					.on_press(VisualizationTabMessage::OpenBuildingFileDialog),
				text(format!("Этаж: {}", self.number_of_level)).width(Length::Fill),
			]
			.push(build_element_info.unwrap_or(column![]))
			.spacing(10),
		)
		.height(Length::Fill)
		.width(Length::Fixed(250.0))
		.padding(20)
		.style(|_: &_| container::Style {
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
		event: &iced::Event,
		bounds: Rectangle,
		cursor: mouse::Cursor,
	) -> Option<canvas::Action<VisualizationTabMessage>> {
		cursor.position_in(bounds)?;

		match event {
			canvas::Event::Mouse(mouse_event) => match mouse_event {
				mouse::Event::WheelScrolled {
					delta: mouse::ScrollDelta::Lines { x: _, y },
				} => {
					return Some(
						if *y > 0.0 {
							canvas::Action::publish(VisualizationTabMessage::UpdateScale(
								self.scale * SCALE_DELTA_MULTIPLIER,
							))
						} else {
							canvas::Action::publish(VisualizationTabMessage::UpdateScale(
								self.scale / SCALE_DELTA_MULTIPLIER,
							))
						}
						.and_capture(),
					);
				}
				mouse::Event::ButtonPressed(button) => {
					if *button == mouse::Button::Left {
						return Some(
							canvas::Action::publish(VisualizationTabMessage::MouseLeftButtonState(
								true,
							))
							.and_capture(),
						);
					}
				}
				mouse::Event::ButtonReleased(button) => {
					if *button == mouse::Button::Left {
						return Some(canvas::Action::publish(
							VisualizationTabMessage::MouseLeftButtonState(false),
						));
					}
				}
				mouse::Event::CursorMoved { position: _ } => {
					if let Some(position) = cursor.position_in(bounds) {
						return Some(
							canvas::Action::publish(VisualizationTabMessage::MouseCursorMove(
								position,
							))
							.and_capture(),
						);
					}
				}
				_ => {}
			},
			canvas::Event::Keyboard(keyboard::Event::KeyPressed {
				key: keyboard::Key::Named(named_key),
				modified_key: _,
				physical_key: _,
				location: _,
				modifiers: _,
				text: _,
				repeat: _,
			}) => match named_key {
				keyboard::key::Named::ArrowUp => {
					if let Some(bim_json) = &self.bim_json
						&& self.number_of_level < bim_json.levels.len() - 1
					{
						return Some(
							canvas::Action::publish(VisualizationTabMessage::ChangeCurrentLevel(
								self.number_of_level + 1,
							))
							.and_capture(),
						);
					}
				}
				keyboard::key::Named::ArrowDown => {
					if self.number_of_level > 0 {
						return Some(
							canvas::Action::publish(VisualizationTabMessage::ChangeCurrentLevel(
								self.number_of_level - 1,
							))
							.and_capture(),
						);
					}
				}
				_ => {}
			},
			_ => {}
		}

		None
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

		if let (Some(build_element), Some(build_element_level)) =
			(&self.selected_element, self.selected_element_level)
			&& build_element_level == self.number_of_level
		{
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
