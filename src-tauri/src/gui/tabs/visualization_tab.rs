use super::TabsControllerMessage;
use iced::widget::{button, column};
use iced::Element;

pub struct VisualizationTab {}

impl VisualizationTab {
	pub fn new() -> Self {
		Self {}
	}

	pub fn title(&self) -> String {
		format!("Visualization")
	}

	pub fn update(&mut self, message: TabsControllerMessage) {}

	pub fn view(&self) -> Element<TabsControllerMessage> {
		column![button("Visualization").on_press(TabsControllerMessage::CfgTab)].into()
	}
}
