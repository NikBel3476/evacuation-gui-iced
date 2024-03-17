use cfg_tab::CfgTab;
use iced::Element;
use visualization_tab::VisualizationTab;

pub mod cfg_tab;
pub mod visualization_tab;

pub enum TabId {
	Cfg,
	Visualization,
}

impl std::fmt::Display for TabId {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		let text = match self {
			TabId::Cfg => "Configuration",
			TabId::Visualization => "Visualization",
		};

		write!(f, "{text}")
	}
}

#[derive(Debug, Clone)]
pub enum TabsControllerMessage {
	CfgTab,
	VisualizationTab,
}

pub struct TabsController {
	current_tab_id: TabId,
	cfg_tab: CfgTab,
	visualization_tab: VisualizationTab,
}

impl TabsController {
	pub fn new() -> Self {
		Self {
			current_tab_id: TabId::Cfg,
			cfg_tab: CfgTab::new(),
			visualization_tab: VisualizationTab::new(),
		}
	}

	pub fn current_tab_title(&self) -> String {
		self.current_tab_id.to_string()
	}

	pub fn update(&mut self, message: TabsControllerMessage) {
		match message {
			TabsControllerMessage::CfgTab => {
				self.current_tab_id = TabId::Cfg;
			}
			TabsControllerMessage::VisualizationTab => {
				self.current_tab_id = TabId::Visualization;
			}
		}
	}

	pub fn view(&self) -> Element<TabsControllerMessage> {
		match self.current_tab_id {
			TabId::Cfg => self.cfg_tab.view(),
			TabId::Visualization => self.visualization_tab.view(),
		}
	}
}
