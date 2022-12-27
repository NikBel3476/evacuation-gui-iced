#![allow(non_camel_case_types)]

use libc::{c_char, c_double, c_int};
use std::cmp::Ordering;
use std::ffi::CString;

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

#[no_mangle]
pub extern "C" fn where_point_rust(
	a_ax: c_double,
	a_ay: c_double,
	a_bx: c_double,
	a_by: c_double,
	a_px: c_double,
	a_py: c_double,
) -> c_int {
	let s = (a_bx - a_ax) * (a_py - a_ay) - (a_by - a_ay) * (a_px - a_ax);
	match s.total_cmp(&0.0) {
		Ordering::Greater => 1, // Точка слева от вектора AB
		Ordering::Less => -1,   // Точка справа от вектора AB
		Ordering::Equal => 0,   // Точка на векторе, прямо по вектору или сзади вектора
	}
}

#[no_mangle]
pub extern "C" fn is_point_in_triangle_rust(
	a_ax: c_double,
	a_ay: c_double,
	a_bx: c_double,
	a_by: c_double,
	a_cx: c_double,
	a_cy: c_double,
	a_px: c_double,
	a_py: c_double,
) -> u8 {
	let q1 = where_point_rust(a_ax, a_ay, a_bx, a_by, a_px, a_py);
	let q2 = where_point_rust(a_bx, a_by, a_cx, a_cy, a_px, a_py);
	let q3 = where_point_rust(a_cx, a_cy, a_ax, a_ay, a_px, a_py);

	u8::try_from(q1 >= 0 && q2 >= 0 && q3 >= 0)
		.unwrap_or_else(|e| panic!("Failed to convert boolean to u8. {e}"))
}

#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn geom_tools_is_point_in_polygon_rust(
	point: *const point_t,
	polygon: *const polygon_t,
) -> u8 {
	let point = unsafe {
		point.as_ref().unwrap_or_else(||
			panic!("Failed to dereference pointer point at geom_tools_is_point_in_polygon_rust fn in bim_polygon_tools crate"))
	};

	let polygon = unsafe {
		polygon.as_ref().unwrap_or_else(||
			panic!("Failed to dereference pointer polygon at geom_tools_is_point_in_polygon_rust fn in bim_polygon_tools crate"))
	};

	let num_of_triangle_corner = (polygon.numofpoints - 2) * 3;

	let mut triangle_list = vec![0; usize::try_from(num_of_triangle_corner)
		.unwrap_or_else(|e|
			panic!("Failed to convert num_of_triangle_corner to usize at geom_tools_is_point_in_polygon_rust fn in bim_polygon_tools crate. {e}"))];

	let number_of_triangles = triangle_polygon_rust(polygon, triangle_list.as_mut_ptr());

	let points =
		unsafe { std::slice::from_raw_parts(polygon.points, polygon.numofpoints as usize) };

	for i in 0..number_of_triangles {
		let a = &points[triangle_list[(i * 3) as usize] as usize];
		let b = &points[triangle_list[(i * 3 + 1) as usize] as usize];
		let c = &points[triangle_list[(i * 3 + 2) as usize] as usize];
		if is_point_in_triangle_rust(a.x, a.y, b.x, b.y, c.x, c.y, point.x, point.y) == 1 {
			return 1;
		}
	}

	0
}

/// signed area of a triangle
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn area_rust(
	p1: *const point_t,
	p2: *const point_t,
	p3: *const point_t,
) -> c_double {
	let p1 = unsafe {
		p1.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer p1 at area fn in bim_polygon_tools crate")
		})
	};

	let p2 = unsafe {
		p2.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer p2 at area fn in bim_polygon_tools crate")
		})
	};

	let p3 = unsafe {
		p3.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer p3 at area fn in bim_polygon_tools crate")
		})
	};

	(p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)
}

#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn fswap_rust(v1: *mut c_double, v2: *mut c_double) {
	let v1 = unsafe {
		v1.as_mut().unwrap_or_else(|| {
			panic!("Failed to dereference pointer v1 at fswap fn in bim_polygon_tools crate")
		})
	};

	let v2 = unsafe {
		v2.as_mut().unwrap_or_else(|| {
			panic!("Failed to dereference pointer v2 at fswap fn in bim_polygon_tools crate")
		})
	};

	std::mem::swap(&mut (*v1), &mut (*v2));
}

