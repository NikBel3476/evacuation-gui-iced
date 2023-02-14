use bim_graph::{bim_graph_t, bim_graph_t_rust};
use bim_json_object::{bim_element_sign_t_rust, BimElementSign};
use bim_tools::{
	bim_t_rust, bim_tools_get_area_bim, bim_transit_t, bim_transit_t_rust, bim_zone_t,
	bim_zone_t_rust,
};
use libc::{c_double, c_int};
use std::borrow::Borrow;
use std::cmp::Ordering;
use std::ptr::null_mut;

/// м/мин
static mut EVAC_SPEED_MAX: f64 = 100.0;
/// чел/м^2
static mut EVAC_DENSITY_MIN: f64 = 0.1;
/// чел/м^2
static mut EVAC_DENSITY_MAX: f64 = 5.0;
/// мин
static mut EVAC_MODELING_STEP: f64 = 0.01;
static mut EVAC_TIME: f64 = 0.0;

/// м/мин
static mut EVAC_SPEED_MAX_RUST: f64 = 100.0;
/// чел/м^2
static mut EVAC_DENSITY_MIN_RUST: f64 = 0.1;
/// чел/м^2
static mut EVAC_DENSITY_MAX_RUST: f64 = 5.0;
/// мин
static mut EVAC_MODELING_STEP_RUST: f64 = 0.01;
static mut EVAC_TIME_RUST: f64 = 0.0;

// TODO: change parameters naming
/// Функция скорости. Базовая зависимость, которая позволяет определить скорость
/// людского потока по его плотности
///
/// # Arguments
/// * `v0` - начальная скорость потока
/// * `a` - коэффициент вида пути
/// * `d` - текущая плотность людского потока на участке, чел./м2
/// * `d0` - допустимая плотность людского потока на участке, чел./м2
///
/// # Returns
/// скорость, м/мин.
#[no_mangle]
fn velocity_rust(v0: c_double, a: c_double, d: c_double, d0: c_double) -> c_double {
	v0 * (1.0 - a * (d / d0).ln())
}

/// Скорость потока в проёме
///
/// # Arguments
/// * `transit_width` - ширина проема, м
/// * `density_in_zone` - плотность в элементе, чел/м2
/// * `v_max` - максимальная скорость потока
///
/// # Returns
/// скорость потока в проеме в зависимости от плотности, м/мин
#[no_mangle]
pub extern "C" fn speed_through_transit_rust(
	transit_width: c_double,
	density_in_zone: c_double,
	v_max: c_double,
) -> c_double {
	let v0 = v_max;
	let d0 = 0.65;
	let a = 0.295;

	// TODO: add logging if v0k < 0
	match density_in_zone > d0 {
		true => {
			let m = match density_in_zone > 5.0 {
				true => 1.25 - 0.05 * density_in_zone,
				false => 1.0,
			};

			if density_in_zone >= 9.0 && transit_width < 1.6 {
				return 10.0 * (2.5 + 3.75 * transit_width) / d0;
			}

			velocity_rust(v0, a, density_in_zone, d0) * m
		}
		false => v0,
	}
}

/// Скорость потока в комнате
///
/// # Arguments
/// * `density_in_zone` - плотность в элементе, из которого выходит поток
/// * `v_max` - максимальная скорость потока
///
/// # Returns
/// Скорость потока по горизонтальному пути, м/мин
#[no_mangle]
pub extern "C" fn speed_in_room_rust(density_in_zone: c_double, v_max: c_double) -> c_double {
	let d0 = 0.51;

	match density_in_zone > d0 {
		true => velocity_rust(v_max, 0.295, density_in_zone, d0),
		false => v_max,
	}
}

/// Скорость потока на лестнице
///
/// # Arguments
/// * `density_in_zone` - плотность в элементе, из которого выходит поток
/// * `direction` - направление движения (1 - вверх, -1 - вниз)
///
/// # Returns
/// Скорость потока при движении по лестнице в зависимости от плотности, м/мин
#[no_mangle]
pub extern "C" fn evac_speed_on_stair_rust(
	density_in_zone: c_double,
	direction: c_int,
) -> c_double {
	let mut d0: c_double = 0.0;
	let mut v0: c_double = 0.0;
	let mut a: c_double = 0.0;

	match direction.cmp(0.borrow()) {
		Ordering::Greater => {
			d0 = 0.67;
			v0 = 50.0;
			a = 0.305;
		}
		Ordering::Less => {
			d0 = 0.89;
			v0 = 80.0;
			a = 0.4;
		}
		Ordering::Equal => {}
	}

	match density_in_zone > d0 {
		true => velocity_rust(v0, a, density_in_zone, d0),
		false => v0,
	}
}

/// Метод определения скорости движения людского потока по разным зонам
///
/// # Arguments
/// * `receiving_zone` - зона, в которую засасываются люди
/// * `transmitting_zone` - зона, из которой высасываются люди
///
/// # Returns
/// Скорость людского потока в зоне
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn speed_in_element_rust(
	receiving_zone: *const bim_zone_t,
	transmitting_zone: *const bim_zone_t,
) -> c_double {
	let receiving_zone = unsafe {
		receiving_zone.as_ref().expect("Failed to dereference pointer receiving_zone at speed_in_element_rust fn in bim_evac crate")
	};

	let transmitting_zone = unsafe {
		transmitting_zone.as_ref().expect("Failed to dereference pointer transmitting_zone at speed_in_element_rust fn in bim_evac crate")
	};

	let density_in_transmitting_zone = transmitting_zone.numofpeople / transmitting_zone.area;
	// По умолчанию, используется скорость движения по горизонтальной поверхности
	let mut v_zone = unsafe { speed_in_room_rust(density_in_transmitting_zone, EVAC_SPEED_MAX) };
	// Разница высот зон
	let dh = receiving_zone.z_level - transmitting_zone.z_level;

	// Если принимающее помещение является лестницей и находится на другом уровне,
	// то скорость будет рассчитываться как по наклонной поверхности
	if dh.abs() > 1e-3 && receiving_zone.sign == bim_element_sign_t_rust::STAIRCASE as u8 {
		/* Иначе определяем направление движения по лестнице
		 * -1 вниз, 1 вверх
		 *         ______   aGiverItem
		 *        /                         => direction = -1
		 *       /
		 * _____/           aReceivingItem
		 *      \
		 *       \                          => direction = 1
		 *        \______   aGiverItem
		 */
		let direction = if dh > 0.0 { -1 } else { 1 };
		v_zone = evac_speed_on_stair_rust(density_in_transmitting_zone, direction);
	}

	// TODO: Add logging
	// if v_zone < 0 { log() }

	v_zone
}

