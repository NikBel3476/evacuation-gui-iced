use super::bim_polygon_tools;
use super::json_object::parse_building_from_json;
use libc::{c_char, c_double, c_ulonglong};

/// Количество символов в UUID + NUL символ
#[derive(Clone)]
#[repr(C)]
pub struct uuid_t {
	pub x: [c_char; 36 + 1],
}

impl Default for uuid_t {
	fn default() -> Self {
		Self { x: [0; 36 + 1] }
	}
}

#[repr(C)]
pub struct point_t_rust {
	pub x: c_double,
	pub y: c_double,
}

pub struct polygon_t_rust {
	pub numofpoints: c_ulonglong,
	pub points: *mut point_t_rust,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum BimElementSign {
	/// Указывает, что элемент здания является помещением/комнатой
	ROOM,
	/// Указывает, что элемент здания является лестницей
	STAIRCASE,
	/// Указывает, что элемент здания является проемом (без дверного полотна)
	DOOR_WAY,
	/// Указывает, что элемент здания является дверью, которая соединяет два элемента: ROOM и ROOM или ROOM и STAIR
	DOOR_WAY_IN,
	/// Указывает, что элемент здания является эвакуационным выходом
	DOOR_WAY_OUT,
	/// Указывает, что элемент является зоной вне здания
	OUTSIDE,
	/// Указывает, что тип элемента не определен
	#[default]
	UNDEFINED,
}

/// Структура, описывающая элемент
pub struct BimJsonElement {
	/// [JSON] UUID идентификатор элемента
	pub uuid: String,
	/// [JSON] Название элемента
	pub name: String,
	/// [JSON] Полигон элемента
	pub polygon: bim_polygon_tools::polygon_t_rust,
	/// [JSON] Массив UUID элементов, которые являются соседними к элементу
	pub outputs: Vec<String>,
	/// Внутренний номер элемента (генерируется)
	pub id: u64,
	/// [JSON] Количество людей в элементе
	pub number_of_people: u64,
	/// [JSON] Высота элемента
	pub size_z: f64,
	/// Уровень, на котором находится элемент
	pub z_level: f64,
	/// [JSON] Тип элемента
	pub sign: BimElementSign,
}

/// Структура поля, описывающего географическое положение объекта
pub struct BimJsonAddress {
	/// [JSON] Название города
	pub city: String,
	/// [JSON] Название улицы
	pub street_address: String,
	/// [JSON] Дополнительная информация о местоположении объекта
	pub add_info: String,
}

/// Структура, описывающая этаж
pub struct BimJsonLevel {
	/// [JSON] Название этажа
	pub name: String,
	/// [JSON] Массив элементов, которые принадлежат этажу
	pub build_elements: Vec<BimJsonElement>,
	/// [JSON] Высота этажа над нулевой отметкой
	pub z_level: f64,
}

/// Структура, описывающая здание
pub struct BimJsonObject {
	/// [JSON] Информация о местоположении объекта
	pub address: BimJsonAddress,
	/// [JSON] Название здания
	pub building_name: String,
	/// [JSON] Массив уровней здания
	pub levels: Vec<BimJsonLevel>,
}

pub fn bim_json_object_new(path_to_file: &str) -> BimJsonObject {
	let building = parse_building_from_json(path_to_file)
		.unwrap_or_else(|e| panic!("Failed to parse building. Error: {e}"));
	let mut bim_element_rs_id: u64 = 0;
	let mut bim_element_d_id: u64 = 0;

	let json_object = BimJsonObject {
		address: BimJsonAddress {
			city: building.address.city,
			street_address: building.address.street_address,
			add_info: building.address.add_info,
		},
		building_name: building.building_name,
		levels: building
			.levels
			.iter()
			.map(|level| BimJsonLevel {
				name: level.name.clone(),
				z_level: level.z_level,
				build_elements: level
					.build_elements
					.iter()
					.map(|element| BimJsonElement {
						uuid: element.id.clone(),
						name: element.name.clone(),
						id: match element.sign.as_str() {
							"Room" | "Staircase" => {
								let id = bim_element_rs_id;
								bim_element_rs_id += 1;
								id
							}
							"DoorWay" | "DoorWayInt" | "DoorWayOut" => {
								let id = bim_element_d_id;
								bim_element_d_id += 1;
								id
							}
							element_type => {
								panic!("Неизвестный тип элемента здания: {}", element_type)
							}
						},
						size_z: element.size_z,
						z_level: level.z_level,
						number_of_people: element.number_of_people,
						sign: match element.sign.as_str() {
							"Room" => BimElementSign::ROOM,
							"Staircase" => BimElementSign::STAIRCASE,
							"DoorWay" => BimElementSign::DOOR_WAY,
							"DoorWayInt" => BimElementSign::DOOR_WAY_IN,
							"DoorWayOut" => BimElementSign::DOOR_WAY_OUT,
							_ => BimElementSign::UNDEFINED,
						},
						outputs: element.outputs.clone(),
						polygon: bim_polygon_tools::polygon_t_rust {
							points: element.xy[0].points.clone(),
						},
					})
					.collect::<Vec<BimJsonElement>>(),
			})
			.collect::<Vec<BimJsonLevel>>(),
	};

	json_object
}
