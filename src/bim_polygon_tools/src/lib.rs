#![allow(non_camel_case_types)]

use libc::c_double;

#[repr(C)]
pub struct point_t {
	pub x: c_double,
	pub y: c_double,
}

#[repr(C)]
pub struct line_t {
	pub p1: *mut point_t,
	pub p2: *mut point_t,
}

#[repr(C)]
pub struct polygon_t {
	pub numofpoints: u64,
	pub points: *mut point_t,
}

#[no_mangle]
#[allow(clippy::missing_safety_doc)]
pub unsafe extern "C" fn geom_tools_length_side_rust(
	p1: *const point_t,
	p2: *const point_t,
) -> c_double {
	let point1 = unsafe {
		p1.as_ref().unwrap_or_else(||
			panic!("Failed to dereference pointer p1 at geom_tools_length_side_rust fn in bim_polygon_tools crate"))
	};

	let point2 = unsafe {
		p2.as_ref().unwrap_or_else(||
			panic!("Failed to dereference pointer p2 at geom_tools_length_side_rust fn in bim_polygon_tools crate"))
	};

	((point1.x - point2.x).powi(2) + (point1.y - point2.y).powi(2)).sqrt()
}
