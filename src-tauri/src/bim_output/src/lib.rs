use bim_tools::bim_t_rust;
use libc::c_char;
use std::ffi::{CStr, CString};
use std::fs::File;
use std::io::Write;
use std::ops::Add;
use std::path::Path;

const OUTPUT_DIR: &str = "result";
pub const OUTPUT_DETAIL_FILE_RUST: &str = "_detailed_rust";
pub const OUTPUT_SHORT_FILE_RUST: &str = "_short_rust";
pub const OUTPUT_SUFFIX: &str = ".csv";

#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn bim_basename(path_to_file: *mut c_char) -> *mut c_char {
	let path = unsafe { CStr::from_ptr(path_to_file).to_str().unwrap() };
	let basename = Path::new(Path::new(path).file_name().unwrap())
		.file_stem()
		.unwrap()
		.to_str()
		.unwrap()
		.to_owned();
	let out_file = Path::new("..")
		.join(OUTPUT_DIR)
		.join(basename)
		.to_str()
		.unwrap()
		.to_owned();
	let out_file_ptr = CString::new(out_file.as_str()).unwrap().into_raw();
	std::mem::forget(out_file);
	out_file_ptr
}

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

#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn bim_create_file_name(
	base_file_name: *const c_char,
	middle_name: *const c_char,
	suffix: *const c_char,
) -> *mut c_char {
	let base_file_name = unsafe { CStr::from_ptr(base_file_name).to_str().unwrap() };
	let middle_name = unsafe { CStr::from_ptr(middle_name).to_str().unwrap() };
	let suffix = unsafe { CStr::from_ptr(suffix).to_str().unwrap() };
	let out_file = Path::new(
		base_file_name
			.to_string()
			.add(middle_name)
			.add(suffix)
			.as_str(),
	)
	.to_str()
	.unwrap()
	.to_owned();
	let out_file_ptr = CString::new(out_file.as_str()).unwrap().into_raw();
	std::mem::forget(out_file);
	out_file_ptr
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
	use libc::c_char;
	use std::ffi::{CStr, CString};

	#[test]
	#[cfg(any(target_os = "linux", target_os = "macos"))]
	fn test_bim_basename_linux_and_macos() {
		let path_ptr = CString::new("../res/two_levels.json").unwrap().into_raw();
		let out_file_ptr = super::bim_basename(path_ptr);
		let out_file = unsafe { CStr::from_ptr(out_file_ptr).to_str().expect("Invalid path") };
		let expected_path = "../result/two_levels";

		assert_eq!(expected_path, out_file);
	}

	#[test]
	#[cfg(target_os = "windows")]
	fn test_bim_basename_windows() {
		let path_ptr = CString::new("../res/two_levels.json").unwrap().into_raw();
		let out_file_ptr = super::bim_basename(path_ptr);
		let out_file = unsafe { CStr::from_ptr(out_file_ptr).to_str().expect("Invalid path") };
		let expected_path = "..\\result\\two_levels";

		assert_eq!(expected_path, out_file);
	}
}
