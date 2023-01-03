#![allow(non_camel_case_types)]

use bim_json_object::{bim_element_sign_t_rust, bim_json_object_t_rust, uuid_t};
use bim_polygon_tools::{
	geom_tools_is_intersect_line_rust, geom_tools_length_side_rust, geom_tools_nearest_point_rust,
	line_t, point_t, polygon_t,
};
use libc::{c_char, c_double, c_int};
use std::cmp::Ordering;
use std::ffi::CString;

/// Структура, расширяющая элемент DOOR_*
#[repr(C)]
pub struct bim_transit_t {
	/// UUID идентификатор элемента
	uuid: uuid_t,
	/// Внутренний номер элемента
	id: u64,
	/// Название элемента
	name: *mut char,
	/// Массив UUID элементов, которые являются соседними
	outputs: uuid_t,
	/// Полигон элемента
	polygon: *mut polygon_t,
	/// Высота элемента
	size_z: f64,
	/// Уровень, на котором находится элемент
	z_level: f64,
	/// Ширина проема/двери
	width: f64,
	/// Количество людей, которые прошли через элемент
	nop_proceeding: f64,
	/// Тип элемента
	sign: u8,
	/// Количество связанных с текущим элементов
	numofoutputs: u8,
	/// Признак посещения элемента
	is_visited: bool,
	/// Признак недоступности элемента для движения
	is_blocked: bool,
}

/// Структура, расширяющая элемент типа ROOM и STAIR
#[repr(C)]
pub struct bim_zone_t {
	/// UUID идентификатор элемента
	uuid: uuid_t,
	/// Внутренний номер элемента
	id: u64,
	/// Название элемента
	name: *mut c_char,
	/// Полигон элемента
	polygon: *mut polygon_t,
	/// Массив UUID элементов, которые являются соседними
	outputs: *mut uuid_t,
	/// Высота элемента
	size_z: f64,
	/// Уровень, на котором находится элемент
	z_level: f64,
	/// Количество людей в элементе
	numofpeople: f64,
	/// Время достижения безопасной зоны
	potential: f64,
	/// Площадь элемента
	area: f64,
	/// Уровень опасности, % (0, 10, 20, ..., 90, 100)
	hazard_level: u8,
	/// Тип элемента
	sign: u8,
	/// Количество связанных с текущим элементов
	numofoutputs: u8,
	/// Признак посещения элемента
	is_visited: bool,
	/// Признак недоступности элемента для движения
	is_blocked: bool,
	/// Признак безопасности зоны, т.е. в эту зону возможна эвакуация
	is_safe: bool,
}

/// Структура, описывающая этаж
#[repr(C)]
pub struct bim_level_t {
	/// Массив зон, которые принадлежат этажу
	zones: *mut bim_zone_t,
	/// Массив переходов, которые принадлежат этажу
	transits: *mut bim_transit_t,
	/// Название этажа
	name: *mut c_char,
	/// Высота этажа над нулевой отметкой
	z_level: f64,
	/// Количство зон на этаже
	numofzones: u16,
	/// Количство переходов на этаже
	numoftransits: u16,
}

/// Структура, описывающая здание
#[repr(C)]
pub struct bim_t {
	/// Массив уровней здания
	levels: *mut bim_level_t,
	/// Название здания
	name: *mut c_char,
	/// Список зон объекта
	zones: Vec<bim_zone_t>,
	/// Список переходов объекта
	transits: Vec<bim_transit_t>,
	/// Количество уровней в здании
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

#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn intersected_edge_rust(
	polygon_element: *const polygon_t,
	line: *mut line_t,
) -> *mut line_t {
	let polygon_element = unsafe {
		polygon_element.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer polygon_element at intersected_edge_rust fn in bim_tools crate")
		})
	};

	let line =
		unsafe {
			line.as_mut().unwrap_or_else(|| {
				panic!("Failed to dereference pointer line at intersected_edge_rust fn in bim_tools crate")
			})
		};

	let points = unsafe {
		std::slice::from_raw_parts_mut(polygon_element.points, polygon_element.numofpoints as usize)
	};

	let mut line_intersected = line_t {
		p1: &mut point_t { x: 0.0, y: 0.0 },
		p2: &mut point_t { x: 0.0, y: 0.0 },
	};

	let mut num_of_intersections = 0;
	for i in 1..polygon_element.numofpoints {
		// FIXME: bypass to get double mut ref
		let (left, right) = points.split_at_mut(i as usize);
		let point_element_a = left.last_mut().unwrap_or_else(|| {
			panic!("Failed to get last element of left part at intersected_edge_rust fn in bim_tools crate");
		});
		let point_element_b = right.first_mut().unwrap_or_else(|| {
			panic!("Failed to get first element of right part at intersected_edge_rust fn in bim_tools crate");
		});
		let line_tmp = line_t {
			p1: point_element_a,
			p2: point_element_b,
		};
		let is_intersected = geom_tools_is_intersect_line_rust(line, &line_tmp);
		if is_intersected == 1 {
			line_intersected.p1 = point_element_a;
			line_intersected.p2 = point_element_b;
			num_of_intersections += 1;
		}
	}

	if num_of_intersections != 1 {
		panic!("[func: intersected_edge_rust] :: Ошибка геометрии. Проверьте правильность ввода дверей и виртуальных проемов.");
	}

	Box::into_raw(Box::new(line_intersected))
}