/// Метод определения скорости движения людского потока по разным зонам
///
/// # Arguments
/// * `receiving_zone` - зона, в которую засасываются люди
/// * `transmitting_zone` - зона, из которой высасываются люди
///
/// # Returns
/// Скорость людского потока в зоне
pub fn speed_in_element(
	receiving_zone: &bim_zone_t_rust,
	transmitting_zone: &bim_zone_t_rust,
) -> f64 {
	let density_in_transmitting_zone = transmitting_zone.number_of_people / transmitting_zone.area;
	// По умолчанию, используется скорость движения по горизонтальной поверхности
	let mut v_zone =
		unsafe { speed_in_room_rust(density_in_transmitting_zone, EVAC_SPEED_MAX_RUST) };
	// Разница высот зон
	let dh = receiving_zone.z_level - transmitting_zone.z_level;

	// Если принимающее помещение является лестницей и находится на другом уровне,
	// то скорость будет рассчитываться как по наклонной поверхности
	if dh.abs() > 1e-3 && receiving_zone.sign == BimElementSign::STAIRCASE {
		/* Иначе определяем направление движения по лестнице
		 * -1 вниз, 1 вверх
		 *         ______   aGiverItem
		 *        /                         => direction = -1
		 *       /
		 * _____/           aReceivingItem
		 *      \
		 *       \                          => direction = 1
		 *        \______   aGiverItem
		 */
		let direction = if dh > 0.0 { -1 } else { 1 };
		v_zone = evac_speed_on_stair_rust(density_in_transmitting_zone, direction);
	}

	// TODO: Add logging
	// if v_zone < 0 { log() }

	v_zone
}

/// Определение скорости на выходе из отдающего помещения
///
/// # Arguments
/// * `receiving_zone` - принимающая зона
/// * `transmitting_zone` - отдающая зона
/// * `transit_width` - ширина прохода
///
/// # Returns
/// Скорость на выходе из отдающего помещения
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn speed_at_exit_rust(
	receiving_zone: *const bim_zone_t,
	transmitting_zone: *const bim_zone_t,
	transit_width: c_double,
) -> c_double {
	let receiving_zone = unsafe {
		receiving_zone.as_ref().expect("Failed to dereference pointer receiving_zone at speed_at_exit_rust fn in bim_evac crate")
	};

	let transmitting_zone = unsafe {
		transmitting_zone.as_ref().expect("Failed to dereference pointer transmitting_zone at speed_at_exit_rust fn in bim_evac crate")
	};

	let zone_speed = speed_in_element_rust(receiving_zone, transmitting_zone);
	let density_in_transmitting_element = transmitting_zone.numofpeople / transmitting_zone.area;
	let transition_speed = unsafe {
		speed_through_transit_rust(
			transit_width,
			density_in_transmitting_element,
			EVAC_SPEED_MAX,
		)
	};

	zone_speed.min(transition_speed)
}

/// Определение скорости на выходе из отдающего помещения
///
/// # Arguments
/// * `receiving_zone` - принимающая зона
/// * `transmitting_zone` - отдающая зона
/// * `transit_width` - ширина прохода
///
/// # Returns
/// Скорость на выходе из отдающего помещения
pub fn speed_at_exit(
	receiving_zone: &bim_zone_t_rust,
	transmitting_zone: &bim_zone_t_rust,
	transit_width: f64,
) -> f64 {
	let zone_speed = speed_in_element(receiving_zone, transmitting_zone);
	let density_in_transmitting_element =
		transmitting_zone.number_of_people / transmitting_zone.area;
	let transition_speed = unsafe {
		speed_through_transit_rust(
			transit_width,
			density_in_transmitting_element,
			EVAC_SPEED_MAX_RUST,
		)
	};

	zone_speed.min(transition_speed)
}

// TODO: complete docs comment
///
///
/// # Arguments
/// * `transmitting_zone` - отдающая зона
/// * `transit_width` - ширина прохода
/// * `speed_at_exit` - Скорость перехода в принимающую зону
///
/// # Returns
///
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn change_num_of_people_rust(
	transmitting_zone: *const bim_zone_t,
	transit_width: c_double,
	speed_at_exit: c_double,
) -> c_double {
	let transmitting_zone = unsafe {
		transmitting_zone.as_ref().expect("Failed to dereference pointer transmitting_zone at change_num_of_people_rust fn in bim_evac crate")
	};

	let density_in_element = transmitting_zone.numofpeople / transmitting_zone.area;
	// Величина людского потока, через проем, чел./мин
	let people_flow = density_in_element * speed_at_exit * transit_width;
	// Зная скорость потока, можем вычислить конкретное количество человек,
	// которое может перейти в принимющую зону (путем умножения потока на шаг моделирования)
	unsafe { people_flow * EVAC_MODELING_STEP }
}

// TODO: complete docs comment
///
///
/// # Arguments
/// * `transmitting_zone` - отдающая зона
/// * `transit_width` - ширина прохода
/// * `speed_at_exit` - Скорость перехода в принимающую зону
///
/// # Returns
///
pub extern "C" fn change_num_of_people(
	transmitting_zone: &bim_zone_t_rust,
	transit_width: f64,
	speed_at_exit: f64,
) -> f64 {
	let density_in_element = transmitting_zone.number_of_people / transmitting_zone.area;
	// Величина людского потока, через проем, чел./мин
	let people_flow = density_in_element * speed_at_exit * transit_width;
	// Зная скорость потока, можем вычислить конкретное количество человек,
	// которое может перейти в принимющую зону (путем умножения потока на шаг моделирования)
	unsafe { people_flow * EVAC_MODELING_STEP_RUST }
}

// TODO: Уточнить корректность подсчета потенциала
// TODO: Потенциал должен считаться до эвакуации из помещения или после?
// TODO: Когда возникает ситуация, что потенциал принимающего больше отдающего
/// Подсчет потенциала
///
/// # Arguments
/// * `receiving_zone` - принимающая зона
/// * `transmitting_zone` - отдающая зона
/// * `transit` - проем
///
/// # Returns
/// Потенциал
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn potential_element_rust(
	receiving_zone: *const bim_zone_t,
	transmitting_zone: *const bim_zone_t,
	transit: *const bim_transit_t,
) -> c_double {
	let receiving_zone = unsafe {
		receiving_zone.as_ref().expect("Failed to dereference pointer receiving_zone at potential_element_rust fn in bim_evac crate")
	};

	let transmitting_zone = unsafe {
		transmitting_zone.as_ref().expect("Failed to dereference pointer transmitting_zone at potential_element_rust fn in bim_evac crate")
	};

	let transit = unsafe {
		transit.as_ref().expect(
			"Failed to dereference pointer transit at potential_element_rust fn in bim_evac crate",
		)
	};

	let p = transmitting_zone.area.sqrt()
		/ speed_at_exit_rust(receiving_zone, transmitting_zone, transit.width);

	match receiving_zone.potential.total_cmp(&f64::from(f32::MAX)) {
		Ordering::Less => receiving_zone.potential + p,
		_ => p,
	}
}

