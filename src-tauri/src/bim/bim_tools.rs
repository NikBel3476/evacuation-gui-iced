use super::bim_json_object::{BimElementSign, BimJsonObject};
use super::bim_polygon_tools::{
	is_intersect_line, is_point_in_polygon, nearest_point, Line, Polygon,
};
use super::json_object::Point;
use libc::c_double;
use std::cmp::Ordering;

/// Структура, расширяющая элемент DOOR_*
#[derive(Debug, Clone, Default)]
pub struct BimTransit {
	/// UUID идентификатор элемента
	pub uuid: String,
	/// Внутренний номер элемента
	pub id: u64,
	/// Название элемента
	pub name: String,
	/// Массив UUID элементов, которые являются соседними
	pub outputs: Vec<String>,
	/// Полигон элемента
	pub polygon: Polygon,
	/// Высота элемента
	pub size_z: f64,
	/// Уровень, на котором находится элемент
	pub z_level: f64,
	/// Ширина проема/двери
	pub width: f64,
	/// Количество людей, которые прошли через элемент
	pub no_proceeding: f64,
	/// Тип элемента
	pub sign: BimElementSign,
	/// Признак посещения элемента
	pub is_visited: bool,
	/// Признак недоступности элемента для движения
	pub is_blocked: bool,
}

/// Структура, расширяющая элемент типа ROOM и STAIR
#[derive(Debug, Clone, Default)]
pub struct BimZone {
	/// UUID идентификатор элемента
	pub uuid: String,
	/// Внутренний номер элемента
	pub id: u64,
	/// Название элемента
	pub name: String,
	/// Полигон элемента
	pub polygon: Polygon,
	/// Массив UUID элементов, которые являются соседними
	pub outputs: Vec<String>,
	/// Высота элемента
	pub size_z: f64,
	/// Уровень, на котором находится элемент
	pub z_level: f64,
	/// Количество людей в элементе
	pub number_of_people: f64,
	/// Время достижения безопасной зоны
	pub potential: f64,
	/// Площадь элемента
	pub area: f64,
	/// Уровень опасности, % (0, 10, 20, ..., 90, 100)
	pub hazard_level: u8,
	/// Тип элемента
	pub sign: BimElementSign,
	/// Признак посещения элемента
	pub is_visited: bool,
	/// Признак недоступности элемента для движения
	pub is_blocked: bool,
	/// Признак безопасности зоны, т.е. в эту зону возможна эвакуация
	pub is_safe: bool,
}

/// Структура, описывающая этаж
pub struct BimLevel {
	/// Массив зон, которые принадлежат этажу
	pub zones: Vec<BimZone>,
	/// Массив переходов, которые принадлежат этажу
	pub transits: Vec<BimTransit>,
	/// Название этажа
	pub name: String,
	/// Высота этажа над нулевой отметкой
	pub z_level: f64,
}

/// Структура, описывающая здание
pub struct Bim {
	/// Массив уровней здания
	pub levels: Vec<BimLevel>,
	/// Название здания
	pub name: String,
	/// Список зон объекта
	pub zones: Vec<BimZone>,
	/// Список переходов объекта
	pub transits: Vec<BimTransit>,
}

pub fn intersected_edge(polygon_element: &Polygon, line: &Line) -> Line {
	let mut line_intersected = Line {
		p1: Point { x: 0.0, y: 0.0 },
		p2: Point { x: 0.0, y: 0.0 },
	};

	let mut num_of_intersections = 0;
	for i in 1..polygon_element.points.len() {
		// FIXME: bypass to get double mut ref
		let (left, right) = polygon_element.points.split_at(i);
		let point_element_a = left.last().unwrap_or_else(|| {
			panic!("Failed to get last element of left part at intersected_edge_rust fn in bim_tools crate");
		});
		let point_element_b = right.first().unwrap_or_else(|| {
			panic!("Failed to get first element of right part at intersected_edge_rust fn in bim_tools crate");
		});
		let line_tmp = Line {
			p1: *point_element_a,
			p2: *point_element_b,
		};
		let is_intersected = is_intersect_line(line, &line_tmp);
		if is_intersected {
			line_intersected.p1 = *point_element_a;
			line_intersected.p2 = *point_element_b;
			num_of_intersections += 1;
		}
	}

	if num_of_intersections != 1 {
		panic!("[func: intersected_edge_rust] :: Ошибка геометрии. Проверьте правильность ввода дверей и виртуальных проемов.");
	}

	line_intersected
}

