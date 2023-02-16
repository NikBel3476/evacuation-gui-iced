fn main() {
	println!("cargo:rerun-if-changed=../*");

	let files = ["../triangle/triangle.c"];

	let headers_dirs = ["../triangle"];

	cc::Build::new()
		.files(files.iter())
		.includes(headers_dirs.iter())
		.warnings(true)
		.extra_warnings(true)
		.compile("trianglec.a");
}