// TODO: Уточнить корректность подсчета потенциала
// TODO: Потенциал должен считаться до эвакуации из помещения или после?
// TODO: Когда возникает ситуация, что потенциал принимающего больше отдающего
/// Подсчет потенциала
///
/// # Arguments
/// * `receiving_zone` - принимающая зона
/// * `transmitting_zone` - отдающая зона
/// * `transit` - проем
///
/// # Returns
/// Потенциал
pub fn potential_element(
	receiving_zone: &bim_zone_t_rust,
	transmitting_zone: &bim_zone_t_rust,
	transit: &bim_transit_t_rust,
) -> f64 {
	let p = transmitting_zone.area.sqrt()
		/ speed_at_exit(receiving_zone, transmitting_zone, transit.width);

	match receiving_zone.potential.total_cmp(&f64::from(f32::MAX)) {
		Ordering::Less => receiving_zone.potential + p,
		_ => p,
	}
}

/// _part_people_flow
///
/// # Arguments
/// * `receiving_zone` - принимающее помещение
/// * `transmitting_zone` - отдающее помещение
/// * `transit` - проем между помещениями
///
/// # Returns
/// Количество людей
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn part_people_flow_rust(
	receiving_zone: *const bim_zone_t,
	transmitting_zone: *const bim_zone_t,
	transit: *const bim_transit_t,
) -> c_double {
	let receiving_zone = unsafe {
		receiving_zone.as_ref().expect("Failed to dereference pointer receiving_zone at part_people_flow_rust fn in bim_evac crate")
	};

	let transmitting_zone = unsafe {
		transmitting_zone.as_ref().expect("Failed to dereference pointer transmitting_zone at part_people_flow_rust fn in bim_evac crate")
	};

	let transit = unsafe {
		transit.as_ref().expect(
			"Failed to dereference pointer transit at part_people_flow_rust fn in bim_evac crate",
		)
	};

	let area_transmitting_zone = transmitting_zone.area;
	let people_in_transmitting_zone = transmitting_zone.numofpeople;
	let density_in_transmitting_zone = people_in_transmitting_zone / area_transmitting_zone;
	let density_min_transmitting_zone = unsafe {
		match EVAC_DENSITY_MIN > 0.0 {
			true => EVAC_DENSITY_MIN,
			false => 0.5 / area_transmitting_zone,
		}
	};

	// Ширина перехода между зонами зависит от количества человек,
	// которое осталось в помещении. Если там слишком мало людей,
	// то они переходят все сразу, чтоб не дробить их
	let door_width = transit.width; //(densityInElement > densityMin) ? aDoor.VCn().getWidth() : std::sqrt(areaElement);
	let speed_at_exit = speed_at_exit_rust(receiving_zone, transmitting_zone, door_width);

	// Количество людей, которые могут покинуть помещение
	let part_of_people_flow = match density_in_transmitting_zone > density_min_transmitting_zone {
		true => change_num_of_people_rust(transmitting_zone, door_width, speed_at_exit),
		false => people_in_transmitting_zone,
	};
	// println!("part_of_people_flow: {part_of_people_flow}");

	// Т.к. зона вне здания принята безразмерной,
	// в нее может войти максимально возможное количество человек
	// Все другие зоны могут принять ограниченное количество человек.
	// Т.о. нужно проверить может ли принимающая зона вместить еще людей.
	// capacity_receiving_zone - количество людей, которое еще может
	// вместиться до достижения максимальной плотности
	// => если может вместить больше, чем может выйти, то вмещает всех вышедших,
	// иначе вмещает только возможное количество.
	let max_num_of_people = unsafe { EVAC_DENSITY_MAX * receiving_zone.area };
	let capacity_receiving_zone = max_num_of_people - receiving_zone.numofpeople;

	// Такая ситуация возникает при плотности в принимающем помещении более Dmax чел./м2
	// Фактически capacity_receiving_zone < 0 означает, что помещение не может принять людей
	if capacity_receiving_zone < 0.0 {
		return 0.0;
	}

	match capacity_receiving_zone > part_of_people_flow {
		true => part_of_people_flow,
		false => capacity_receiving_zone,
	}
}

/// _part_people_flow
///
/// # Arguments
/// * `receiving_zone` - принимающее помещение
/// * `transmitting_zone` - отдающее помещение
/// * `transit` - проем между помещениями
///
/// # Returns
/// Количество людей
pub fn part_people_flow(
	receiving_zone: &bim_zone_t_rust,
	transmitting_zone: &bim_zone_t_rust,
	transit: &bim_transit_t_rust,
) -> f64 {
	let area_transmitting_zone = transmitting_zone.area;
	let people_in_transmitting_zone = transmitting_zone.number_of_people;
	let density_in_transmitting_zone = people_in_transmitting_zone / area_transmitting_zone;
	let density_min_transmitting_zone = unsafe {
		match EVAC_DENSITY_MIN_RUST > 0.0 {
			true => EVAC_DENSITY_MIN_RUST,
			false => 0.5 / area_transmitting_zone,
		}
	};

	// Ширина перехода между зонами зависит от количества человек,
	// которое осталось в помещении. Если там слишком мало людей,
	// то они переходят все сразу, чтоб не дробить их
	let door_width = transit.width; //(densityInElement > densityMin) ? aDoor.VCn().getWidth() : std::sqrt(areaElement);
	let speed_at_exit = speed_at_exit(receiving_zone, transmitting_zone, door_width);

	// Количество людей, которые могут покинуть помещение
	let part_of_people_flow = match density_in_transmitting_zone > density_min_transmitting_zone {
		true => change_num_of_people(transmitting_zone, door_width, speed_at_exit),
		false => people_in_transmitting_zone,
	};

	// Т.к. зона вне здания принята безразмерной,
	// в нее может войти максимально возможное количество человек
	// Все другие зоны могут принять ограниченное количество человек.
	// Т.о. нужно проверить может ли принимающая зона вместить еще людей.
	// capacity_receiving_zone - количество людей, которое еще может
	// вместиться до достижения максимальной плотности
	// => если может вместить больше, чем может выйти, то вмещает всех вышедших,
	// иначе вмещает только возможное количество.
	let max_num_of_people = unsafe { EVAC_DENSITY_MAX_RUST * receiving_zone.area };
	let capacity_receiving_zone = max_num_of_people - receiving_zone.number_of_people;

	// Такая ситуация возникает при плотности в принимающем помещении более Dmax чел./м2
	// Фактически capacity_receiving_zone < 0 означает, что помещение не может принять людей
	if capacity_receiving_zone < 0.0 {
		return 0.0;
	}

	// println!("capacity: {capacity_receiving_zone:.5} part: {part_of_people_flow:.5}");
	match capacity_receiving_zone > part_of_people_flow {
		true => part_of_people_flow,
		false => capacity_receiving_zone,
	}
}