/// Возможные варианты стыковки помещений, которые соединены проемом
///
/// Код ниже определяет область их пересечения
/// ```ignore
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
pub fn door_way_width(zone1: &Polygon, zone2: &Polygon, edge1: &Line, edge2: &Line) -> c_double {
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
	let length1 = l1p1.distance_to(&l1p2);

	let l2p1 = edge1.p1;
	let l2p2 = edge2.p2;
	let length2 = l2p1.distance_to(&l2p2);

	// Короткая линия проема, которая пересекает оба помещения
	let d_line = match length1.total_cmp(&length2) {
		Ordering::Greater | Ordering::Equal => Line { p1: l2p1, p2: l2p2 },
		Ordering::Less => Line { p1: l1p1, p2: l1p2 },
	};

	// Линии, которые находятся друг напротив друга и связаны проемом
	let edge_element_a = intersected_edge(zone1, &d_line);
	let edge_element_b = intersected_edge(zone2, &d_line);

	// Поиск точек, которые являются ближайшими к отрезку edgeElement
	// Расстояние между этими точками и является шириной проема
	let point1 = nearest_point(&edge_element_a.p1, &edge_element_b);
	let point2 = nearest_point(&edge_element_a.p2, &edge_element_b);
	let distance12 = point1.distance_to(&point2);

	let point3 = nearest_point(&edge_element_b.p1, &edge_element_a);
	let point4 = nearest_point(&edge_element_b.p2, &edge_element_a);
	let distance34 = point3.distance_to(&point4);

	(distance12 + distance34) * 0.5
}

pub fn outside_init_rust(bim_json: &BimJsonObject) -> BimZone {
	let mut outputs: Vec<String> = vec![];
	let mut id = 0u64;

	for level in &bim_json.levels {
		for element in &level.build_elements {
			match element.sign {
				BimElementSign::DoorWayOut => {
					outputs.push(element.uuid.clone());
				}
				BimElementSign::Room | BimElementSign::Staircase => {
					id += 1;
				}
				_ => {}
			}
		}
	}

	if outputs.is_empty() {
		panic!("Failed to find any output at outside_init_rust fn in bim_tools crate")
	}

	BimZone {
		id,
		name: String::from("Outside"),
		sign: BimElementSign::Outside,
		polygon: Polygon::default(),
		uuid: String::from("outside0-safe-zone-0000-000000000000"),
		z_level: 0.0,
		size_z: f64::from(f32::MAX),
		hazard_level: 0,
		potential: 0.0,
		area: f64::from(f32::MAX),
		outputs,
		is_blocked: false,
		is_visited: false,
		is_safe: true,
		number_of_people: 0.0,
	}
}

/// Устанавливает в помещение заданное количество людей
pub fn set_people_to_zone(zone: &mut BimZone, num_of_people: f64) {
	zone.number_of_people = num_of_people;
}

/// Вычисление ширины проема по данным из модели здания
///
/// # Parameters:
/// * zones Список всех зон
/// * transits - Список всех переходов
///
/// # Returns
/// Ширина проёма
pub fn calculate_transits_width(zones: &[BimZone], transits: &mut [BimTransit]) {
	for transit in transits {
		let mut stair_sign_counter = 0u8; // Если stair_sign_counter = 2, то проем межэтажный (между лестницами)
		let mut related_zones = [BimZone::default(), BimZone::default()];

		for (i, output) in transit.outputs.iter().enumerate() {
			let zone = zones.iter().find(|zone| zone.uuid.eq(output)).unwrap_or_else(|| {
				panic!(
					"Failed to find an element connected to transit. Transit id: {}, Transit uuid: {}, Transit name: {}",
					transit.id,
					transit.uuid,
					transit.name
				);
			});

			if zone.sign == BimElementSign::Staircase {
				stair_sign_counter += 1;
			}
			related_zones[i] = zone.clone();
		}

		if stair_sign_counter == 2 {
			// => Межэтажный проем
			transit.width = ((related_zones[0].area + related_zones[1].area) / 2.0).sqrt();
			continue;
		}

		let mut edge1 = Line {
			p1: Point::default(),
			p2: Point::default(),
		};
		let mut edge2 = Line {
			p1: Point::default(),
			p2: Point::default(),
		};
		let mut edge1_number_of_points = 2usize;
		let mut edge2_number_of_points = 2usize;

		for tpoint in &transit.polygon.points {
			let point_in_polygon = is_point_in_polygon(tpoint, &related_zones[0].polygon);

			match point_in_polygon {
				true => {
					match edge1_number_of_points {
						2 => edge1.p1 = *tpoint,
						1 => edge1.p2 = *tpoint,
						_ => continue,
					}
					edge1_number_of_points -= 1;
				}
				false => {
					match edge2_number_of_points {
						2 => edge2.p1 = *tpoint,
						1 => edge2.p2 = *tpoint,
						_ => continue,
					}
					edge2_number_of_points -= 1;
				}
			}
		}

		let mut width = -1f64;
		if edge1_number_of_points > 0 {
			panic!(
				"Failed to calculate width of transit. Transit id: {}, Transit uuid: {}, Transit name: {}",
				transit.id,
				transit.uuid,
				transit.name
			);
		}

		match transit.sign {
			BimElementSign::DoorWayIn | BimElementSign::DoorWayOut => {
				let width1 = edge1.p1.distance_to(&edge1.p2);
				let width2 = edge2.p1.distance_to(&edge2.p2);

				width = (width1 + width2) / 2.0;
			}
			BimElementSign::DoorWay => {
				width = door_way_width(
					&related_zones[0].polygon,
					&related_zones[1].polygon,
					&edge1,
					&edge2,
				);
			}
			_ => {}
		}

		transit.width = width;

		if transit.width < 0.0 {
			panic!(
				"Width of transit is not defined. Transit id: {}, Transit uuid: {}, Transit name: {}, Transit width: {}",
				transit.id,
				transit.uuid,
				transit.name,
				transit.width
			);
		} else if transit.width < 0.5 {
			eprintln!(
				"Warning: Width of transit is less than 0.5. Transit id: {}, Transit uuid: {}, Transit name: {}, Transit width: {}",
				transit.id,
				transit.uuid,
				transit.name,
				transit.width
			);
		}
	}
}

