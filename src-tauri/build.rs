fn main() {
	println!("cargo:rerun-if-changed=../src/*");

	let files = ["../thirdparty/triangle/triangle.c"];

	let headers_dirs = ["../thirdparty/triangle"];

	cc::Build::new()
		.files(files.iter())
		.includes(headers_dirs.iter())
		.warnings(true)
		.extra_warnings(true)
		.compile("libevacuationc.a");

	tauri_build::build()
}
