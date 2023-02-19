use super::json_object::Point;
use std::cmp::Ordering;
use std::ffi::CString;
use triangle_rs::{triangulate, triangulateio};

pub struct Line {
	pub p1: Point,
	pub p2: Point,
}

#[derive(Debug, Clone, Default)]
pub struct Polygon {
	pub points: Vec<Point>,
}

impl Polygon {
	pub fn area(&self) -> f64 {
		let num_of_triangle_corner = (self.points.len() - 2) * 3;

		let mut triangle_list = vec![0; num_of_triangle_corner];

		let number_of_triangles = self.triangulate(&mut triangle_list);

		// calculate the area by the formula S=(p(p-ab)(p-bc)(p-ca))^0.5;
		// p=(ab+bc+ca)0.5
		let mut area_element = 0.0;
		for i in 0..number_of_triangles {
			let a = &self.points[triangle_list[(i * 3) as usize] as usize];
			let b = &self.points[triangle_list[(i * 3 + 1) as usize] as usize];
			let c = &self.points[triangle_list[(i * 3 + 2) as usize] as usize];
			let ab = a.distance_to(b);
			let bc = b.distance_to(c);
			let ca = c.distance_to(a);
			let p = (ab + bc + ca) * 0.5;
			area_element += (p * (p - ab) * (p - bc) * (p - ca)).sqrt();
		}

		area_element
	}

	/// #Returns
	/// Массив номеров точек треугольников
	///
	/// https://userpages.umbc.edu/~rostamia/cbook/triangle.html
	pub fn triangulate(&self, triangle_list: &mut [i32]) -> u64 {
		let mut point_list = vec![0.0; 2 * self.points.len()];

		for i in 0..self.points.len() {
			point_list[i * 2] = self.points[i].x;
			point_list[i * 2 + 1] = self.points[i].y;
		}

		let mut polygon_to_triangulate = triangulateio {
			pointlist: point_list.as_mut_ptr(),
			pointattributelist: std::ptr::null_mut(),
			pointmarkerlist: std::ptr::null_mut(),
			numberofpoints: self.points.len() as i32,
			trianglelist: triangle_list.as_mut_ptr(), // Индексы точек треугольников против часовой стрелки
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
}

fn where_point_rust(a_ax: f64, a_ay: f64, a_bx: f64, a_by: f64, a_px: f64, a_py: f64) -> i32 {
	let s = (a_bx - a_ax) * (a_py - a_ay) - (a_by - a_ay) * (a_px - a_ax);
	match s.total_cmp(&0.0) {
		Ordering::Greater => 1, // Точка слева от вектора AB
		Ordering::Less => -1,   // Точка справа от вектора AB
		Ordering::Equal => 0,   // Точка на векторе, прямо по вектору или сзади вектора
	}
}

fn is_point_in_triangle(
	a_ax: f64,
	a_ay: f64,
	a_bx: f64,
	a_by: f64,
	a_cx: f64,
	a_cy: f64,
	a_px: f64,
	a_py: f64,
) -> bool {
	let q1 = where_point_rust(a_ax, a_ay, a_bx, a_by, a_px, a_py);
	let q2 = where_point_rust(a_bx, a_by, a_cx, a_cy, a_px, a_py);
	let q3 = where_point_rust(a_cx, a_cy, a_ax, a_ay, a_px, a_py);

	q1 >= 0 && q2 >= 0 && q3 >= 0
}

pub fn is_point_in_polygon(point: &Point, polygon: &Polygon) -> bool {
	let num_of_triangle_corner = polygon.points.len().checked_sub(2).unwrap_or_else(|| {
		panic!(
			"Attempt to subtract with overflow. Number of polygon points: {}",
			polygon.points.len()
		)
	}) * 3;

	let mut triangle_list = vec![0; num_of_triangle_corner];

	let number_of_triangles = polygon.triangulate(&mut triangle_list);

	for i in 0..number_of_triangles {
		let a = &polygon.points[triangle_list[(i * 3) as usize] as usize];
		let b = &polygon.points[triangle_list[(i * 3 + 1) as usize] as usize];
		let c = &polygon.points[triangle_list[(i * 3 + 2) as usize] as usize];
		if is_point_in_triangle(a.x, a.y, b.x, b.y, c.x, c.y, point.x, point.y) {
			return true;
		}
	}

	false
}

/// signed area of a triangle
pub fn area(p1: &Point, p2: &Point, p3: &Point) -> f64 {
	(p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)
}

/// https://e-maxx.ru/algo/segments_intersection_checking
pub fn intersect_1_rust(mut a: f64, mut b: f64, mut c: f64, mut d: f64) -> bool {
	if a > b {
		std::mem::swap(&mut a, &mut b);
	}
	if c > d {
		std::mem::swap(&mut c, &mut d);
	}

	a.max(c) <= b.min(d)
}

/// check if two segments intersect
pub fn is_intersect_line(l1: &Line, l2: &Line) -> bool {
	let p1 = &l1.p1;
	let p2 = &l1.p2;
	let p3 = &l2.p1;
	let p4 = &l2.p2;

	intersect_1_rust(p1.x, p2.x, p3.x, p4.x)
		&& intersect_1_rust(p1.y, p2.y, p3.y, p4.y)
		&& area(p1, p2, p3) * area(p1, p2, p4) <= 0.0
		&& area(p3, p4, p1) * area(p3, p4, p2) <= 0.0
}