pub fn evac_def_modeling_step(bim: &bim_t_rust) {
	let area = bim_tools_get_area_bim(bim);

	let average_size = area / bim.zones.len() as f64;
	let hxy = average_size.sqrt(); // характерный размер области, м
	unsafe {
		EVAC_MODELING_STEP_RUST = match EVAC_MODELING_STEP_RUST == 0.0 {
			true => hxy / EVAC_SPEED_MAX_RUST * 0.1,
			false => EVAC_MODELING_STEP_RUST, // Шаг моделирования, мин
		}
	}
}

#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub fn evac_moving_step_rust(
	graph: *const bim_graph_t,
	zones: &mut [bim_zone_t_rust],
	transits: &mut [bim_transit_t_rust],
) {
	let graph = unsafe {
		graph
			.as_ref()
			.unwrap_or_else(|| panic!("Failed to dereference graph pointer."))
	};

	reset_zones(zones);
	reset_transits(transits);

	let mut unprocessed_zones_count = zones.len();
	let mut zones_to_process: Vec<bim_zone_t_rust> = vec![];

	let graph_head = unsafe { std::slice::from_raw_parts(graph.head, graph.node_count) };
	let outside_id = graph.node_count - 1;
	let mut ptr = graph_head[outside_id];
	let mut receiving_zone_id = outside_id;

	loop {
		for _ in 0..zones[receiving_zone_id].outputs.len() {
			if ptr == null_mut() {
				break;
			}
			let mut ptr_ref = unsafe {
				ptr.as_mut()
					.unwrap_or_else(|| panic!("Failed to dereference graph head pointer."))
			};
			let mut transit = &mut transits[ptr_ref.eid];
			if transit.is_visited || transit.is_blocked {
				ptr = unsafe { (*ptr).next };
				continue;
			}

			let giving_zone_id = ptr_ref.dest;
			zones[receiving_zone_id].potential =
				potential_element(&zones[receiving_zone_id], &zones[giving_zone_id], transit);
			let moved_people =
				part_people_flow(&zones[receiving_zone_id], &zones[giving_zone_id], transit);
			zones[receiving_zone_id].number_of_people += moved_people;
			zones[giving_zone_id].number_of_people -= moved_people;
			transit.no_proceeding = moved_people;

			zones[giving_zone_id].is_visited = true;
			transit.is_visited = true;

			if zones[giving_zone_id].outputs.len() > 1
				&& !zones[giving_zone_id].is_blocked
				&& !zones_to_process
					.iter()
					.any(|x| x.id == zones[giving_zone_id].id)
			{
				zones_to_process.push(zones[giving_zone_id].clone());
			}

			ptr = unsafe { (*ptr).next };
		}

		zones_to_process.sort_by(|a, b| a.potential.total_cmp(&b.potential));

		if zones_to_process.len() > 0 {
			zones[receiving_zone_id] = zones_to_process.remove(0);
			ptr = unsafe {
				graph_head[zones[receiving_zone_id].id as usize]
					.as_mut()
					.unwrap_or_else(|| {
						panic!("Failed to dereference graph head pointer for receiving zone.")
					})
			};
		}

		if unprocessed_zones_count == 0 {
			break;
		}
		unprocessed_zones_count -= 1;
	}
}

pub fn evac_moving_step(graph: &bim_graph_t_rust, bim: &mut bim_t_rust) {
	let zones = &mut bim.zones;
	let transits = &mut bim.transits;

	reset_zones(zones);
	// for level in &mut bim.levels {
	// 	reset_zones(&mut level.zones);
	// }

	reset_transits(transits);
	// for level in &mut bim.levels {
	// 	reset_transits(&mut level.transits);
	// }

	let mut unprocessed_zones_count = zones.len();
	let mut zones_to_process: Vec<bim_zone_t_rust> = vec![];

	let outside_id = graph.head.len() - 1;
	let mut ptr = Some(graph.head[outside_id].clone());
	let mut receiving_zone_id = outside_id;

	loop {
		for _ in 0..zones[receiving_zone_id].outputs.len() {
			match ptr {
				Some(ptr_ref) => {
					let mut transit = &mut transits[ptr_ref.eid];

					if transit.is_visited || transit.is_blocked {
						ptr = ptr_ref.next;
						continue;
					}

					let giving_zone_id = ptr_ref.dest;
					zones[receiving_zone_id].potential = potential_element(
						&zones[receiving_zone_id],
						&zones[giving_zone_id],
						transit,
					);
					// for level in &mut bim.levels {
					// 	if let Some(level_receiving_zone) = level
					// 		.zones
					// 		.iter_mut()
					// 		.find(|x| x.uuid.eq(&zones[receiving_zone_id].uuid))
					// 	{
					// 		level_receiving_zone.potential = potential_element(
					// 			&zones[receiving_zone_id],
					// 			&zones[giving_zone_id],
					// 			transit,
					// 		);
					// 	}
					// }

					let moved_people = part_people_flow(
						&zones[receiving_zone_id],
						&zones[giving_zone_id],
						transit,
					);
					zones[receiving_zone_id].number_of_people += moved_people;
					// for level in &mut bim.levels {
					// 	if let Some(level_receiving_zone) = level
					// 		.zones
					// 		.iter_mut()
					// 		.find(|x| x.uuid.eq(&zones[receiving_zone_id].uuid))
					// 	{
					// 		level_receiving_zone.number_of_people += moved_people;
					// 	}
					// }

					zones[giving_zone_id].number_of_people -= moved_people;
					// for level in &mut bim.levels {
					// 	if let Some(level_giving_zone) = level
					// 		.zones
					// 		.iter_mut()
					// 		.find(|x| x.uuid.eq(&zones[giving_zone_id].uuid))
					// 	{
					// 		level_giving_zone.number_of_people -= moved_people;
					// 	}
					// }

					transit.no_proceeding = moved_people;
					// for level in &mut bim.levels {
					// 	if let Some(level_transit) =
					// 		level.transits.iter_mut().find(|x| x.uuid.eq(&transit.uuid))
					// 	{
					// 		level_transit.no_proceeding = moved_people;
					// 	}
					// }

					zones[giving_zone_id].is_visited = true;
					// for level in &mut bim.levels {
					// 	if let Some(level_giving_zone) = level
					// 		.zones
					// 		.iter_mut()
					// 		.find(|x| x.uuid.eq(&zones[giving_zone_id].uuid))
					// 	{
					// 		level_giving_zone.is_visited = true;
					// 	}
					// }

					transit.is_visited = true;
					// for level in &mut bim.levels {
					// 	if let Some(level_transit) =
					// 		level.transits.iter_mut().find(|x| x.uuid.eq(&transit.uuid))
					// 	{
					// 		level_transit.is_visited = true;
					// 	}
					// }

					if zones[giving_zone_id].outputs.len() > 1
						&& !zones[giving_zone_id].is_blocked
						&& !zones_to_process
							.iter()
							.any(|x| x.id.eq(&zones[giving_zone_id].id))
					{
						zones_to_process.push(zones[giving_zone_id].clone());
					}

					ptr = ptr_ref.next;
				}
				None => break,
			}
		}

		zones_to_process.sort_by(|a, b| a.potential.partial_cmp(&b.potential).unwrap());

		if zones_to_process.len() > 0 {
			let deleted_zone = zones_to_process.remove(0);
			// for level in &mut bim.levels {
			// 	if let Some(level_receiving_zone) = level
			// 		.zones
			// 		.iter_mut()
			// 		.find(|x| x.uuid.eq(&zones[receiving_zone_id].uuid))
			// 	{
			// 		*level_receiving_zone = deleted_zone.clone();
			// 	}
			// }
			receiving_zone_id = zones
				.iter()
				.position(|zone| deleted_zone.uuid.eq(&zone.uuid))
				.unwrap_or_else(|| panic!("Zone not found!"));
			ptr = Some(graph.head[zones[receiving_zone_id].id as usize].clone());
		}

		if unprocessed_zones_count == 0 {
			break;
		}
		unprocessed_zones_count -= 1;
	}
}

