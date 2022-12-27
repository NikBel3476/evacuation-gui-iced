fn main() {
    println!("cargo:rerun-if-changed=../*");

    let files = [
        "../../thirdparty/triangle/triangle.c"
    ];

    let headers_dirs = [
        "../../thirdparty/triangle"
    ];

    cc::Build::new()
        .files(files.iter())
        .includes(headers_dirs.iter())
        .warnings(true)
        .extra_warnings(true)
        .compile("trianglec.a");
}
