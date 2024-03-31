use std::env;

use iced::widget::{button, column};
use iced::Element;
use rfd::FileDialog;

pub struct VisualizationTab {}

#[derive(Debug, Clone)]
pub enum VisualizationTabMessage {
	CfgTab,
	OpenBuildingFileDialog,
}

impl VisualizationTab {
	pub fn new() -> Self {
		Self {}
	}

	pub fn title(&self) -> String {
		format!("Visualization")
	}

	pub fn update(&mut self, message: VisualizationTabMessage) {
		match message {
			VisualizationTabMessage::OpenBuildingFileDialog => {
				// FIXME: kde always opening 'Documents' directory (rfd problem)
				let current_dir = env::current_dir().unwrap();
				println!("current dir: {}", current_dir.display());
				let choosen_file = FileDialog::new()
					.add_filter("json", &["json"])
					.set_directory(&current_dir)
					.pick_file();
				if let Some(file) = choosen_file {
					let file_name = file.file_name().unwrap().to_str().unwrap();
					println!("{}", file_name);
				} else {
					println!("Files were not selected");
				}
			}
			VisualizationTabMessage::CfgTab => {}
		}
	}

	pub fn view(&self) -> Element<VisualizationTabMessage> {
		column![
			button("To configuration tab").on_press(VisualizationTabMessage::CfgTab),
			button("Open file of building")
				.on_press(VisualizationTabMessage::OpenBuildingFileDialog)
		]
		.spacing(10)
		.into()
	}
}
