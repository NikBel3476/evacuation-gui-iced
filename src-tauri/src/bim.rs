use bim_evac::{
	evac_def_modeling_step, evac_moving_step_test_with_log_rust, get_time_m, get_time_s,
	set_density_max, set_density_min, set_modeling_step, set_speed_max, time_inc, time_reset,
};
use bim_graph::bim_graph_new;
use bim_json_object::{bim_json_object_new, BimElementSign};
use bim_output::{
	bim_basename_rust, bim_create_file_name_rust, bim_output_body, bim_output_head,
	OUTPUT_DETAIL_FILE_RUST, OUTPUT_SHORT_FILE_RUST, OUTPUT_SUFFIX,
};
use bim_tools::{bim_tools_new_rust, Bim};
use cli::CliParameters;
use configuration::{load_cfg, DistributionType, ScenarioCfg, TransitionType};
use std::io::Write;

mod bim_cli;
mod bim_evac;
mod bim_graph;
mod bim_json_object;
mod bim_output;
mod bim_polygon_tools;
mod bim_tools;
mod cli;
pub mod configuration;
mod graph;
mod json_object;
mod json_renga;

pub fn run_rust() {
	// TODO: remove mock file path
	let cli_parameters = CliParameters {
		scenario_file: String::from("../scenario.json"),
	};

	let scenario_configuration = load_cfg(&cli_parameters.scenario_file)
		.unwrap_or_else(|e| panic!("Error reading the scenario configuration file. Error: {e}"));

	// TODO: add the logger

	for file in &scenario_configuration.files {
		let filename = bim_basename_rust(file);
		let log_filename = bim_basename_rust("log.txt");

		// Чтение файла и разворачивание его в структуру
		let bim_json = bim_json_object_new(file);

		let mut bim = bim_tools_new_rust(&bim_json);

		applying_scenario_bim_params(&mut bim, &scenario_configuration);

		// Files with results
		let output_detail =
			bim_create_file_name_rust(&filename, OUTPUT_DETAIL_FILE_RUST, OUTPUT_SUFFIX);
		let output_short =
			bim_create_file_name_rust(&filename, OUTPUT_SHORT_FILE_RUST, OUTPUT_SUFFIX);
		let log = bim_create_file_name_rust(&log_filename, "_rust", ".txt");

		let mut fp_detail =
			std::fs::File::create(&output_detail).expect("Error opening the output file");
		let mut fp_short =
			std::fs::File::create(&output_short).expect("Error opening the output file");
		let mut log_file = match std::path::Path::new(&log).exists() {
			true => std::fs::File::options()
				.append(true)
				.open(&log)
				.unwrap_or_else(|e| panic!("Error opening the log file. Error: {e}")),
			false => std::fs::File::create(&log)
				.unwrap_or_else(|e| panic!("Error create the log file. Error: {e}")),
		};

		let current_time = chrono::Local::now()
			.format("%Y-%m-%d %H:%M:%S.%6f")
			.to_string();
		let filename_log = format!("The file name of the used bim `{filename}.json`\n");
		print!("{current_time} {filename_log}");
		log_file
			.write_all(filename_log.as_bytes())
			.unwrap_or_else(|e| panic!("Failed to write log to file. Error: {e}"));

		bim_output_head(&bim, &mut fp_detail);
		bim_output_body(&bim, 0.0, &mut fp_detail);

		// let graph = bim_graph_new_rust(&bim);
		let graph = bim_graph_new(&bim);
		// let bim_graph = bim_graph_new_test(&bim);
		// TODO: add print graph

		evac_def_modeling_step(&bim);
		time_reset();

		let remainder = 0.0; // Количество человек, которое может остаться в зд. для остановки цикла
		loop {
			// evac_moving_step_test_with_log(bim_graph, &mut bim.zones, &mut bim.transits);
			evac_moving_step_test_with_log_rust(&graph, &mut bim.zones, &mut bim.transits);
			time_inc();
			bim_output_body(&bim, get_time_m(), &mut fp_detail);

			let mut num_of_people = 0.0;
			for zone in &bim.zones {
				if zone.is_visited {
					num_of_people += zone.number_of_people;
				}
			}

			if num_of_people <= remainder {
				break;
			}
		}

		let num_of_evacuated_people = bim.number_of_people();
		let evacuation_time_m = get_time_m();
		let evacuated_people = bim.zones[bim.zones.len() - 1].number_of_people;

		let evac_time_log = format!(
			"{current_time} Длительность эвакуации: {:.2} с. ({:.2} мин.)\n",
			get_time_s(),
			evacuation_time_m
		);
		let number_of_people_log = format!("{current_time} Количество человек: в здании - {num_of_evacuated_people:.2} (в безопасной зоне - {evacuated_people:.2}) чел.\n");
		let delimiter = format!("{current_time} ---------------------------------------\n");

		print!("{evac_time_log}");
		log_file
			.write_all(evac_time_log.as_bytes())
			.unwrap_or_else(|e| panic!("Failed to write log to file. Error: {e}"));
		print!("{number_of_people_log}");
		log_file
			.write_all(number_of_people_log.as_bytes())
			.unwrap_or_else(|e| panic!("Failed to write log to file. Error: {e}"));
		print!("{delimiter}");
		log_file
			.write_all(delimiter.as_bytes())
			.unwrap_or_else(|e| panic!("Failed to write log to file. Error: {e}"));
		log_file
			.flush()
			.unwrap_or_else(|e| panic!("Failed to flush log to file. Error: {e}"));

		fp_short
			.write_all(
				format!(
					"{evacuation_time_m:.2},{num_of_evacuated_people:.2},{evacuated_people:.2}\n"
				)
				.as_bytes(),
			)
			.unwrap_or_else(|e| panic!("Failed to write fp_short to file. Error: {e}"));
		fp_short
			.flush()
			.unwrap_or_else(|e| panic!("Failed to flush fp_short to file. Error: {e}"));
	}
}

