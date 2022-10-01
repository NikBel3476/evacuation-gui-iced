#![allow(non_camel_case_types)]

use json_object::BuildingStruct;

/// Количество символов в UUID + NUL символ
#[repr(C)]
pub struct uuid_t {
	x: *const [char; 36 + 1]
}

/// Структура, расширяющая элемент DOOR_*
#[repr(C)]
pub struct bim_transit_t {
	uuid: uuid_t,        ///< UUID идентификатор элемента
	id: u64,             ///< Внутренний номер элемента
	name: char,          ///< Название элемента
	outputs: uuid_t,     ///< Массив UUID элементов, которые являются соседними
	polygon: polygon_t,  ///< Полигон элемента
	size_z: f64,         ///< Высота элемента
	z_level: f64,        ///< Уровень, на котором находится элемент
	width: f64,          ///< Ширина проема/двери
	nop_proceeding: f64, ///< Количество людей, которые прошли через элемент
	sign: u8,            ///< Тип элемента
	numofoutputs: u8,    ///< Количество связанных с текущим элементов
	is_visited: bool,    ///< Признак посещения элемента
	is_blocked: bool     ///< Признак недоступности элемента для движения
}

/// Структура, расширяющая элемент типа ROOM и STAIR
#[repr(C)]
pub struct bim_zone_t {
	uuid: uuid_t,       ///< UUID идентификатор элемента
	id: size_t,         ///< Внутренний номер элемента
	name: *const str,   ///< Название элемента
	polygon: polygon_t, ///< Полигон элемента
	outputs: uuid_t,    ///< Массив UUID элементов, которые являются соседними
	size_z: f64,        ///< Высота элемента
	z_level: f64,       ///< Уровень, на котором находится элемент
	numofpeople: f64,   ///< Количество людей в элементе
	potential: f64,     ///< Время достижения безопасной зоны
	area: f64,          ///< Площадь элемента
	hazard_level: u8,   ///< Уровень опасности, % (0, 10, 20, ..., 90, 100)
	sign: u8,           ///< Тип элемента
	numofoutputs: u8,   ///< Количество связанных с текущим элементов
	is_visited: bool,   ///< Признак посещения элемента
	is_blocked: bool,   ///< Признак недоступности элемента для движения
	is_safe: bool       ///< Признак безопасности зоны, т.е. в эту зону возможна эвакуация
}

/// Структура, описывающая этаж
#[repr(C)]
pub struct bim_level_t {
	zones: bim_zone_t,       ///< Массив зон, которые принадлежат этажу
	transits: bim_transit_t, ///< Массив переходов, которые принадлежат этажу
	name: *const str,        ///< Название этажа
	z_level: f64,            ///< Высота этажа над нулевой отметкой
	numofzones: u16,         ///< Количство зон на этаже
	numoftransits: u16       ///< Количство переходов на этаже
}

/// Структура, описывающая здание
#[repr(C)]
pub struct bim_t {
	levels: bim_level_t,          ///< Массив уровней здания
	name: *const str,             ///< Название здания
	zones: Vec<bim_zone_t>,       ///< Список зон объекта
	transits: Vec<bim_transit_t>, ///< Список переходов объекта
	numoflevels: u8               ///< Количество уровней в здании
}

/*#[no_mangle]
pub extern "C" fn bim_tools_new(building: &mut BuildingStruct) -> *const bim_t {
	let bim = BuildingStruct {
		numoflevels: building.levels.len(),
		levels: bim_level_t {
			z_level:
		}
	};

	std::memory::forget(bim);
	bim.as_ptr()
}*/