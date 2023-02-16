fn main() {
	println!("cargo:rerun-if-changed=src/triangle/*");

	let files = ["src/triangle/triangle.c"];

	let headers_dirs = ["src/triangle"];

	cc::Build::new()
		.files(files.iter())
		.includes(headers_dirs.iter())
		.warnings(true)
		.extra_warnings(true)
		.compile("libevacuationc.a");

	tauri_build::build()
}
