#![allow(non_camel_case_types)]

use super::configuration::{load_cfg, DistributionType, TransitionType};
use libc::{c_char, c_float, c_uchar};
use std::ffi::CStr;

#[repr(C)]
pub enum distribution_type_rust {
	distribution_from_bim,
	distribution_uniform,
}

#[repr(C)]
pub enum transits_width_type_rust {
	transits_width_from_bim,
	transits_width_users,
}

// Количество символов в UUID + NUL символ
#[repr(C)]
pub struct uuid_t_rust {
	pub x: [c_char; 36 + 1], // массив из char заменён на обычную строку
}

#[repr(C)]
pub struct special_t_rust {
	pub uuid: *mut uuid_t_rust,
	pub num_of_uuids: c_uchar,
	pub value: c_float,
}

#[repr(C)]
pub struct bim_cfg_distribution_t_rust {
	pub r#type: distribution_type_rust,
	pub density: c_float,
	pub special: *mut special_t_rust,
	pub num_of_special_blocks: c_uchar,
}

#[repr(C)]
pub struct bim_cfg_transitions_width_t_rust {
	pub r#type: transits_width_type_rust,
	pub doorwayin: c_float,
	pub doorwayout: c_float,
	pub special: *mut special_t_rust,
	pub num_of_special_blocks: c_uchar,
}
#[repr(C)]
pub struct bim_cfg_modeling_t_rust {
	pub step: c_float,
	pub speed_max: c_float,
	pub density_min: c_float,
	pub density_max: c_float,
}

#[repr(C)]
pub struct bim_cfg_file_name_t_rust {
	pub x: [c_char; 256],
}

#[repr(C)]
pub struct bim_cfg_scenario_t_rust {
	pub bim_jsons: *mut bim_cfg_file_name_t_rust,
	pub logger_configure: bim_cfg_file_name_t_rust,
	pub num_of_bim_jsons: c_uchar,
	pub distribution: bim_cfg_distribution_t_rust,
	pub transits: bim_cfg_transitions_width_t_rust,
	pub modeling: bim_cfg_modeling_t_rust,
}

#[allow(clippy::not_unsafe_ptr_arg_deref)]
#[no_mangle]
pub extern "C" fn bim_cfg_load(path_to_file: *const c_char) -> *const bim_cfg_scenario_t_rust {
	let config = unsafe {
		load_cfg(CStr::from_ptr(path_to_file).to_str().unwrap())
			.expect("Ошибка парсинга конфигурации сценария")
	};
	let scenario_config = bim_cfg_scenario_t_rust {
		bim_jsons: {
			let mut files = config
				.files
				.iter()
				.map(|filename| bim_cfg_file_name_t_rust {
					x: {
						let mut char_arr: [c_char; 256] = [0; 256];
						for (i, c) in filename.chars().enumerate() {
							match c.is_ascii() {
								true => char_arr[i] = c as c_char,
								false => panic!("символ вне диапазона ASCII"),
							}
						}

						char_arr
					},
				})
				.collect::<Vec<bim_cfg_file_name_t_rust>>();

			let ptr = files.as_mut_ptr();
			std::mem::forget(files);
			ptr
		},
		num_of_bim_jsons: c_uchar::try_from(config.files.len())
			.expect("Количество файлов в конфигурации больше 255"),
		logger_configure: bim_cfg_file_name_t_rust {
			x: {
				let mut char_arr: [c_char; 256] = [0; 256];
				for (i, c) in config.logger_config.chars().enumerate() {
					match c.is_ascii() {
						true => char_arr[i] = c as c_char,
						false => panic!("символ вне диапазона ASCII"),
					}
				}

				char_arr
			},
		},
		distribution: bim_cfg_distribution_t_rust {
			r#type: match config.distribution.distribution_type {
				DistributionType::FromBim => distribution_type_rust::distribution_from_bim,
				DistributionType::Uniform => distribution_type_rust::distribution_uniform,
			},
			density: config.distribution.density as f32,
			num_of_special_blocks: c_uchar::try_from(config.distribution.special.len())
				.expect("Не удалось преобразовать num_of_special_blocks в distribution"),
			special: {
				let mut special_blocks = config
					.distribution
					.special
					.iter()
					.map(|special_block| special_t_rust {
						uuid: {
							let mut uuid_vec = special_block
								.uuid
								.iter()
								.map(|uuid_value| uuid_t_rust {
									x: {
										let mut char_vec = uuid_value
											.clone()
											.chars()
											.map(|c| match c.is_ascii() {
												true => c as c_char,
												false => {
													panic!("uuid символ вне диапазона ASCII: {}", c)
												}
											})
											.collect::<Vec<c_char>>();
										char_vec.push(0 as c_char);
										char_vec.try_into().unwrap_or_else(|v| {
											panic!("Не удалось преобразовать uuid в массив char длиной 37: {:?}", v)
										})
									},
								})
								.collect::<Vec<uuid_t_rust>>();

							let ptr = uuid_vec.as_mut_ptr();
							std::mem::forget(uuid_vec);

							ptr
						},
						num_of_uuids: c_uchar::try_from(special_block.uuid.len())
							.expect("Не удалось преобразовать num_of_uuids в distribution"),
						value: special_block.density as f32,
					})
					.collect::<Vec<special_t_rust>>();

				let ptr = special_blocks.as_mut_ptr();
				std::mem::forget(special_blocks);
				ptr
			},
		},
		transits: bim_cfg_transitions_width_t_rust {
			r#type: match config.transition.transitions_type {
				TransitionType::FromBim => transits_width_type_rust::transits_width_from_bim,
				TransitionType::Users => transits_width_type_rust::transits_width_users,
			},
			doorwayin: config.transition.doorway_in as f32,
			doorwayout: config.transition.doorway_out as f32,
			num_of_special_blocks: c_uchar::try_from(config.transition.special.len())
				.expect("Не удалось преобразовать num_of_special_blocks в transitions"),
			special: {
				let mut special_blocks = config
					.transition
					.special
					.iter()
					.map(|special_block| special_t_rust {
						uuid: {
							let mut uuid_vec = special_block
								.uuid
								.iter()
								.map(|uuid_value| uuid_t_rust {
									x: {
										let mut char_vec = uuid_value
											.clone()
											.chars()
											.map(|c| match c.is_ascii() {
												true => c as c_char,
												false => {
													panic!("uuid символ вне диапазона ASCII: {}", c)
												}
											})
											.collect::<Vec<c_char>>();
										char_vec.push(0 as c_char);
										char_vec.try_into().unwrap_or_else(|v| {
											panic!("Не удалось преобразовать uuid в массив char длиной 37: {:?}", v)
										})
									},
								})
								.collect::<Vec<uuid_t_rust>>();

							let ptr = uuid_vec.as_mut_ptr();
							std::mem::forget(uuid_vec);

							ptr
						},
						num_of_uuids: c_uchar::try_from(special_block.uuid.len())
							.expect("Не удалось преобразовать num_of_uuids в transits"),
						value: special_block.width as f32,
					})
					.collect::<Vec<special_t_rust>>();

				let ptr = special_blocks.as_mut_ptr();
				std::mem::forget(special_blocks);

				ptr
			},
		},
		modeling: bim_cfg_modeling_t_rust {
			step: config.modeling.step as f32,
			speed_max: config.modeling.max_speed as f32,
			density_min: config.modeling.min_density as f32,
			density_max: config.modeling.max_density as f32,
		},
	};

	Box::into_raw(Box::new(scenario_config))
}
