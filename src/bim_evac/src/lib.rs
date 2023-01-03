use bim_json_object::bim_element_sign_t_rust;
use bim_tools::bim_zone_t;
use libc::{c_double, c_int};
use std::borrow::Borrow;
use std::cmp::Ordering;

static mut EVAC_SPEED_MAX: f64 = 100.0;
static mut EVAC_DENSITY_MIN: f64 = 0.1;
static mut EVAC_DENSITY_MAX: f64 = 5.0;
static mut EVAC_MODELING_STEP: f64 = 0.01;
static mut EVAC_TIME: f64 = 0.0;

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
	v0 * (1.0 - a * ((d / d0) as f64).ln())
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
