use super::json_object::Point;
use spade::{ConstrainedDelaunayTriangulation, Point2, Triangulation};
use std::cmp::Ordering;
use triangle_rs::Delaunay;

pub struct Line {
	pub p1: Point,
	pub p2: Point,
}

#[derive(Debug, Clone, Default)]
pub struct Polygon {
	pub points: Vec<Point>,
	// delaunay: Delaunay,
}

impl Polygon {
	/// #Returns
	/// Массив номеров точек треугольников
	///
	/// https://userpages.umbc.edu/~rostamia/cbook/triangle.html
	pub fn triangulate(&self) -> ConstrainedDelaunayTriangulation<Point2<f64>> {
		// let polygon = self
		// 	.points
		// 	.iter()
		// 	.flat_map(|point| vec![point.x, point.y])
		// 	.collect::<Vec<f64>>();
		//
		// let tri = triangle_rs::Builder::new()
		// 	.set_switches("pQ")
		// 	.add_polygon(&polygon)
		// 	.build();
		//
		// tri

		let mut cdt = ConstrainedDelaunayTriangulation::<Point2<f64>>::new();
		self.points.chunks(2).for_each(|points| match points.len() {
			2 => {
				let vertex0 = Point2::new(points[0].x, points[0].y);
				let vertex1 = Point2::new(points[1].x, points[1].y);
				cdt.insert(vertex0).unwrap_or_else(|err| {
					panic!("{err}\n{:?}", points[0]);
				});
				cdt.insert(vertex1).unwrap_or_else(|err| {
					panic!("{err}\n{:?}", points[1]);
				});

				cdt.add_constraint_edge(vertex0, vertex1)
					.unwrap_or_else(|err| {
						panic!("{err}\n{:?}\n{:?}", vertex0, vertex1);
					});
			}
			1 => {
				let vertex0 = Point2::new(points[0].x, points[0].y);
				let vertex1 = Point2::new(self.points[0].x, self.points[0].y);
				cdt.insert(vertex0).unwrap_or_else(|err| {
					panic!("{err}\n{:?}", points[0]);
				});

				cdt.add_constraint_edge(vertex0, vertex1)
					.unwrap_or_else(|err| {
						panic!("{err}\n{:?}\n{:?}", vertex0, vertex1);
					});
			}
			_ => {}
		});

		cdt
	}

	pub fn area(&self) -> f64 {
		// let tri = self.triangulate();
		// Ok(self.delaunay.area())
		let cdt = self.triangulate();
		cdt.inner_faces()
			.fold(0.0, |area, triangle| area + triangle.area())
	}

	pub fn is_point_inside(&self, point: &Point) -> Result<bool, String> {
		if self.points.len() < 3 {
			return Err(String::from("Less than 3 vertices"));
		}

		// let tri = self.triangulate();
		// Ok(self.delaunay.is_point_inside(&[point.x, point.y]))
		let cdt = self.triangulate();
		Ok(cdt.inner_faces().any(|face| {
			let [a, b, c] = face.vertices();
			let d1 = self.sign(point, &a.position(), &b.position());
			let d2 = self.sign(point, &b.position(), &c.position());
			let d3 = self.sign(point, &c.position(), &a.position());
			let has_neg = (d1 < 0.0) || (d2 < 0.0) || (d3 < 0.0);
			let has_pos = (d1 > 0.0) || (d2 > 0.0) || (d3 > 0.0);

			!(has_neg && has_pos)
		}))
	}

	fn sign(&self, p1: &Point, p2: &Point2<f64>, p3: &Point2<f64>) -> f64 {
		(p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)
	}
}

impl From<&[Point]> for Polygon {
	fn from(points: &[Point]) -> Self {
		Self {
			points: points.to_vec(),
			// delaunay: triangulate(points),
		}
	}
}

fn triangulate(points: &[Point]) -> Delaunay {
	let polygon = points
		.iter()
		.flat_map(|point| vec![point.x, point.y])
		.collect::<Vec<f64>>();

	let tri = triangle_rs::Builder::new()
		.set_switches("pQ")
		.add_polygon(&polygon)
		.build();

	tri
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

// pub fn is_point_in_polygon(point: &Point, polygon: &Polygon) -> Result<bool, String> {
// 	if polygon.points.len() < 3 {
// 		return Err(String::from("Less than 3 vertices"));
// 	}
//
// 	let tri = polygon.triangulate();
// 	Ok(tri.is_point_inside(&[point.x, point.y]))
// }

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
