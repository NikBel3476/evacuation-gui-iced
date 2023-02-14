#![allow(non_camel_case_types)]

extern crate core;

use bim_tools::{bim_t_rust, bim_transit_t, bim_transit_t_rust, bim_zone_t, bim_zone_t_rust};
use libc::size_t;

/// https://www.techiedelight.com/implement-graph-data-structure-c
/// Data structure to store a graph object
#[repr(C)]
pub struct bim_graph_t {
	/// An array of pointers to Node to represent an adjacency list
	pub head: *mut *mut bim_node_t,
	pub node_count: size_t,
}

pub struct bim_graph_t_rust {
	pub head: Vec<Box<bim_node_t_rust>>,
}

/// Data structure to store adjacency list nodes of the graph
#[repr(C)]
pub struct bim_node_t {
	pub dest: size_t,
	/// edge id
	pub eid: size_t,
	pub next: *mut bim_node_t,
}

#[derive(Default, Clone)]
pub struct bim_node_t_rust {
	pub dest: usize,
	pub eid: usize,
	pub next: Option<Box<bim_node_t_rust>>,
}

/// Data structure to store a graph edge
#[repr(C)]
pub struct bim_edge_t {
	pub src: size_t,
	pub dest: size_t,
	pub id: size_t,
}

pub struct bim_edge_t_rust {
	pub src: usize,
	pub dest: usize,
	pub id: usize,
}

pub fn bim_graph_new(bim: &bim_t_rust) -> bim_graph_t_rust {
	let edges = graph_create_edges(&bim.transits, &bim.zones);

	graph_create(&edges, edges.len(), bim.zones.len())
}

pub fn bim_graph_new_test(bim: &bim_t_rust) -> *mut bim_graph_t {
	let edges = graph_create_edges_rust(&bim.transits, &bim.zones);

	graph_create_rust(
		edges.as_ptr(),
		bim.transits.len() as size_t,
		bim.zones.len() as size_t,
	)
}

/// Function to create an adjacency list from specified edges
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn graph_create_rust(
	edges: *const bim_edge_t,
	edge_count: size_t,
	node_count: size_t,
) -> *mut bim_graph_t {
	// initialize head pointer for all vertices
	let mut graph_head: Vec<*mut bim_node_t> = vec![std::ptr::null_mut(); node_count];

	let edges = unsafe { std::slice::from_raw_parts(edges, edge_count) };
	// add edges to the directed graph one by one
	for i in 0..edge_count {
		let edge = &edges[i];
		// get the source and destination vertex
		let src = edge.src;
		let dest = edge.dest;
		let eid = edge.id;

		// 1. allocate a new node of adjacency list from `src` to `dest`
		let mut new_node = bim_node_t {
			dest,
			eid,
			next: std::ptr::null_mut(),
		};

		// point new node to the current head
		new_node.next = graph_head[src];

		// point head pointer to the new node
		graph_head[src] = Box::into_raw(Box::new(new_node));

		// 2. allocate a new node of adjacency list from `dest` to `src`
		let new_node_dest_to_src = bim_node_t {
			dest: src,
			eid,
			// point new node to the current head
			next: graph_head[dest],
		};

		// change head pointer to point to the new node
		graph_head[dest] = Box::into_raw(Box::new(new_node_dest_to_src));
	}

	// allocate storage for the graph data structure
	let graph = bim_graph_t {
		head: graph_head.as_mut_ptr(),
		node_count,
	};

	std::mem::forget(graph_head);

	Box::into_raw(Box::new(graph))
}

/// Function to create an adjacency list from specified edges
pub fn graph_create(
	edges: &[bim_edge_t_rust],
	edge_count: usize,
	node_count: usize,
) -> bim_graph_t_rust {
	// initialize head pointer for all vertices
	let mut graph_head: Vec<Box<bim_node_t_rust>> = vec![Default::default(); node_count];

	// add edges to the directed graph one by one
	for i in 0..edge_count {
		let edge = &edges[i];
		// get the source and destination vertex
		let src = edge.src;
		let dest = edge.dest;
		let eid = edge.id;

		// 1. allocate a new node of adjacency list from `src` to `dest`
		let mut new_node = bim_node_t_rust {
			dest,
			eid,
			next: None,
		};

		// point new node to the current head
		new_node.next = Some(graph_head[src].clone());

		// point head pointer to the new node
		graph_head[src] = Box::new(new_node);

		// 2. allocate a new node of adjacency list from `dest` to `src`
		let new_node_dest_to_src = bim_node_t_rust {
			dest: src,
			eid,
			// point new node to the current head
			next: Some(graph_head[dest].clone()),
		};

		// change head pointer to point to the new node
		graph_head[dest] = Box::new(new_node_dest_to_src);
	}

	// allocate storage for the graph data structure
	bim_graph_t_rust { head: graph_head }
}

pub fn graph_create_edges_rust(
	list_doors: &[bim_transit_t_rust],
	zones: &[bim_zone_t_rust],
) -> Vec<bim_edge_t> {
	let mut edges: Vec<bim_edge_t> = vec![];

	for (i, transition) in list_doors.iter().enumerate() {
		let mut ids = [0, zones.len()];
		let mut j = 0usize;
		for (k, zone) in zones.iter().enumerate() {
			if equal_callback(zone, transition) && j != 2 {
				ids[j] = k;
				j += 1;
			}
		}

		let edge = bim_edge_t {
			id: i,
			src: ids[0],
			dest: ids[1],
		};
		edges.push(edge);
	}

	edges
}

pub fn graph_create_edges(
	list_doors: &[bim_transit_t_rust],
	zones: &[bim_zone_t_rust],
) -> Vec<bim_edge_t_rust> {
	let mut edges: Vec<bim_edge_t_rust> = vec![];

	for (i, transition) in list_doors.iter().enumerate() {
		let mut ids = [0, zones.len()];
		let mut j = 0usize;
		for (k, zone) in zones.iter().enumerate() {
			if equal_callback(zone, transition) && j != 2 {
				ids[j] = k;
				j += 1;
			}
		}

		let edge = bim_edge_t_rust {
			id: i,
			src: ids[0],
			dest: ids[1],
		};
		edges.push(edge);
	}

	edges
}

#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn arraylist_equal_callback_rust(
	value1: *const bim_zone_t,
	value2: *const bim_transit_t,
) -> i32 {
	let element1 = unsafe {
		value1
			.as_ref()
			.unwrap_or_else(|| panic!("Failed to get reference of value1"))
	};

	let element2 = unsafe {
		value2
			.as_ref()
			.unwrap_or_else(|| panic!("Failed to get reference of value2"))
	};

	for i in 0..element1.numofoutputs {
		let outputs =
			unsafe { std::slice::from_raw_parts(element1.outputs, element1.numofoutputs as usize) };
		if outputs[i as usize].x.eq(&element2.uuid.x) {
			return 1;
		}
	}

	0
}

pub fn equal_callback(zone: &bim_zone_t_rust, transit: &bim_transit_t_rust) -> bool {
	for output in &zone.outputs {
		if output.eq(&transit.uuid) {
			return true;
		}
	}

	false
}
