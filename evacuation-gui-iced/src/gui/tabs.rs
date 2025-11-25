use std::sync::Arc;

use cfg_tab::CfgTab;
use evacuation_core::bim::configuration::load_cfg;
use iced::Element;
use visualization_tab::VisualizationTab;

use self::{cfg_tab::CfgTabMessage, visualization_tab::VisualizationTabMessage};

pub mod cfg_tab;
pub mod visualization_tab;

const CFG_PATH: &str = "scenario.json";

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

pub struct TabsController {
	current_tab_id: TabId,
	cfg_tab: CfgTab,
	visualization_tab: VisualizationTab,
}

#[derive(Debug, Clone)]
pub enum TabsControllerMessage {
	VisualizationTab(VisualizationTabMessage),
	CfgTab(CfgTabMessage),
}

impl TabsController {
	pub fn new() -> Self {
		let scenario_cfg =
			Arc::new(load_cfg(CFG_PATH).expect("Failed to read scenario configuration"));

		Self {
			current_tab_id: TabId::Cfg,
			cfg_tab: CfgTab::new(Arc::clone(&scenario_cfg)),
			visualization_tab: VisualizationTab::new(Arc::clone(&scenario_cfg)),
		}
	}

	pub fn current_tab_title(&self) -> String {
		self.current_tab_id.to_string()
	}

	pub fn update(&mut self, message: TabsControllerMessage) {
		match message {
			TabsControllerMessage::VisualizationTab(message) => match message {
				VisualizationTabMessage::CfgTab => {
					self.current_tab_id = TabId::Cfg;
				}
				_ => self.visualization_tab.update(message),
			},
			TabsControllerMessage::CfgTab(message) => match message {
				CfgTabMessage::VisualizationTab => self.current_tab_id = TabId::Visualization,
			},
		}
	}

	pub fn view(&self) -> Element<TabsControllerMessage> {
		match self.current_tab_id {
			TabId::Cfg => self.cfg_tab.view().map(TabsControllerMessage::CfgTab),
			TabId::Visualization => self
				.visualization_tab
				.view()
				.map(TabsControllerMessage::VisualizationTab),
		}
	}
}
