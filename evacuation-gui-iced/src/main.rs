use evacuation_core::bim::bim_tools::EvacuationModelingResult;
use evacuation_core::bim::{configuration, configuration::ScenarioCfg};
use evacuation_core::bim::{run_evacuation_modeling, run_rust};
use gui::tabs::{TabsController, TabsControllerMessage};
use iced::widget::{button, column, text};
use iced::{Alignment, Element, Sandbox, Settings};
// use python::call_python::run_python;
// use evacuation_core::python::call_python::run_python;

mod gui;
mod python;

fn main() -> iced::Result {
	EvacuationApp::run(Settings {
		antialiasing: true,
		..Settings::default()
	})
}

// fn read_config() -> Result<configuration::ScenarioCfg, String> {
// 	configuration::load_cfg("../scenario.json")
// }

// fn save_configuration(
// 	handle: AppHandle,
// 	configuration: configuration::ScenarioCfg,
// ) -> Result<String, String> {
// 	if let Some(dir) = handle.path_resolver().app_data_dir() {
// 		let app_data_dir_path = dir.join("configuration.json");
// 		return match configuration::save_configuration(&app_data_dir_path, &configuration) {
// 			Ok(_) => Ok(String::from(app_data_dir_path.to_str().unwrap_or(""))),
// 			Err(error) => Err(format!("{error}")),
// 		};
// 	}
// 	Err(String::from("Failed to get AppData directory"))
// }

// async fn open_configuration_window(handle: AppHandle) {
// 	let _configuration_window = WindowBuilder::new(
// 		&handle,
// 		"configuration",
// 		tauri::WindowUrl::App("src-ui/config/index.html".into()),
// 	)
// 	.title("Configuration")
// 	.build()
// 	.unwrap();
// }

// async fn open_configuration_rescript_window(handle: AppHandle) {
// 	let _configuration_window = WindowBuilder::new(
// 		&handle,
// 		"configurationRescript",
// 		tauri::WindowUrl::App("src-ui/configRescript/index.html".into()),
// 	)
// 	.title("Configuration rescript")
// 	.build()
// 	.unwrap();
// }

// async fn open_people_traffic_window(handle: AppHandle) {
// 	let _people_traffic_window = WindowBuilder::new(
// 		&handle,
// 		"people_traffic",
// 		tauri::WindowUrl::App("src-ui/peopleTraffic/index.html".into()),
// 	)
// 	.title("People traffic")
// 	.min_inner_size(1000.0, 800.0)
// 	.build()
// 	.unwrap();
// }

// async fn open_building_view_window(handle: AppHandle) {
// 	let _building_view_window = WindowBuilder::new(
// 		&handle,
// 		"building_view",
// 		tauri::WindowUrl::App("src-ui/buildingView/index.html".into()),
// 	)
// 	.title("Building view")
// 	.min_inner_size(1000.0, 800.0)
// 	.build()
// 	.unwrap();
// }

// fn bim_start(scenario_configuration: ScenarioCfg) {
// 	println!("{:#?}", &scenario_configuration);
// 	run_rust(&scenario_configuration);
// }

// fn run_modeling(file_path: &str, scenario_configuration: ScenarioCfg) -> EvacuationModelingResult {
// 	run_evacuation_modeling(file_path, &scenario_configuration)
// }

// fn python_start() {
// 	run_python().expect("Failed to run python");
// }

struct EvacuationApp {
	tabs_controller: TabsController,
}

#[derive(Debug, Clone)]
enum Message {
	TabsController(TabsControllerMessage),
}

impl Sandbox for EvacuationApp {
	type Message = Message;

	fn new() -> Self {
		Self {
			tabs_controller: TabsController::new(),
		}
	}

	fn title(&self) -> String {
		let mut title = String::from("Evacuation - ");

		title.push_str(&self.tabs_controller.current_tab_title());

		title
	}

	fn update(&mut self, message: Message) {
		match message {
			Message::TabsController(message) => self.tabs_controller.update(message),
		}
	}

	fn view(&self) -> Element<Self::Message> {
		column![self.tabs_controller.view().map(Message::TabsController)]
			.align_items(Alignment::Center)
			.into()
	}
}