#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub fn evac_moving_step_test(
	graph: *mut bim_graph_t,
	zones: &mut [bim_zone_t_rust],
	transits: &mut [bim_transit_t_rust],
) {
	reset_zones(zones);
	reset_transits(transits);

	let mut unprocessed_zones_count = zones.len();
	let mut zones_to_process: Vec<bim_zone_t_rust> = vec![];

	let graph_head = unsafe { std::slice::from_raw_parts((*graph).head, (*graph).node_count) };

	let outside_id = unsafe { (*graph).node_count - 1 };
	let mut ptr = graph_head[outside_id];
	let mut receiving_zone_id = outside_id;

	loop {
		for _ in 0..zones[receiving_zone_id].outputs.len() {
			if ptr.is_null() {
				break;
			}
			let mut transit = unsafe { &mut transits[(*ptr).eid] };

			if transit.is_visited || transit.is_blocked {
				ptr = unsafe { (*ptr).next };
				continue;
			}

			let giving_zone_id = unsafe { (*ptr).dest };

			zones[receiving_zone_id].potential =
				potential_element(&zones[receiving_zone_id], &zones[giving_zone_id], transit);

			let moved_people =
				part_people_flow(&zones[receiving_zone_id], &zones[giving_zone_id], transit);
			zones[receiving_zone_id].number_of_people += moved_people;
			zones[giving_zone_id].number_of_people -= moved_people;
			transit.no_proceeding = moved_people;

			zones[giving_zone_id].is_visited = true;
			transit.is_visited = true;

			if zones[giving_zone_id].outputs.len() > 1
				&& !zones[giving_zone_id].is_blocked
				&& !zones_to_process
					.iter()
					.any(|x| x.id == zones[giving_zone_id].id)
			{
				zones_to_process.push(zones[giving_zone_id].clone());
			}

			ptr = unsafe { (*ptr).next };
		}

		zones_to_process.sort_by(|a, b| match a.potential < b.potential {
			true => std::cmp::Ordering::Greater,
			false => std::cmp::Ordering::Less,
		});

		if zones_to_process.len() > 0 {
			let deleted_zone = zones_to_process.remove(0);
			receiving_zone_id = zones
				.iter()
				.position(|zone| deleted_zone.uuid.eq(&zone.uuid))
				.unwrap_or_else(|| panic!("Zone not found!"));
			ptr = graph_head[deleted_zone.id as usize];
		}

		if unprocessed_zones_count == 0 {
			break;
		}
		unprocessed_zones_count -= 1;
	}
}

#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub fn evac_moving_step_test_with_log(
	graph: *mut bim_graph_t,
	zones: &mut [bim_zone_t_rust],
	transits: &mut [bim_transit_t_rust],
) {
	reset_zones(zones);
	reset_transits(transits);

	let mut unprocessed_zones_count = zones.len();
	let mut zones_to_process: Vec<bim_zone_t_rust> = vec![];

	let graph_head = unsafe { std::slice::from_raw_parts((*graph).head, (*graph).node_count) };

	let outside_id = unsafe { (*graph).node_count - 1 };
	let mut ptr = graph_head[outside_id];
	let mut receiving_zone_id = outside_id;

	loop {
		for _ in 0..zones[receiving_zone_id].outputs.len() {
			if ptr.is_null() {
				break;
			}
			let mut transit = unsafe { &mut transits[(*ptr).eid] };

			if transit.is_visited || transit.is_blocked {
				ptr = unsafe { (*ptr).next };
				continue;
			}

			let giving_zone_id = unsafe { (*ptr).dest };

			zones[receiving_zone_id].potential =
				potential_element(&zones[receiving_zone_id], &zones[giving_zone_id], transit);

			let moved_people =
				part_people_flow(&zones[receiving_zone_id], &zones[giving_zone_id], transit);
			zones[receiving_zone_id].number_of_people += moved_people;
			zones[giving_zone_id].number_of_people -= moved_people;
			transit.no_proceeding = moved_people;

			zones[giving_zone_id].is_visited = true;
			transit.is_visited = true;

			if zones[giving_zone_id].outputs.len() > 1
				&& !zones[giving_zone_id].is_blocked
				&& !zones_to_process
					.iter()
					.any(|x| x.id == zones[giving_zone_id].id)
			{
				zones_to_process.push(zones[giving_zone_id].clone());
			}

			ptr = unsafe { (*ptr).next };
		}

		zones_to_process.sort_by(|a, b| a.potential.total_cmp(&b.potential));

		if !zones_to_process.is_empty() {
			let deleted_zone = zones_to_process.remove(0);
			receiving_zone_id = zones
				.iter()
				.position(|zone| deleted_zone.uuid.eq(&zone.uuid))
				.unwrap_or_else(|| panic!("Zone not found!"));
			ptr = graph_head[deleted_zone.id as usize];
		}

		if unprocessed_zones_count == 0 {
			break;
		}
		unprocessed_zones_count -= 1;
	}
}

