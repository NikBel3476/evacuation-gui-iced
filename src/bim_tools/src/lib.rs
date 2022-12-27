#![allow(non_camel_case_types)]

use bim_json_object::bim_json_object_t_rust;

/// Количество символов в UUID + NUL символ
#[repr(C)]
pub struct uuid_t {
	x: *const [char; 36 + 1],
}

/// Структура, расширяющая элемент DOOR_*
#[repr(C)]
pub struct bim_transit_t {
	///< UUID идентификатор элемента
	uuid: uuid_t,
	///< Внутренний номер элемента
	id: u64,
	///< Название элемента
	name: *mut char,
	///< Массив UUID элементов, которые являются соседними
	outputs: uuid_t,
	///< Полигон элемента
	polygon: *mut polygon_t,
	///< Высота элемента
	size_z: f64,
	///< Уровень, на котором находится элемент
	z_level: f64,
	///< Ширина проема/двери
	width: f64,
	///< Количество людей, которые прошли через элемент
	nop_proceeding: f64,
	///< Тип элемента
	sign: u8,
	///< Количество связанных с текущим элементов
	numofoutputs: u8,
	///< Признак посещения элемента
	is_visited: bool,
	///< Признак недоступности элемента для движения
	is_blocked: bool,
}

/// Структура, расширяющая элемент типа ROOM и STAIR
#[repr(C)]
pub struct bim_zone_t {
	///< UUID идентификатор элемента
	uuid: uuid_t,
	///< Внутренний номер элемента
	id: u64,
	///< Название элемента
	name: *const str,
	///< Полигон элемента
	polygon: polygon_t,
	///< Массив UUID элементов, которые являются соседними
	outputs: uuid_t,
	///< Высота элемента
	size_z: f64,
	///< Уровень, на котором находится элемент
	z_level: f64,
	///< Количество людей в элементе
	numofpeople: f64,
	///< Время достижения безопасной зоны
	potential: f64,
	///< Площадь элемента
	area: f64,
	///< Уровень опасности, % (0, 10, 20, ..., 90, 100)
	hazard_level: u8,
	///< Тип элемента
	sign: u8,
	///< Количество связанных с текущим элементов
	numofoutputs: u8,
	///< Признак посещения элемента
	is_visited: bool,
	///< Признак недоступности элемента для движения
	is_blocked: bool,
	///< Признак безопасности зоны, т.е. в эту зону возможна эвакуация
	is_safe: bool,
}

/// Структура, описывающая этаж
#[repr(C)]
pub struct bim_level_t {
	///< Массив зон, которые принадлежат этажу
	zones: bim_zone_t,
	///< Массив переходов, которые принадлежат этажу
	transits: bim_transit_t,
	///< Название этажа
	name: *const str,
	///< Высота этажа над нулевой отметкой
	z_level: f64,
	///< Количство зон на этаже
	numofzones: u16,
	///< Количство переходов на этаже
	numoftransits: u16,
}

/// Структура, описывающая здание
#[repr(C)]
pub struct bim_t {
	///< Массив уровней здания
	levels: bim_level_t,
	///< Название здания
	name: *const str,
	///< Список зон объекта
	zones: Vec<bim_zone_t>,
	///< Список переходов объекта
	transits: Vec<bim_transit_t>,
	///< Количество уровней в здании
	numoflevels: u8,
}

// #[no_mangle]
// pub extern "C" fn bim_tools_new(building: *const bim_json_object_t_rust) -> *mut bim_t {
// 	let bim = bim_json_object_t_rust {
// 		numoflevels: building.levels.len(),
// 		levels: bim_level_t {
// 			z_level:
// 		}
// 	};
//
// 	std::memory::forget(bim);
// 	bim.as_ptr()
// }
