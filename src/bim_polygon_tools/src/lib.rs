#![allow(non_camel_case_types)]

use libc::{c_char, c_double, c_int};
use std::ffi::{CStr, CString};

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

#[repr(C)]
pub struct triangulateio {
	/// In / out
	pub pointlist: *mut c_double,
	/// In / out
	pub pointattributelist: *mut c_double,
	/// In / out
	pub pointmarkerlist: *mut c_int,
	/// In / out
	pub numberofpoints: c_int,
	/// In / out
	pub numberofpointattributes: c_int,

	/// In / out
	pub trianglelist: *mut c_int,
	/// In / out
	pub triangleattributelist: *mut c_double,
	/// In only
	pub trianglearealist: *mut c_double,
	/// Out only
	pub neighborlist: *mut c_int,
	/// In / out
	pub numberoftriangles: c_int,
	/// In / out
	pub numberofcorners: c_int,
	/// In / out
	pub numberoftriangleattributes: c_int,

	/// In / out
	pub segmentlist: *mut c_int,
	/// In / out
	pub segmentmarkerlist: *mut c_int,
	/// In / out
	pub numberofsegments: c_int,

	/// In / pointer to array copied out
	pub holelist: *mut c_double,
	/// In / copied out
	pub numberofholes: c_int,

	/// In / pointer to array copied out
	pub regionlist: *mut c_double,
	/// In / copied out
	pub numberofregions: c_int,

	/// Out only
	pub edgelist: *mut c_int,
	/// Not used with Voronoi diagram; out only
	pub edgemarkerlist: *mut c_int,
	/// Used only with Voronoi diagram; out only
	pub normlist: *mut c_double,
	/// Out only
	pub numberofedges: c_int,
}

extern "C" {
	fn triangulate(
		triswitches: *mut c_char,
		_in: *mut triangulateio,
		_out: *mut triangulateio,
		thevoro: *mut triangulateio,
	);
}

/// #Returns
/// Массив номеров точек треугольников
///
/// https://userpages.umbc.edu/~rostamia/cbook/triangle.html
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn triangle_polygon_rust(polygon: *const polygon_t, triangle_list: *mut i32) -> u64 {
	let polygon = unsafe {
		polygon.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer polygon at triangle_polygon_rust fn in bim_polygon_tools crate")
		})
	};

	let points =
		unsafe { std::slice::from_raw_parts(polygon.points, polygon.numofpoints as usize) };

	let mut point_list = vec![0.0; 2 * usize::try_from(polygon.numofpoints).unwrap_or_else(|_| {
		panic!("Failed to convert polygon.numofpoints to usize at triangle_polygon_rust fn in bim_polygon_tools crate")
	})];

	for i in 0..polygon.numofpoints {
		point_list[(i * 2) as usize] = points[i as usize].x;
		point_list[(i * 2 + 1) as usize] = points[i as usize].y;
	}

	let mut polygon_to_triangulate = triangulateio {
		pointlist: point_list.as_mut_ptr(),
		pointattributelist: std::ptr::null_mut(),
		pointmarkerlist: std::ptr::null_mut(),
		numberofpoints: polygon.numofpoints as i32,
		trianglelist: triangle_list, // Индексы точек треугольников против часовой стрелки
		numberofpointattributes: 0,
		triangleattributelist: std::ptr::null_mut(),
		trianglearealist: std::ptr::null_mut(),
		neighborlist: std::ptr::null_mut(),
		numberoftriangles: 0,
		numberofcorners: 0,
		numberoftriangleattributes: 0,
		segmentlist: std::ptr::null_mut(),
		segmentmarkerlist: std::ptr::null_mut(),
		numberofsegments: 0,
		holelist: std::ptr::null_mut(),
		numberofholes: 0,
		regionlist: std::ptr::null_mut(),
		numberofregions: 0,
		edgelist: std::ptr::null_mut(),
		edgemarkerlist: std::ptr::null_mut(),
		normlist: std::ptr::null_mut(),
		numberofedges: 0,
	};

	let triswitches = CString::new("zQ").unwrap_or_else(|_| {
		panic!("Failed to create CString from \"zQ\" at triangle_polygon_rust fn in bim_polygon_tools crate")
	});
	unsafe {
		triangulate(
			triswitches.into_raw(),
			&mut polygon_to_triangulate,
			&mut polygon_to_triangulate,
			std::ptr::null_mut(),
		)
	}

	u64::try_from(polygon_to_triangulate.numberoftriangles).unwrap_or_else(|e| {
		panic!("Failed to convert numberoftriangles to u64 at triangle_polygon_rust fn in bim_polygon_tools crate. {e}")
	})
}

#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn geom_tools_length_side_rust(p1: *const point_t, p2: *const point_t) -> c_double {
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

#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn geom_tools_area_polygon_rust(polygon: *const polygon_t) -> c_double {
	let polygon = unsafe {
		polygon.as_ref().unwrap_or_else(||
			panic!("Failed to dereference pointer polygon at geom_tools_area_polygon fn in bim_polygon_tools crate"))
	};

	let num_of_triangle_corner = (polygon.numofpoints - 2) * 3;

	let mut triangle_list = vec![0; usize::try_from(num_of_triangle_corner)
		.unwrap_or_else(|e|
			panic!("Failed to convert num_of_triangle_corner to usize at geom_tools_area_polygon fn in bim_polygon_tools crate, {e}"))];

	let number_of_triangles = triangle_polygon_rust(polygon, triangle_list.as_mut_ptr());

	// calculate the area by the formula S=(p(p-ab)(p-bc)(p-ca))^0.5;
	// p=(ab+bc+ca)0.5
	let mut area_element = 0.0;
	let points =
		unsafe { std::slice::from_raw_parts(polygon.points, polygon.numofpoints as usize) };
	for i in 0..number_of_triangles {
		let a = &points[triangle_list[(i * 3) as usize] as usize];
		let b = &points[triangle_list[(i * 3 + 1) as usize] as usize];
		let c = &points[triangle_list[(i * 3 + 2) as usize] as usize];
		let ab = geom_tools_length_side_rust(a, b);
		let bc = geom_tools_length_side_rust(b, c);
		let ca = geom_tools_length_side_rust(c, a);
		let p = (ab + bc + ca) * 0.5;
		area_element += (p * (p - ab) * (p - bc) * (p - ca)).sqrt();
	}

	area_element
}