/// https://e-maxx.ru/algo/segments_intersection_checking
#[no_mangle]
pub extern "C" fn intersect_1_rust(
	mut a: c_double,
	mut b: c_double,
	mut c: c_double,
	mut d: c_double,
) -> u8 {
	if a > b {
		fswap_rust(&mut a, &mut b);
	}
	if c > d {
		fswap_rust(&mut c, &mut d);
	}

	u8::try_from(a.max(c) <= b.min(d))
		.unwrap_or_else(|e| panic!("Failed to convert boolean to u8. {e}"))
}

/// check if two segments intersect
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn geom_tools_is_intersect_line_rust(l1: *const line_t, l2: *const line_t) -> u8 {
	let l1 = unsafe {
		l1.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer l1 at geom_tools_is_intersect_line_rust fn in bim_polygon_tools crate")
		})
	};

	let l2 = unsafe {
		l2.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer l2 at geom_tools_is_intersect_line_rust fn in bim_polygon_tools crate")
		})
	};

	let p1 = unsafe {
		l1.p1.as_ref().unwrap_or_else(|| panic!("Failed to dereference pointer p1 at geom_tools_is_intersect_line_rust fn in bim_polygon_tools crate"))
	};
	let p2 = unsafe {
		l1.p2.as_ref().unwrap_or_else(|| panic!("Failed to dereference pointer p1 at geom_tools_is_intersect_line_rust fn in bim_polygon_tools crate"))
	};
	let p3 = unsafe {
		l2.p1.as_ref().unwrap_or_else(|| panic!("Failed to dereference pointer p2 at geom_tools_is_intersect_line_rust fn in bim_polygon_tools crate"))
	};
	let p4 = unsafe {
		l2.p2.as_ref().unwrap_or_else(|| panic!("Failed to dereference pointer p2 at geom_tools_is_intersect_line_rust fn in bim_polygon_tools crate"))
	};

	u8::try_from(
		intersect_1_rust(p1.x, p2.x, p3.x, p4.x) == 1
			&& intersect_1_rust(p1.y, p2.y, p3.y, p4.y) == 1
			&& area_rust(p1, p2, p3) * area_rust(p1, p2, p4) <= 0.0
			&& area_rust(p3, p4, p1) * area_rust(p3, p4, p2) <= 0.0,
	)
	.unwrap_or_else(|e| panic!("Failed to convert boolean to u8. {e}"))
}

/// Определение точки на линии, расстояние до которой от заданной точки является минимальным из существующих
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn geom_tools_nearest_point_rust(
	point_start: *const point_t,
	line: *const line_t,
) -> *mut point_t {
	let point_start = unsafe {
		point_start.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer point_start at geom_tools_nearest_point fn in bim_polygon_tools crate")
		})
	};

	let line = unsafe {
		line.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer line at geom_tools_nearest_point fn in bim_polygon_tools crate")
		})
	};

	let p1 = unsafe {
		line.p1.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer p1 at geom_tools_nearest_point fn in bim_polygon_tools crate")
		})
	};

	let p2 = unsafe {
		line.p2.as_ref().unwrap_or_else(|| {
			panic!("Failed to dereference pointer p2 at geom_tools_nearest_point fn in bim_polygon_tools crate")
		})
	};

	if geom_tools_length_side_rust(p1, p2) < 1e-9 {
		return line.p1;
	}

	let a = point_start.x - p1.x;
	let b = point_start.y - p1.y;
	let c = p2.x - p1.x;
	let d = p2.y - p1.y;

	let dot = a * c + b * d;
	let len_sq = c * c + d * d;
	let mut param = -1.0;

	if len_sq != 0.0 {
		param = dot / len_sq;
	}

	let xx;
	let yy;

	if param < 0.0 {
		xx = p1.x;
		yy = p1.y;
	} else if param > 1.0 {
		xx = p2.x;
		yy = p2.y;
	} else {
		xx = p1.x + param * c;
		yy = p1.y + param * d;
	}

	Box::into_raw(Box::new(point_t { x: xx, y: yy }))
}