/// Возможные варианты стыковки помещений, которые соединены проемом
///
/// Код ниже определяет область их пересечения
/// ```
/// +----+  +----+     +----+
///      |  |               | +----+
///      |  |               | |
///      |  |               | |
/// +----+  +----+          | |
///                         | +----+
/// +----+             +----+
///      |  +----+
///      |  |          +----+ +----+
///      |  |               | |
/// +----+  |               | |
///         +----+          | +----+
///                    +----+
/// ```
/// *************************************************************************
/// 1. Определить грани помещения, которые пересекает короткая сторона проема
/// 2. Вычислить среднее проекций граней друг на друга
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn width_door_way_rust(
	zone1: *const polygon_t,
	zone2: *const polygon_t,
	edge1: *const line_t,
	edge2: *const line_t,
) -> c_double {
	let zone1 = unsafe {
		zone1.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer zone1 at width_door_way fn in bim_tools crate")
		})
	};

	let zone2 = unsafe {
		zone2.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer zone2 at width_door_way fn in bim_tools crate")
		})
	};

	let edge1 = unsafe {
		edge1.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer edge1 at width_door_way fn in bim_tools crate")
		})
	};

	let edge2 = unsafe {
		edge2.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer edge2 at width_door_way fn in bim_tools crate")
		})
	};

	// TODO: l1p1 == l2p1 and l1p2 == l2p2 ??? figure out why this is so
	/* old c code
	point_t *l1p1 = edge1->p1;
	point_t *l1p2 = edge2->p2;
	double length1 = geom_tools_length_side_rust( l1p1, l1p2);

	point_t *l2p1 = edge1->p1;
	point_t *l2p2 = edge2->p2;
	double length2 = geom_tools_length_side_rust(l2p1, l2p2);
	 */
	let l1p1 = edge1.p1;
	let l1p2 = edge2.p2;
	let length1 = geom_tools_length_side_rust(l1p1, l1p2);

	let l2p1 = edge1.p1;
	let l2p2 = edge2.p2;
	let length2 = geom_tools_length_side_rust(l2p1, l2p2);

	// Короткая линия проема, которая пересекает оба помещения
	let mut d_line = match length1.total_cmp(&length2) {
		Ordering::Greater | Ordering::Equal => line_t { p1: l2p1, p2: l2p2 },
		Ordering::Less => line_t { p1: l1p1, p2: l1p2 },
	};

	// Линии, которые находятся друг напротив друга и связаны проемом
	let edge_element_a = unsafe {
		intersected_edge_rust(zone1, &mut d_line)
			.as_ref()
			.unwrap_or_else(|| {
				panic!("Failed to dereference pointer edge_element_a at width_door_way fn in bim_tools crate")
			})
	};
	let edge_element_b = unsafe {
		intersected_edge_rust(zone2, &mut d_line)
			.as_ref()
			.unwrap_or_else(|| {
				panic!("Failed to dereference pointer edge_element_b at width_door_way fn in bim_tools crate")
			})
	};

	// Поиск точек, которые являются ближайшими к отрезку edgeElement
	// Расстояние между этими точками и является шириной проема
	let point1 = geom_tools_nearest_point_rust(edge_element_a.p1, edge_element_b);
	let point2 = geom_tools_nearest_point_rust(edge_element_a.p2, edge_element_b);
	let distance12 = geom_tools_length_side_rust(point1, point2);

	let point3 = geom_tools_nearest_point_rust(edge_element_b.p1, edge_element_a);
	let point4 = geom_tools_nearest_point_rust(edge_element_b.p2, edge_element_a);
	let distance34 = geom_tools_length_side_rust(point3, point4);

	(distance12 + distance34) * 0.5
}