pub fn applying_scenario_bim_params(bim: &mut Bim, scenario_configuration: &ScenarioCfg) {
	for transition in &mut bim.transits {
		if scenario_configuration.transition.transitions_type == TransitionType::Users {
			match transition.sign {
				BimElementSign::DoorWayIn => {
					transition.width = scenario_configuration.transition.doorway_in
				}
				BimElementSign::DoorWayOut => {
					transition.width = scenario_configuration.transition.doorway_out
				}
				_ => {}
			}
		}

		// A special set up the transit width of item of bim
		for special in &scenario_configuration.transition.special {
			for uuid in &special.uuid {
				if transition.uuid.eq(uuid) {
					transition.width = special.width;
				}
			}
		}
	}

	// in c code bim->transits is a pointers to bim->levels[_]->transits so necessary to update bim->levels[_]->transits
	for level in &mut bim.levels {
		for transition in &mut level.transits {
			if scenario_configuration.transition.transitions_type == TransitionType::Users {
				match transition.sign {
					BimElementSign::DoorWayIn => {
						transition.width = scenario_configuration.transition.doorway_in
					}
					BimElementSign::DoorWayOut => {
						transition.width = scenario_configuration.transition.doorway_out
					}
					_ => {}
				}
			}

			// A special set up the transit width of item of bim
			for special in &scenario_configuration.transition.special {
				for uuid in &special.uuid {
					if transition.uuid.eq(uuid) {
						transition.width = special.width;
					}
				}
			}
		}
	}

	for zone in &mut bim.zones {
		if zone.sign == BimElementSign::Outside {
			continue;
		}

		if scenario_configuration.distribution.distribution_type == DistributionType::Uniform {
			zone.number_of_people = zone.area * scenario_configuration.distribution.density;
		}

		// A special set up the density of item of bim
		for special in &scenario_configuration.distribution.special {
			for uuid in &special.uuid {
				if zone.uuid.eq(uuid) {
					zone.number_of_people = zone.area * special.density;
				}
			}
		}
	}

	// in c code bim->zones is a pointers to bim->levels[_]->zones so necessary to update bim->levels[_]->zones
	for level in &mut bim.levels {
		for zone in &mut level.zones {
			if zone.sign == BimElementSign::Outside {
				continue;
			}

			if scenario_configuration.distribution.distribution_type == DistributionType::Uniform {
				zone.number_of_people = zone.area * scenario_configuration.distribution.density;
			}

			// A special set up the density of item of bim
			for special in &scenario_configuration.distribution.special {
				for uuid in &special.uuid {
					if zone.uuid.eq(uuid) {
						zone.number_of_people = zone.area * special.density;
					}
				}
			}
		}
	}

	set_modeling_step(scenario_configuration.modeling.step);
	set_speed_max(scenario_configuration.modeling.max_speed);
	set_density_max(scenario_configuration.modeling.max_density);
	set_density_min(scenario_configuration.modeling.min_density);
}

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn run_modeling() {
		run_rust();
	}
}
