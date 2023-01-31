use json_object::parse_building_from_json;
use libc::{c_char, c_double, c_ulonglong};
use std::convert::TryInto;
use std::ffi::{CStr, CString};

/// Количество символов в UUID + NUL символ
#[repr(C)]
pub struct uuid_t {
	pub x: [c_char; 36 + 1],
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

#[repr(C)]
pub enum bim_element_sign_t_rust {
	/// Указывает, что элемент здания является помещением/комнатой
	ROOM = 0,
	/// Указывает, что элемент здания является лестницей
	STAIRCASE = 1,
	/// Указывает, что элемент здания является проемом (без дверного полотна)
	DOOR_WAY = 2,
	/// Указывает, что элемент здания является дверью, которая соединяет два элемента: ROOM и ROOM или ROOM и STAIR
	DOOR_WAY_INT = 3,
	/// Указывает, что элемент здания является эвакуационным выходом
	DOOR_WAY_OUT = 4,
	/// Указывает, что элемент является зоной вне здания
	OUTSIDE = 5,
	/// Указывает, что тип элемента не определен
	UNDEFINDED = 6,
}

#[derive(Debug, Clone)]
pub enum BimElementSign {
	/// Указывает, что элемент здания является помещением/комнатой
	ROOM,
	/// Указывает, что элемент здания является лестницей
	STAIRCASE,
	/// Указывает, что элемент здания является проемом (без дверного полотна)
	DOOR_WAY,
	/// Указывает, что элемент здания является дверью, которая соединяет два элемента: ROOM и ROOM или ROOM и STAIR
	DOOR_WAY_INT,
	/// Указывает, что элемент здания является эвакуационным выходом
	DOOR_WAY_OUT,
	/// Указывает, что элемент является зоной вне здания
	OUTSIDE,
	/// Указывает, что тип элемента не определен
	UNDEFINED,
}

/// Структура, описывающая элемент
#[repr(C)]
pub struct bim_json_element_t_rust {
	/// [JSON] UUID идентификатор элемента
	pub uuid: uuid_t,
	/// [JSON] Название элемента
	pub name: *const c_char,
	/// [JSON] Полигон элемента
	pub polygon: *mut polygon_t_rust,
	/// [JSON] Массив UUID элементов, которые являются соседними к элементу
	pub outputs: *mut uuid_t,
	/// Внутренний номер элемента (генерируется)
	pub id: c_ulonglong,
	/// [JSON] Количество людей в элементе
	pub numofpeople: c_ulonglong,
	/// Количество связанных с текущим элементов
	pub numofoutputs: c_ulonglong,
	/// [JSON] Высота элемента
	pub size_z: c_double,
	/// Уровень, на котором находится элемент
	pub z_level: c_double,
	/// [JSON] Тип элемента
	pub sign: bim_element_sign_t_rust,
}

/// Структура поля, описывающего географическое положение объекта
#[repr(C)]
pub struct bim_json_address_t_rust {
	/// [JSON] Название города
	pub city: *const c_char,
	/// [JSON] Название улицы
	pub street_address: *const c_char,
	/// [JSON] Дополнительная информация о местоположении объекта
	pub add_info: *const c_char,
}

/// Структура, описывающая этаж
#[repr(C)]
pub struct bim_json_level_t_rust {
	/// [JSON] Название этажа
	pub name: *const c_char,
	/// [JSON] Массив элементов, которые принадлежат этажу
	pub elements: *mut bim_json_element_t_rust,
	/// [JSON] Высота этажа над нулевой отметкой
	pub z_level: c_double,
	/// Количство элементов на этаже
	pub numofelements: c_ulonglong,
}

/// Структура, описывающая здание
#[repr(C)]
pub struct bim_json_object_t_rust {
	/// [JSON] Информация о местоположении объекта
	pub address: *mut bim_json_address_t_rust,
	/// [JSON] Название здания
	pub name: *const c_char,
	/// [JSON] Массив уровней здания
	pub levels: *mut bim_json_level_t_rust,
	/// Количество уровней в здании
	pub numoflevels: c_ulonglong,
}

#[allow(clippy::not_unsafe_ptr_arg_deref)]
#[no_mangle]
pub extern "C" fn bim_json_new(path_to_file: *const c_char) -> *const bim_json_object_t_rust {
	let building = unsafe {
		parse_building_from_json(CStr::from_ptr(path_to_file).to_str().unwrap())
			.expect("Ошибка парсинга здания")
	};
	let mut bim_element_rs_id: u64 = 0;
	let mut bim_element_d_id: u64 = 0;

	let bim_json_object = bim_json_object_t_rust {
		address: Box::into_raw(Box::new(bim_json_address_t_rust {
			city: CString::new(building.address.city).unwrap().into_raw(),
			street_address: CString::new(building.address.street_address)
				.unwrap()
				.into_raw(),
			add_info: CString::new(building.address.add_info).unwrap().into_raw(),
		})),
		numoflevels: c_ulonglong::try_from(building.levels.len()).unwrap(),
		name: CString::new(building.name_building).unwrap().into_raw(),
		levels: {
			let mut levels = building
				.levels
				.iter()
				.map(|level| bim_json_level_t_rust {
					name: CString::new(level.name.clone()).unwrap().into_raw(),
					numofelements: c_ulonglong::try_from(level.build_elements.len()).unwrap(),
					z_level: level.z_level,
					elements: {
						let mut build_elements = level
							.build_elements
							.iter()
							.map(|element| bim_json_element_t_rust {
								uuid: uuid_t {
									x: {
										let mut char_vec = element
											.id
											.clone()
											.chars()
											.map(|c| match c.is_ascii() {
												true => c as c_char,
												false => panic!("uuid символ вне диапазона ASCII"),
											})
											.collect::<Vec<c_char>>();
										char_vec.push(0 as c_char);
										char_vec.try_into().unwrap_or_else(|v| {
											panic!("Не удалось преобразовать uuid в массив char длиной 37: {:?}", v)
										})
									},
								},
								name: CString::new(element.name.clone()).unwrap().into_raw(),
								id: match element.sign.as_str() {
									"Room" => {
										let id = bim_element_rs_id;
										bim_element_rs_id += 1;
										id
									}
									"Staircase" => {
										let id = bim_element_rs_id;
										bim_element_rs_id += 1;
										id
									}
									"DoorWay" => {
										let id = bim_element_d_id;
										bim_element_d_id += 1;
										id
									}
									"DoorWayInt" => {
										let id = bim_element_d_id;
										bim_element_d_id += 1;
										id
									}
									"DoorWayOut" => {
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
								numofpeople: element.number_of_people,
								numofoutputs: c_ulonglong::try_from(element.outputs.len()).unwrap(),
								sign: match element.sign.as_str() {
									"Room" => bim_element_sign_t_rust::ROOM,
									"Staircase" => bim_element_sign_t_rust::STAIRCASE,
									"DoorWay" => bim_element_sign_t_rust::DOOR_WAY,
									"DoorWayInt" => bim_element_sign_t_rust::DOOR_WAY_INT,
									"DoorWayOut" => bim_element_sign_t_rust::DOOR_WAY_OUT,
									_ => bim_element_sign_t_rust::UNDEFINDED,
								},
								outputs: {
									let mut outputs = element
										.outputs
										.iter()
										.map(|output| uuid_t {
											x: {
												let mut char_vec = output
													.clone()
													.chars()
													.map(|c| match c.is_ascii() {
														true => c as c_char,
														false => panic!(
															"uuid символ вне диапазона ASCII: {}",
															c
														),
													})
													.collect::<Vec<c_char>>();
												char_vec.push(0 as c_char);
												char_vec.try_into().unwrap_or_else(|v| {
													panic!("Не удалось преобразовать uuid в массив char длиной 37: {:?}", v)
												})
											},
										})
										.collect::<Vec<uuid_t>>();

									let ptr = outputs.as_mut_ptr();
									std::mem::forget(outputs);

									ptr
								},
								polygon: Box::into_raw(Box::new(polygon_t_rust {
									numofpoints: c_ulonglong::try_from(element.xy[0].points.len())
										.unwrap(),
									points: {
										let mut points = element.xy[0]
											.points
											.iter()
											.map(|point| point_t_rust {
												x: point.x,
												y: point.y,
											})
											.collect::<Vec<point_t_rust>>();

										let ptr = points.as_mut_ptr();
										std::mem::forget(points);

										ptr
									},
								})),
							})
							.collect::<Vec<bim_json_element_t_rust>>();

						let build_elements_ptr = build_elements.as_mut_ptr();
						std::mem::forget(build_elements);

						build_elements_ptr
					},
				})
				.collect::<Vec<bim_json_level_t_rust>>();

			let levels_ptr = levels.as_mut_ptr();
			std::mem::forget(levels);

			levels_ptr
		},
	};

	Box::into_raw(Box::new(bim_json_object))
}
