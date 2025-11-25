use std::sync::Arc;

use evacuation_core::bim::configuration::ScenarioCfg;
use iced::Element;
use iced::widget::{button, column, text, text_input};

pub struct CfgTab {
	cfg: Arc<ScenarioCfg>,
}

#[derive(Debug, Clone)]
pub enum CfgTabMessage {
	VisualizationTab,
}

impl CfgTab {
	pub fn new(cfg: Arc<ScenarioCfg>) -> Self {
		Self { cfg }
	}

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
		.padding(20)
		.into()
	}
}