pub fn bim_tools_new_rust(bim_json: &BimJsonObject) -> Bim {
	let mut zones_list: Vec<BimZone> = vec![];
	let mut transits_list: Vec<BimTransit> = vec![];
	let mut levels_list: Vec<BimLevel> = vec![];

	for level_json in &bim_json.levels {
		let mut zones: Vec<BimZone> = vec![];
		let mut transits: Vec<BimTransit> = vec![];

		for build_element_json in &level_json.build_elements {
			let id = build_element_json.id;
			let uuid = build_element_json.uuid.clone();
			let name = build_element_json.name.clone();
			let size_z = build_element_json.size_z;
			let z_level = build_element_json.z_level;
			let sign = build_element_json.sign;
			let outputs = build_element_json.outputs.clone();
			let polygon = build_element_json.polygon.clone();
			// TODO: replace string on enum
			match build_element_json.sign {
				BimElementSign::Room | BimElementSign::Staircase => {
					let zone = BimZone {
						id,
						uuid,
						name,
						size_z,
						z_level,
						sign,
						// FIXME: unsafe cast u64 to f64
						number_of_people: build_element_json.number_of_people as f64,
						outputs,
						area: polygon.area(),
						polygon,
						is_blocked: false,
						is_visited: false,
						is_safe: false,
						potential: f64::from(f32::MAX),
						hazard_level: 0,
					};
					zones.push(zone.clone());
					zones_list.push(zone);
				}
				BimElementSign::DoorWay
				| BimElementSign::DoorWayOut
				| BimElementSign::DoorWayIn => {
					let transit = BimTransit {
						id,
						name,
						uuid,
						size_z,
						z_level,
						sign,
						outputs,
						polygon,
						is_blocked: false,
						is_visited: false,
						no_proceeding: 0.0,
						width: -1.0, //Calculated below
					};
					transits.push(transit.clone());
					transits_list.push(transit);
				}
				_ => {}
			}
		}

		let bim_level = BimLevel {
			name: level_json.name.clone(),
			z_level: level_json.z_level,
			zones,
			transits,
		};

		match bim_level.zones.is_empty() || bim_level.transits.is_empty() {
			true => {
				eprintln!(
					"[func: bim_tools_new] :: number of zones ({}) or number of transits ({}) is zero",
					bim_level.zones.len(),
					bim_level.transits.len()
				);
			}
			false => {}
		}

		levels_list.push(bim_level);
	}

	let outside = outside_init_rust(bim_json);
	zones_list.push(outside);

	zones_list.sort_by(|a, b| a.id.cmp(&b.id));
	transits_list.sort_by(|a, b| a.id.cmp(&b.id));

	calculate_transits_width(&zones_list, &mut transits_list);

	Bim {
		transits: transits_list,
		zones: zones_list,
		levels: levels_list,
		name: bim_json.building_name.clone(),
	}
}

pub fn bim_tools_get_area_bim(bim: &Bim) -> f64 {
	let mut area = 0.0;
	for level in &bim.levels {
		for zone in &level.zones {
			if zone.sign == BimElementSign::Room || zone.sign == BimElementSign::Staircase {
				area += zone.area;
			}
		}
	}

	area
}

/// Подсчитывает количество людей в здании по расширенной структуре
pub fn bim_tools_get_num_of_people(bim: &Bim) -> f64 {
	bim.zones.iter().fold(0.0, |acc, zone| match zone.sign {
		BimElementSign::Outside => acc,
		_ => acc + zone.number_of_people,
	})
}