#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn outside_init_rust(bim_json: *const bim_json_object_t_rust) -> *mut bim_zone_t {
	let bim_json =
		unsafe {
			bim_json.as_ref().unwrap_or_else(|| {
				panic!("Failed to dereference pointer bim_json at outside_init_rust fn in bim_tools crate")
			})
		};

	let uuid: Vec<c_char> = "outside0-safe-zone-0000-000000000000\n"
		.chars()
		.map(|c| c as c_char)
		.collect();
	let mut outside = bim_zone_t {
		id: 0,
		name: CString::new("Outside").unwrap().into_raw(),
		sign: bim_element_sign_t_rust::OUTSIDE as u8,
		is_visited: false,
		polygon: std::ptr::null_mut(),
		uuid: uuid_t {
			x: uuid.try_into().unwrap_or_else(|v| {
				panic!("Failed to convert vector to [char; 37]. Vector: {:?}", v)
			}),
		},
		z_level: 0.0,
		size_z: f64::MAX,
		numofpeople: 0.0,
		hazard_level: 0,
		is_safe: true,
		numofoutputs: 0,
		potential: 0.0,
		area: 0.0,
		outputs: std::ptr::null_mut(),
		is_blocked: false,
	};

	let mut num_of_outputs: usize = 0;
	let mut outputs: Vec<uuid_t> = Vec::new();
	let levels =
		unsafe { std::slice::from_raw_parts(bim_json.levels, bim_json.numoflevels as usize) };

	for i in 0..bim_json.numoflevels {
		for j in 0..levels[i as usize].numofelements {
			let element = unsafe {
				std::slice::from_raw_parts(
					levels[i as usize].elements,
					levels[i as usize].numofelements as usize,
				)
				.get(j as usize)
				.expect("Failed to get element at outside_init_rust fn in bim_tools crate")
			};

			match element.sign {
				bim_element_sign_t_rust::DOOR_WAY_OUT => {
					outputs.push(uuid_t { x: element.uuid.x });
					num_of_outputs += 1;
				}
				bim_element_sign_t_rust::ROOM | bim_element_sign_t_rust::STAIRCASE => {
					outside.id += 1;
				}
				_ => (),
			}
		}
	}

	if num_of_outputs == 0 {
		panic!("Failed to find any output at outside_init fn in bim_tools crate")
	}

	outside.numofoutputs = num_of_outputs.try_into().unwrap_or_else(|e| {
		panic!(
			"Failed to convert usize to u32. usize: {}. Error: {:?}",
			num_of_outputs, e
		)
	});
	outside.outputs = outputs.as_mut_ptr();
	outside.is_blocked = false;
	outside.is_visited = false;
	outside.potential = 0.0;
	outside.area = f64::MAX;
	outside.numofpeople = 0.0;

	Box::into_raw(Box::new(outside))
}

/*/// Подсчитывает количество людей в здании по расширенной структуре
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn bim_tools_get_num_of_people_rust(bim: *const bim_t) -> c_double {
	let bim = unsafe {
		bim.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer bim at bim_tools_get_num_of_people_rust fn in bim_tools crate")
		})
	};

	let mut num_of_people = 0.0;
	let levels = unsafe { std::slice::from_raw_parts(bim.levels, bim.numoflevels as usize) };

	for level in levels {
		let zones = unsafe { std::slice::from_raw_parts(level.zones, level.numofzones as usize) };

		for zone in zones {
			num_of_people += zone.numofpeople;
		}
	}

	num_of_people
}*/

// FIXME: after replacing c function the simulation result has changed
/*/// Устанавливает в помещение заданное количество людей
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn bim_tools_set_people_to_zone_rust(zone: *mut bim_zone_t, num_of_people: f64) {
	let zone = unsafe {
		zone.as_mut().expect("Failed to dereference pointer zone at bim_tools_set_people_to_zone fn in bim_tools crate")
	};

	zone.numofpeople = num_of_people;
}*/

#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn find_zone_callback_rust(value1: *mut bim_zone_t, value2: *mut uuid_t) -> c_int {
	let zone = unsafe {
		value1.as_mut().expect(
			"Failed to dereference pointer value1 at find_zone_callback_rust fn in bim_tools crate",
		)
	};

	let uuid = unsafe {
		value2.as_mut().expect(
			"Failed to dereference pointer value2 at find_zone_callback_rust fn in bim_tools crate",
		)
	};

	for i in 0..uuid.x.len() {
		if zone.uuid.x[i] != uuid.x[i] {
			return 0;
		}
	}

	1
}