pub fn evac_moving_step_test_with_log_rust(
	graph: &bim_graph_t_rust,
	zones: &mut [bim_zone_t_rust],
	transits: &mut [bim_transit_t_rust],
) {
	reset_zones(zones);
	reset_transits(transits);

	let mut unprocessed_zones_count = zones.len();
	let mut zones_to_process: Vec<bim_zone_t_rust> = vec![];

	// let graph_head = unsafe { std::slice::from_raw_parts((*graph).head, (*graph).node_count) };

	// let outside_id = unsafe { (*graph).node_count - 1 };
	let outside_id = graph.head.len() - 1;
	// let mut ptr = graph_head[outside_id];
	let mut ptr = Some(graph.head[outside_id].clone());
	let mut receiving_zone_id = outside_id;

	loop {
		for _ in 0..zones[receiving_zone_id].outputs.len() {
			if let Some(ptr_box) = ptr {
				let mut transit = &mut transits[ptr_box.eid];

				if transit.is_visited || transit.is_blocked {
					ptr = ptr_box.next;
					continue;
				}

				let giving_zone_id = ptr_box.dest;

				zones[receiving_zone_id].potential =
					potential_element(&zones[receiving_zone_id], &zones[giving_zone_id], transit);

				let moved_people =
					part_people_flow(&zones[receiving_zone_id], &zones[giving_zone_id], transit);
				zones[receiving_zone_id].number_of_people += moved_people;
				zones[giving_zone_id].number_of_people -= moved_people;
				transit.no_proceeding = moved_people;

				zones[giving_zone_id].is_visited = true;
				transit.is_visited = true;

				if zones[giving_zone_id].outputs.len() > 1
					&& !zones[giving_zone_id].is_blocked
					&& !zones_to_process
						.iter()
						.any(|x| x.id == zones[giving_zone_id].id)
				{
					zones_to_process.push(zones[giving_zone_id].clone());
				}

				ptr = ptr_box.next;
			} else {
				break;
			}
		}

		zones_to_process.sort_by(|a, b| a.potential.total_cmp(&b.potential));

		if !zones_to_process.is_empty() {
			let deleted_zone = zones_to_process.remove(0);
			receiving_zone_id = zones
				.iter()
				.position(|zone| deleted_zone.uuid.eq(&zone.uuid))
				.unwrap_or_else(|| panic!("Zone not found!"));
			// ptr = graph_head[deleted_zone.id as usize];
			ptr = Some(graph.head[deleted_zone.id as usize].clone());
		}

		if unprocessed_zones_count == 0 {
			break;
		}
		unprocessed_zones_count -= 1;
	}
}

pub fn reset_zones(zones: &mut [bim_zone_t_rust]) {
	for zone in zones {
		zone.is_visited = false;
		zone.potential = match zone.sign {
			BimElementSign::OUTSIDE => 0.0,
			_ => f64::from(f32::MAX),
		};
	}
}

pub fn reset_transits(transits: &mut [bim_transit_t_rust]) {
	for transit in transits {
		transit.is_visited = false;
		transit.no_proceeding = 0.0;
	}
}

#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn element_id_eq_callback_rust(
	value1: *mut bim_zone_t,
	value2: *mut bim_zone_t,
) -> c_int {
	let value1 = unsafe {
		value1.as_ref().expect("Failed to dereference pointer value1 at element_id_eq_callback_rust fn in bim_evac crate")
	};

	let value2 = unsafe {
		value2.as_ref().expect("Failed to dereference pointer value2 at element_id_eq_callback_rust fn in bim_evac crate")
	};

	c_int::try_from(value1.id == value2.id).unwrap_or_else(|e| {
		panic!("Failed to convert bool to c_int at element_id_eq_callback_rust fn in bim_evac crate. Error: {e}")
	})
}

#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn potential_cmp_callback_rust(
	value1: *mut bim_zone_t,
	value2: *mut bim_zone_t,
) -> c_int {
	let value1 = unsafe {
		value1.as_ref().expect("Failed to dereference pointer value1 at potential_cmp_callback_rust fn in bim_evac crate")
	};

	let value2 = unsafe {
		value2.as_ref().expect("Failed to dereference pointer value2 at potential_cmp_callback_rust fn in bim_evac crate")
	};

	match value1.potential.total_cmp(&value2.potential) {
		Ordering::Greater => 1,
		Ordering::Less => -1,
		Ordering::Equal => 0,
	}
}

#[no_mangle]
pub extern "C" fn evac_set_speed_max_rust(speed: c_double) {
	unsafe {
		EVAC_SPEED_MAX = speed;
	}
}

#[no_mangle]
pub extern "C" fn evac_set_density_min_rust(density: c_double) {
	unsafe {
		EVAC_DENSITY_MIN = density;
	}
}

#[no_mangle]
pub extern "C" fn evac_set_density_max_rust(density: c_double) {
	unsafe {
		EVAC_DENSITY_MAX = density;
	}
}

#[no_mangle]
pub extern "C" fn evac_set_modeling_step_rust(step: c_double) {
	unsafe {
		EVAC_MODELING_STEP = step;
	}
}

#[no_mangle]
pub extern "C" fn evac_get_time_s_rust() -> c_double {
	unsafe { EVAC_TIME * 60.0 }
}

#[no_mangle]
pub extern "C" fn evac_get_time_m_rust() -> c_double {
	unsafe { EVAC_TIME }
}

#[no_mangle]
pub extern "C" fn evac_time_inc_rust() {
	unsafe {
		EVAC_TIME += EVAC_MODELING_STEP;
	}
}

#[no_mangle]
pub extern "C" fn evac_time_reset_rust() {
	unsafe {
		EVAC_TIME = 0.0;
	}
}

pub fn set_speed_max(speed: f64) {
	unsafe {
		EVAC_SPEED_MAX_RUST = speed;
	}
}

pub fn set_density_min(density: f64) {
	unsafe {
		EVAC_DENSITY_MIN_RUST = density;
	}
}

pub fn set_density_max(density: f64) {
	unsafe {
		EVAC_DENSITY_MAX_RUST = density;
	}
}

pub fn set_modeling_step(step: f64) {
	unsafe {
		EVAC_MODELING_STEP_RUST = step;
	}
}

pub fn get_time_s() -> f64 {
	unsafe { EVAC_TIME_RUST * 60.0 }
}

pub fn get_time_m() -> f64 {
	unsafe { EVAC_TIME_RUST }
}

pub fn time_inc() {
	unsafe {
		EVAC_TIME_RUST += EVAC_MODELING_STEP_RUST;
	}
}

