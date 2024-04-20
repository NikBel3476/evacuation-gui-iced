use std::env;
use std::rc::Rc;

use iced::widget::canvas::{self, Canvas, Frame, Geometry, Path, Stroke};
use iced::widget::{button, column, row};
use iced::{mouse, Color, Element, Length, Point, Rectangle, Renderer, Theme};
use rfd::FileDialog;

use crate::bim::bim_json_object::{bim_json_object_new, BimJsonObject};
use crate::bim::configuration::ScenarioCfg;
use crate::bim::run_evacuation_modeling;

pub struct VisualizationTab {
	cfg: Rc<ScenarioCfg>,
	bim_json: Option<BimJsonObject>,
}

#[derive(Debug, Clone)]
pub enum VisualizationTabMessage {
	CfgTab,
	OpenBuildingFileDialog,
}

impl VisualizationTab {
	pub fn new(cfg: Rc<ScenarioCfg>) -> Self {
		Self {
			cfg,
			bim_json: None,
		}
	}

	pub fn title(&self) -> String {
		format!("Visualization")
	}

	pub fn update(&mut self, message: VisualizationTabMessage) {
		match message {
			VisualizationTabMessage::OpenBuildingFileDialog => {
				let current_dir = env::current_dir().unwrap();
				let choosen_file = FileDialog::new()
					.add_filter("json", &["json"])
					.set_directory(&current_dir) // FIXME: kde always opening 'Documents' directory (rfd problem)
					.pick_file();
				if let Some(file) = choosen_file {
					let file_path = file.as_path().to_str().unwrap();
					println!("full path: {}", file_path);
					self.bim_json = Some(bim_json_object_new(file_path));
					let _ = run_evacuation_modeling(file_path, &self.cfg);
				} else {
					println!("Files were not selected");
				}
			}
			VisualizationTabMessage::CfgTab => {}
		}
	}

	pub fn view(&self) -> Element<VisualizationTabMessage> {
		row!(
			column![
				button("To configuration tab").on_press(VisualizationTabMessage::CfgTab),
				button("Open file of building")
					.on_press(VisualizationTabMessage::OpenBuildingFileDialog)
			]
			.spacing(10),
			Canvas::new(self).width(Length::Fill).height(Length::Fill)
		)
		.into()
	}
}

// Then, we implement the `Program` trait
impl<VisualizationTabMessage> canvas::Program<VisualizationTabMessage> for VisualizationTab {
	type State = ();

	fn draw(
		&self,
		_state: &(),
		renderer: &Renderer,
		_theme: &Theme,
		bounds: Rectangle,
		_cursor: mouse::Cursor,
	) -> Vec<Geometry> {
		let mut frame = Frame::new(renderer, bounds.size());

		if let Some(bim_json) = &self.bim_json {
			let num_of_level = 0;
			let rooms_paths = bim_json.levels[num_of_level]
				.build_elements
				.iter()
				.map(|build_element| {
					Path::new(|p| {
						p.move_to(build_element.polygon.points[0].into());
						build_element.polygon.points[1..]
							.iter()
							.for_each(|point| p.line_to(point.into()));
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
