use super::bim_tools::bim_t_rust;
use std::fs::File;
use std::io::Write;
use std::ops::Add;
use std::path::Path;

const OUTPUT_DIR: &str = "result";
pub const OUTPUT_DETAIL_FILE_RUST: &str = "_detailed_rust";
pub const OUTPUT_SHORT_FILE_RUST: &str = "_short_rust";
pub const OUTPUT_SUFFIX: &str = ".csv";

pub fn bim_basename_rust(path_to_file: &str) -> String {
	let basename = Path::new(Path::new(path_to_file).file_name().unwrap())
		.file_stem()
		.unwrap()
		.to_str()
		.unwrap()
		.to_owned();

	Path::new("..")
		.join(OUTPUT_DIR)
		.join(basename)
		.to_str()
		.unwrap()
		.to_owned()
}

pub fn bim_create_file_name_rust(base_file_name: &str, middle_name: &str, suffix: &str) -> String {
	Path::new(
		base_file_name
			.to_string()
			.add(middle_name)
			.add(suffix)
			.as_str(),
	)
	.to_str()
	.unwrap()
	.to_owned()
}

pub fn bim_output_head(bim: &bim_t_rust, file: &mut File) {
	file.write_all(b"t,").expect("Failed to write to file");

	for zone in &bim.zones {
		file.write_all(format!("{},", zone.name).as_bytes())
			.expect("Failed to write zone name to file");
	}

	for transition in &bim.transits {
		file.write_all(format!("{},", transition.name).as_bytes())
			.expect("Failed to write transition name to file");
	}

	file.write_all(b"\n").expect("Failed to write to file");
	file.flush().expect("Failed to flush file");
}

pub fn bim_output_body(bim: &bim_t_rust, time: f64, file: &mut File) {
	file.write_all(format!("{time:.2},").as_bytes())
		.expect("Failed to write to file");

	for zone in &bim.zones {
		file.write_all(format!("{:.2},", zone.number_of_people).as_bytes())
			.expect("Failed to write zone number of people to file");
	}

	for transition in &bim.transits {
		file.write_all(format!("{:.2},", transition.no_proceeding).as_bytes())
			.expect("Failed to write transition no_proceeding to file");
	}

	file.write_all(b"\n").expect("Failed to write to file");
	file.flush().expect("Failed to flush file");
}

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	#[cfg(any(target_os = "linux", target_os = "macos"))]
	fn test_bim_basename_linux_and_macos() {
		let path_ptr = "../res/two_levels.json";
		let out_file = bim_basename(path_ptr);
		let expected_path = "../result/two_levels";

		assert_eq!(expected_path, out_file);
	}

	#[test]
	#[cfg(target_os = "windows")]
	fn test_bim_basename_windows() {
		let path_ptr = "../res/two_levels.json";
		let out_file = bim_basename_rust(path_ptr);
		let expected_path = "..\\result\\two_levels";

		assert_eq!(expected_path, out_file);
	}
}