pub fn time_reset() {
	unsafe {
		EVAC_TIME_RUST = 0.0;
	}
}

#[cfg(test)]
mod tests {
	use super::*;
	use bim_json_object::uuid_t;
	use bim_polygon_tools::polygon_t_rust;
	use std::ffi::CString;

	#[test]
	fn speed_in_element_eq() {
		unsafe {
			EVAC_SPEED_MAX_RUST = 100.0;
		}
		let receiving_zone = bim_zone_t_rust {
			id: 1,
			name: "Receiving zone".to_string(),
			uuid: "".to_string(),
			outputs: vec!["".to_string()],
			area: 10.0,
			z_level: 1.0,
			number_of_people: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: BimElementSign::ROOM,
			size_z: 2.0,
			polygon: polygon_t_rust::default(),
			potential: 1.0,
		};
		let transmitting_zone = bim_zone_t_rust {
			id: 2,
			name: "Transmitting zone".to_string(),
			uuid: "".to_string(),
			outputs: vec!["".to_string()],
			area: 10.0,
			z_level: 1.0,
			number_of_people: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: BimElementSign::ROOM,
			size_z: 2.0,
			polygon: polygon_t_rust::default(),
			potential: 1.0,
		};

		assert_eq!(
			speed_in_element(&receiving_zone, &transmitting_zone),
			80.13633567871892
		);
	}

	#[test]
	fn speed_in_element_rust_eq() {
		unsafe {
			EVAC_SPEED_MAX = 100.0;
		}
		let receiving_zone = bim_zone_t {
			id: 1,
			name: CString::new("Receiving zone").unwrap().into_raw(),
			uuid: uuid_t::default(),
			outputs: vec![uuid_t::default()].as_mut_ptr(),
			area: 10.0,
			z_level: 1.0,
			numofoutputs: 1,
			numofpeople: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: bim_element_sign_t_rust::ROOM as u8,
			size_z: 2.0,
			polygon: std::ptr::null_mut(),
			potential: 1.0,
		};
		let transmitting_zone = bim_zone_t {
			id: 2,
			name: CString::new("Transmitting zone").unwrap().into_raw(),
			uuid: uuid_t::default(),
			outputs: vec![uuid_t::default()].as_mut_ptr(),
			area: 10.0,
			z_level: 1.0,
			numofoutputs: 1,
			numofpeople: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: bim_element_sign_t_rust::ROOM as u8,
			size_z: 2.0,
			polygon: std::ptr::null_mut(),
			potential: 1.0,
		};

		assert_eq!(
			speed_in_element_rust(&receiving_zone, &transmitting_zone),
			80.13633567871892
		);
	}

	#[test]
	fn speed_at_exit_eq() {
		unsafe {
			EVAC_SPEED_MAX_RUST = 100.0;
		}
		let receiving_zone = bim_zone_t_rust {
			id: 1,
			name: "Receiving zone".to_string(),
			uuid: "".to_string(),
			outputs: vec!["".to_string()],
			area: 10.0,
			z_level: 1.0,
			number_of_people: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: BimElementSign::ROOM,
			size_z: 2.0,
			polygon: polygon_t_rust::default(),
			potential: 1.0,
		};
		let transmitting_zone = bim_zone_t_rust {
			id: 2,
			name: "Transmitting zone".to_string(),
			uuid: "".to_string(),
			outputs: vec!["".to_string()],
			area: 10.0,
			z_level: 1.0,
			number_of_people: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: BimElementSign::ROOM,
			size_z: 2.0,
			polygon: polygon_t_rust::default(),
			potential: 1.0,
		};
		let transit_width = 1.0;

		assert_eq!(
			speed_at_exit(&receiving_zone, &transmitting_zone, transit_width),
			80.13633567871892
		);
	}

	#[test]
	fn speed_at_exit_rust_eq() {
		unsafe {
			EVAC_SPEED_MAX = 100.0;
		}
		let receiving_zone = bim_zone_t {
			id: 1,
			name: CString::new("Receiving zone").unwrap().into_raw(),
			uuid: uuid_t::default(),
			outputs: vec![uuid_t::default()].as_mut_ptr(),
			area: 10.0,
			z_level: 1.0,
			numofoutputs: 1,
			numofpeople: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: bim_element_sign_t_rust::ROOM as u8,
			size_z: 2.0,
			polygon: std::ptr::null_mut(),
			potential: 1.0,
		};
		let transmitting_zone = bim_zone_t {
			id: 2,
			name: CString::new("Transmitting zone").unwrap().into_raw(),
			uuid: uuid_t::default(),
			outputs: vec![uuid_t::default()].as_mut_ptr(),
			area: 10.0,
			z_level: 1.0,
			numofoutputs: 1,
			numofpeople: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: bim_element_sign_t_rust::ROOM as u8,
			size_z: 2.0,
			polygon: std::ptr::null_mut(),
			potential: 1.0,
		};
		let transit_width = 1.0;

		assert_eq!(
			speed_at_exit_rust(&receiving_zone, &transmitting_zone, transit_width),
			80.13633567871892
		);
	}

	#[test]
	fn change_num_of_people_eq() {
		unsafe {
			EVAC_MODELING_STEP_RUST = 0.01;
		}
		let transmitting_zone = bim_zone_t_rust {
			id: 2,
			name: "Transmitting zone".to_string(),
			uuid: "".to_string(),
			outputs: vec!["".to_string()],
			area: 10.0,
			z_level: 1.0,
			number_of_people: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: BimElementSign::ROOM,
			size_z: 2.0,
			polygon: polygon_t_rust::default(),
			potential: 1.0,
		};
		let transit_width = 1.0;
		let speed_at_exit = 50.0;

		assert_eq!(
			change_num_of_people(&transmitting_zone, transit_width, speed_at_exit),
			0.5
		);
	}

	#[test]
	fn change_num_of_people_rust_eq() {
		unsafe {
			EVAC_MODELING_STEP = 0.01;
		}
		let transmitting_zone = bim_zone_t {
			id: 2,
			name: CString::new("Transmitting zone").unwrap().into_raw(),
			uuid: uuid_t::default(),
			outputs: vec![uuid_t::default()].as_mut_ptr(),
			area: 10.0,
			z_level: 1.0,
			numofoutputs: 1,
			numofpeople: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: bim_element_sign_t_rust::ROOM as u8,
			size_z: 2.0,
			polygon: std::ptr::null_mut(),
			potential: 1.0,
		};
		let transit_width = 1.0;
		let speed_at_exit = 50.0;

		assert_eq!(
			change_num_of_people_rust(&transmitting_zone, transit_width, speed_at_exit),
			0.5
		);
	}

