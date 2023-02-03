use bim_evac;
use bim_evac::{
	evac_def_modeling_step, evac_get_time_m_rust, evac_get_time_s_rust, evac_moving_step_rust,
	evac_time_inc_rust, set_density_max, set_density_min, set_modeling_step, set_speed_max,
	time_reset,
};
use bim_graph::bim_graph_new;
use bim_json_object::{bim_json_object_new, BimElementSign};
use bim_output::{
	bim_basename_rust, bim_create_file_name, bim_create_file_name_rust, bim_output_body,
	bim_output_head, OUTPUT_DETAIL_FILE_RUST, OUTPUT_SHORT_FILE_RUST, OUTPUT_SUFFIX,
};
use bim_tools::{
	bim_t_rust, bim_tools_get_num_of_people, bim_tools_new_rust, bim_tools_set_people_to_zone_rust,
	set_people_to_zone,
};
use cli::CliParameters;
use configuration::{load_cfg, DistributionType, ScenarioCfg, TransitionType};
use json_object::parse_building_from_json;

pub fn run_rust() {
	let cli_parameters = CliParameters {
		scenario_file: String::from("../scenario.json"),
	};

	let scenario_configuration = load_cfg(&cli_parameters.scenario_file)
		.unwrap_or_else(|e| panic!("Error reading the scenario configuration file. Error: {e}"));

	// TODO: add the logger

	for file in &scenario_configuration.files {
		let filename = bim_basename_rust(file);
		println!("The file name of the used bim `{filename}.json`");

		// Чтение файла и разворачивание его в структуру
		let bim_json = bim_json_object_new(file);

		let mut bim = bim_tools_new_rust(&bim_json);

		applying_scenario_bim_params(&mut bim, &scenario_configuration);

		// Files with results
		let output_detail =
			bim_create_file_name_rust(&filename, OUTPUT_DETAIL_FILE_RUST, OUTPUT_SUFFIX);
		let output_short =
			bim_create_file_name_rust(&filename, OUTPUT_SHORT_FILE_RUST, OUTPUT_SUFFIX);

		let mut fp_detail =
			std::fs::File::create(&output_detail).expect("Error opening the output file");

		bim_output_head(&bim, &mut fp_detail);
		bim_output_body(&bim, 0.0, &mut fp_detail);

		let graph = bim_graph_new(&bim);
		// TODO: add print graph

		evac_def_modeling_step(&bim);
		time_reset();

		let remainder = 0.0; // Количество человек, которое может остаться в зд. для остановки цикла
		loop {
			evac_moving_step_rust(graph, &mut bim.zones, &mut bim.transits);
			evac_time_inc_rust();
			bim_output_body(&bim, evac_get_time_m_rust(), &mut fp_detail);

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

		let num_of_evacuated_people = bim_tools_get_num_of_people(&bim);
		let evacuation_time = evac_get_time_m_rust();

		println!(
			"Длительность эвакуации: {:.2} с. ({:.2} мин.)",
			evac_get_time_s_rust(),
			evacuation_time
		);
		println!(
			"Количество человек: в здании - {:.2} (в безопасной зоне - {:.2}) чел.",
			num_of_evacuated_people,
			bim.zones[bim.zones.len() - 1].number_of_people
		);
		println!("---------------------------------------");
	}
}

pub fn applying_scenario_bim_params(bim: &mut bim_t_rust, scenario_configuration: &ScenarioCfg) {
	for transition in &mut bim.transits {
		if scenario_configuration.transition.transitions_type == TransitionType::Users {
			match transition.sign {
				BimElementSign::DOOR_WAY_IN => {
					transition.width = scenario_configuration.transition.doorway_in
				}
				BimElementSign::DOOR_WAY_OUT => {
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

	for zone in &mut bim.zones {
		if zone.sign == BimElementSign::OUTSIDE {
			continue;
		}

		if scenario_configuration.distribution.distribution_type == DistributionType::Uniform {
			set_people_to_zone(
				zone,
				(zone.area * scenario_configuration.distribution.density) as f32,
			);
		}

		// A special set up the density of item of bim
		for special in &scenario_configuration.distribution.special {
			for uuid in &special.uuid {
				if zone.uuid.eq(uuid) {
					set_people_to_zone(zone, (zone.area * special.density) as f32);
				}
			}
		}
	}

	set_modeling_step(scenario_configuration.modeling.step);
	set_speed_max(scenario_configuration.modeling.max_speed);
	set_density_max(scenario_configuration.modeling.max_density);
	set_density_min(scenario_configuration.modeling.min_density);
}
