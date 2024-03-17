use super::TabsControllerMessage;
use iced::widget::{button, column};
use iced::Element;

pub struct CfgTab {
	// cfg: ScenarioCfg
}

impl CfgTab {
	pub fn new(/* cfg: ScenarioCfg */) -> Self {
		Self {
            // cfg
        }
	}

	pub fn title(&self) -> String {
		format!("Configuration")
	}

	pub fn update(&mut self, message: TabsControllerMessage) {}

	pub fn view(&self) -> Element<TabsControllerMessage> {
		column![button("Configuration").on_press(TabsControllerMessage::VisualizationTab)].into()
	}
}
