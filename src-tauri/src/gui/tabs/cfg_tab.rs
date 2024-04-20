use std::rc::Rc;

use crate::bim::configuration::ScenarioCfg;
use iced::widget::{button, column, text, text_input};
use iced::Element;

pub struct CfgTab {
	cfg: Rc<ScenarioCfg>,
}

#[derive(Debug, Clone)]
pub enum CfgTabMessage {
	VisualizationTab,
}

impl CfgTab {
	pub fn new(cfg: Rc<ScenarioCfg>) -> Self {
		Self { cfg }
	}

	pub fn title(&self) -> String {
		format!("Configuration")
	}

	pub fn update(&mut self, message: CfgTabMessage) {}

	pub fn view(&self) -> Element<CfgTabMessage> {
		column![
			button("To visualization tab").on_press(CfgTabMessage::VisualizationTab),
			column![text("Version"), text_input("", self.cfg.version.as_str())],
			column![
				text("Distribution").size(30),
				text("Type"),
				text_input("", &self.cfg.distribution.r#type.to_string()),
				text("Density"),
				text_input("", &self.cfg.distribution.density.to_string())
			]
		]
		.into()
	}
}
