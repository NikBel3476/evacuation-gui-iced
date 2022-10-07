#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

use cli;
use configuration;
use json_object;
use bim_cli;
use bim_configure;
use bim_json_object;

mod run_bindings;

fn main() {
	let configuration = CustomMenuItem::new(
		"configuration",
		"Configuration"
	);
	let menu = Menu::new()
		.add_item(configuration);

	tauri::Builder::default()
		.menu(menu)
		.on_menu_event(|event| {
			match event.menu_item_id() {
				"configuration" => {}
				_ => {}
			}
		})
		.invoke_handler(tauri::generate_handler![read_config])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}

#[tauri::command]
fn read_config() -> Result<configuration::ScenarioCfg, String> {
	configuration::load_cfg("../scenario.json")
}

#[tauri::command]
async fn open_config_window(handle: tauri::AppHandle) {
	let config_windows = tauri::WindowBuilder::new(
		&handle,
		"runtime",
		tauri::WindowUrl::External("https://tauri.app/".parse().unwrap())
	).build().unwrap();
}