use libc::c_char;
use std::ffi::{CStr, CString};
use std::fs::File;
use std::ops::Add;
use std::path::Path;

const OUTPUT_DIR: &str = "result";
const OUTPUT_SUFFIX: &str = ".csv";

#[no_mangle]
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

#[no_mangle]
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
