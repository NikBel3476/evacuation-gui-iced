use super::bim_polygon_tools::Line;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fs;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Address {
	#[serde(rename = "City")]
	pub city: String,
	#[serde(rename = "StreetAddress")]
	pub street_address: String,
	#[serde(rename = "AddInfo")]
	pub add_info: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, Default)]
pub struct Point {
	pub x: f64,
	pub y: f64,
}

impl Point {
	pub fn distance_to(&self, other: &Point) -> f64 {
		let x = self.x - other.x;
		let y = self.y - other.y;
		(x * x + y * y).sqrt()
	}

	/// Определение точки на линии, расстояние до которой от заданной точки является минимальным из существующих
	pub fn nearest_point_on_line(&self, line: &Line) -> Point {
		let p1 = &line.p1;

		let p2 = &line.p2;

		if p1.distance_to(p2) < 1e-9 {
			return line.p1;
		}

		let a = self.x - p1.x;
		let b = self.y - p1.y;
		let c = p2.x - p1.x;
		let d = p2.y - p1.y;

		let dot = a * c + b * d;
		let len_sq = c * c + d * d;
		let mut param = -1.0;

		if len_sq != 0.0 {
			param = dot / len_sq;
		}

		let xx;
		let yy;

		if param < 0.0 {
			xx = p1.x;
			yy = p1.y;
		} else if param > 1.0 {
			xx = p2.x;
			yy = p2.y;
		} else {
			xx = p1.x + param * c;
			yy = p1.y + param * d;
		}

		Point { x: xx, y: yy }
	}
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Coordinates {
	pub points: Vec<Point>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BuildElement {
	#[serde(rename = "Id")]
	pub id: Uuid,
	#[serde(rename = "@")]
	pub uuid: Uuid,
	#[serde(rename = "Name")]
	pub name: String,
	#[serde(rename = "SizeZ")]
	pub size_z: f64,
	#[serde(rename = "Sign")]
	pub sign: String,
	#[serde(rename = "XY")]
	pub xy: Vec<Coordinates>,
	#[serde(rename = "Output")]
	pub outputs: Vec<Uuid>,
	#[serde(rename = "NumPeople", default)]
	pub number_of_people: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Level {
	#[serde(rename = "NameLevel")]
	pub name: String,
	#[serde(rename = "ZLevel")]
	pub z_level: f64,
	#[serde(rename = "BuildElement")]
	pub build_elements: Vec<BuildElement>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BuildingStruct {
	#[serde(rename = "Devs")]
	pub devs: Vec<i64>,
	#[serde(rename = "NameBuilding")]
	pub building_name: String,
	#[serde(rename = "Address")]
	pub address: Address,
	#[serde(rename = "Level")]
	pub levels: Vec<Level>,
}

#[no_mangle]
pub fn parse_building_from_json(path_to_file: &str) -> Result<Box<BuildingStruct>, Box<dyn Error>> {
	let json_content = fs::read_to_string(path_to_file).unwrap_or_else(|err| {
		panic!(
			"Ошибка чтения файла конфигурации здания {}: {}",
			path_to_file, err
		);
	});

	let data: BuildingStruct = serde_json::from_str(&json_content).unwrap_or_else(|err| {
		panic!(
			"Ошибка десериализации файла конфигурации здания {}: {}",
			path_to_file, err
		);
	});

	Ok(Box::new(data))
}
