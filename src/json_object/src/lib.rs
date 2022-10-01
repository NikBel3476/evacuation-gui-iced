extern crate serde_json;

use std::error::Error;
use std::fs;
use std::process;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Address {
	#[serde(rename="City")]
	pub city: String,
	#[serde(rename="StreetAddress")]
	pub street_address: String,
	#[serde(rename="AddInfo")]
	pub add_info: String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Point {
	pub x: f64,
	pub y: f64
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Coordinates {
	pub points: Vec<Point>
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BuildElement {
	#[serde(rename="Id")]
	pub id: String,
	#[serde(rename="@")]
	pub uuid: String,
	#[serde(rename="Name")]
	pub name: String,
	#[serde(rename="SizeZ")]
	pub size_z: f64,
	#[serde(rename="Sign")]
	pub sign: String,
	#[serde(rename="XY")]
	pub xy: Vec<Coordinates>,
	#[serde(rename="Output")]
	pub outputs: Vec<String>,
	#[serde(rename="NumPeople", default)]
	pub number_of_people: u64
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Level {
	#[serde(rename="NameLevel")]
	pub name: String,
	#[serde(rename="ZLevel")]
	pub z_level: f64,
	#[serde(rename="BuildElement")]
	pub build_elements: Vec<BuildElement>
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BuildingStruct {
	#[serde(rename="Devs")]
	pub devs: Vec<i64>,
	#[serde(rename="NameBuilding")]
	pub name_building: String,
	#[serde(rename="Address")]
	pub address: Address,
	#[serde(rename="Level")]
	pub levels: Vec<Level>
}

#[no_mangle]
pub fn parse_building_from_json(path_to_file: &str) -> Result<Box<BuildingStruct>, Box<dyn Error>> {
	let json_content = fs::read_to_string(path_to_file).unwrap_or_else(|err| {
		eprintln!("Ошибка чтения файла конфигурации здания {}: {}", path_to_file, err);
		process::exit(1);
	});

	let data: BuildingStruct = serde_json::from_str(&json_content).unwrap_or_else(|err| {
		eprintln!("Ошибка десериализации файла конфигурации здания {}: {}", path_to_file, err);
		process::exit(1);
	});

	Ok(Box::new(data))
}