	#[test]
	fn potential_element_eq() {
		let receiving_zone = bim_zone_t_rust {
			id: 1,
			name: "Receiving zone".to_string(),
			uuid: "".to_string(),
			outputs: vec!["".to_string()],
			area: 10.0,
			z_level: 1.0,
			number_of_people: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: BimElementSign::ROOM,
			size_z: 2.0,
			polygon: polygon_t_rust::default(),
			potential: 1.0,
		};
		let transmitting_zone = bim_zone_t_rust {
			id: 2,
			name: "Transmitting zone".to_string(),
			uuid: "".to_string(),
			outputs: vec!["".to_string()],
			area: 10.0,
			z_level: 1.0,
			number_of_people: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: BimElementSign::ROOM,
			size_z: 2.0,
			polygon: polygon_t_rust::default(),
			potential: 1.0,
		};
		let transit = bim_transit_t_rust {
			uuid: "".to_string(),
			id: 1,
			name: "Transit".to_string(),
			outputs: vec!["".to_string()],
			polygon: polygon_t_rust::default(),
			size_z: 2.0,
			z_level: 1.0,
			width: 1.0,
			no_proceeding: 0.0,
			sign: BimElementSign::DOOR_WAY,
			is_visited: false,
			is_blocked: false,
		};

		assert_eq!(
			potential_element(&receiving_zone, &transmitting_zone, &transit),
			1.039461221097587
		);
	}

	#[test]
	fn potential_element_rust_eq() {
		let receiving_zone = bim_zone_t {
			id: 1,
			name: CString::new("Receiving zone").unwrap().into_raw(),
			uuid: uuid_t::default(),
			outputs: vec![uuid_t::default()].as_mut_ptr(),
			area: 10.0,
			z_level: 1.0,
			numofoutputs: 1,
			numofpeople: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: bim_element_sign_t_rust::ROOM as u8,
			size_z: 2.0,
			polygon: std::ptr::null_mut(),
			potential: 1.0,
		};
		let transmitting_zone = bim_zone_t {
			id: 2,
			name: CString::new("Transmitting zone").unwrap().into_raw(),
			uuid: uuid_t::default(),
			outputs: vec![uuid_t::default()].as_mut_ptr(),
			area: 10.0,
			z_level: 1.0,
			numofoutputs: 1,
			numofpeople: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: bim_element_sign_t_rust::ROOM as u8,
			size_z: 2.0,
			polygon: std::ptr::null_mut(),
			potential: 1.0,
		};
		let transit = bim_transit_t {
			uuid: uuid_t::default(),
			id: 1,
			name: CString::new("Transit").unwrap().into_raw() as *mut char,
			outputs: vec![uuid_t::default()].as_mut_ptr(),
			polygon: std::ptr::null_mut(),
			size_z: 2.0,
			z_level: 1.0,
			width: 1.0,
			nop_proceeding: 0.0,
			sign: bim_element_sign_t_rust::DOOR_WAY as u8,
			numofoutputs: 1,
			is_visited: false,
			is_blocked: false,
		};

		assert_eq!(
			potential_element_rust(&receiving_zone, &transmitting_zone, &transit),
			1.039461221097587
		);
	}

	#[test]
	fn part_people_flow_eq() {
		unsafe {
			EVAC_DENSITY_MIN_RUST = 0.1;
			EVAC_DENSITY_MAX_RUST = 5.0;
		}
		let receiving_zone = bim_zone_t_rust {
			id: 1,
			name: "Receiving zone".to_string(),
			uuid: "".to_string(),
			outputs: vec!["".to_string()],
			area: 10.0,
			z_level: 1.0,
			number_of_people: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: BimElementSign::ROOM,
			size_z: 2.0,
			polygon: polygon_t_rust::default(),
			potential: 1.0,
		};
		let transmitting_zone = bim_zone_t_rust {
			id: 2,
			name: "Transmitting zone".to_string(),
			uuid: "".to_string(),
			outputs: vec!["".to_string()],
			area: 10.0,
			z_level: 1.0,
			number_of_people: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: BimElementSign::ROOM,
			size_z: 2.0,
			polygon: polygon_t_rust::default(),
			potential: 1.0,
		};
		let transit = bim_transit_t_rust {
			uuid: "".to_string(),
			id: 1,
			name: "Transit".to_string(),
			outputs: vec!["".to_string()],
			polygon: polygon_t_rust::default(),
			size_z: 2.0,
			z_level: 1.0,
			width: 1.0,
			no_proceeding: 0.0,
			sign: BimElementSign::DOOR_WAY,
			is_visited: false,
			is_blocked: false,
		};

		assert_eq!(
			part_people_flow(&receiving_zone, &transmitting_zone, &transit),
			0.8013633567871893
		);
	}

	#[test]
	fn part_people_flow_rust_eq() {
		unsafe {
			EVAC_DENSITY_MIN = 0.1;
			EVAC_DENSITY_MAX = 5.0;
		}
		let receiving_zone = bim_zone_t {
			id: 1,
			name: CString::new("Receiving zone").unwrap().into_raw(),
			uuid: uuid_t::default(),
			outputs: vec![uuid_t::default()].as_mut_ptr(),
			area: 10.0,
			z_level: 1.0,
			numofoutputs: 1,
			numofpeople: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: bim_element_sign_t_rust::ROOM as u8,
			size_z: 2.0,
			polygon: std::ptr::null_mut(),
			potential: 1.0,
		};
		let transmitting_zone = bim_zone_t {
			id: 2,
			name: CString::new("Transmitting zone").unwrap().into_raw(),
			uuid: uuid_t::default(),
			outputs: vec![uuid_t::default()].as_mut_ptr(),
			area: 10.0,
			z_level: 1.0,
			numofoutputs: 1,
			numofpeople: 10.0,
			hazard_level: 0,
			is_blocked: false,
			is_visited: false,
			is_safe: true,
			sign: bim_element_sign_t_rust::ROOM as u8,
			size_z: 2.0,
			polygon: std::ptr::null_mut(),
			potential: 1.0,
		};
		let transit = bim_transit_t {
			uuid: uuid_t::default(),
			id: 1,
			name: CString::new("Transit").unwrap().into_raw() as *mut char,
			outputs: vec![uuid_t::default()].as_mut_ptr(),
			polygon: std::ptr::null_mut(),
			size_z: 2.0,
			z_level: 1.0,
			width: 1.0,
			nop_proceeding: 0.0,
			sign: bim_element_sign_t_rust::DOOR_WAY as u8,
			numofoutputs: 1,
			is_visited: false,
			is_blocked: false,
		};

		assert_eq!(
			part_people_flow_rust(&receiving_zone, &transmitting_zone, &transit),
			0.8013633567871893
		);
	}
}
