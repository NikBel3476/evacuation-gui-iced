fn main() {
	println!("cargo:rerun-if-changed=../src/*");

	let files = [
		"../thirdparty/arraylist/arraylist.c",
		"../thirdparty/triangle/triangle.c",
		"../thirdparty/c-logger/src/logger.c",
		"../thirdparty/c-logger/src/loggerconf.c",
		"../src/bim_configure.c",
		"../src/bim_evac.c",
		"../src/bim_graph.c",
		"../src/bim_json_object.c",
		"../src/bim_output.c",
		"../src/bim_tools.c",
		"../src/run.c",
	];

	let headers_dirs = [
		"../src",
		"../src/bim_cli/src",
		"../src/bim_configure/src",
		"../src/bim_json_object/src",
		"../src/bim_output/src",
		"../src/bim_polygon_tools/src",
		"../thirdparty/arraylist",
		"../thirdparty/triangle",
		"../thirdparty/c-logger/src",
	];

	cc::Build::new()
		.files(files.iter())
		.includes(headers_dirs.iter())
		.warnings(true)
		.extra_warnings(true)
		.compile("libevacuationc.a");

	tauri_build::build()
}
