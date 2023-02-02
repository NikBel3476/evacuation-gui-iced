#![allow(non_camel_case_types)]

extern crate core;

use bim_tools::{bim_transit_t, bim_transit_t_rust, bim_zone_t, bim_zone_t_rust};
use libc::{c_ulong, size_t};

/// https://www.techiedelight.com/implement-graph-data-structure-c
/// Data structure to store a graph object
#[repr(C)]
pub struct bim_graph_t {
	/// An array of pointers to Node to represent an adjacency list
	head: *mut *mut bim_node_t,
	node_count: size_t,
}

pub struct bim_graph_t_rust {
	head: Vec<bim_node_t_rust>,
}

/// Data structure to store adjacency list nodes of the graph
#[repr(C)]
pub struct bim_node_t {
	dest: size_t,
	eid: size_t,
	next: *mut bim_node_t,
}

#[derive(Default, Clone)]
pub struct bim_node_t_rust {
	dest: usize,
	eid: usize,
	next: Option<Box<bim_node_t_rust>>,
}

/// Data structure to store a graph edge
#[repr(C)]
pub struct bim_edge_t {
	src: size_t,
	dest: size_t,
	id: size_t,
}

pub struct bim_edge_t_rust {
	src: usize,
	dest: usize,
	id: usize,
}

/*pub fn graph_create(edges: &[bim_edge_t_rust], node_count: usize) -> bim_graph_t_rust {
	let mut graph = bim_graph_t_rust {
		head: vec![bim_node_t_rust::default(); node_count],
	};

	let mut src = 0usize;
	let mut dest = 0usize;
	let mut eid = 0usize;
	for edge in edges {
		src = edge.src;
		dest = edge.dest;
		eid = edge.id;

		// 1. allocate a new node of adjacency list from `src` to `dest`
		let new_node = bim_node_t_rust {
			eid,
			dest,
			next: Some(Box::new(graph.head[src])),
		};

		graph.head[src]
	}

	graph
}*/

/// Function to create an adjacency list from specified edges
#[no_mangle]
#[allow(clippy::not_unsafe_ptr_arg_deref)]
pub extern "C" fn graph_create_rust(
	edges: *const bim_edge_t,
	edge_count: size_t,
	node_count: size_t,
) -> *mut bim_graph_t {
	let mut graph_head: Vec<*mut bim_node_t> = vec![std::ptr::null_mut(); node_count];

	let src: size_t = 0;
	let dest: size_t = 0;
	let eid: size_t = 0;
	let edges = unsafe { std::slice::from_raw_parts(edges, edge_count) };
	// add edges to the directed graph one by one
	for i in 0..edge_count {
		let edge = &edges[i];
		// get the source and destination vertex
		let src = edge.src;
		let dest = edge.dest;
		let eid = edge.id;

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

	let mut graph = bim_graph_t {
		head: graph_head.as_mut_ptr(),
		node_count,
	};

	std::mem::forget(graph_head);

	Box::into_raw(Box::new(graph))
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

pub fn equal_callback(zone: &bim_zone_t_rust, transit: &bim_transit_t_rust) -> bool {
	for output in &zone.outputs {
		if output.eq(&transit.uuid) {
			return true;
		}
	}

	false
}

/*#[no_mangle]
pub extern "C" fn graph_create_edges_rust(
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
}*/

/*#[no_mangle]
pub extern "C" fn create_graph(edges: *const bim_edge_t, edge_count: c_ulong, node_count: c_ulong) -> *mut bim_graph_t {
	let edges_slice = unsafe {
		std::slice::from_raw_parts(edges, edge_count as usize)
	};

	for i in 0..edge_count {
		let edge = edges_slice[i as usize];

		let new_node = bim_node_t {
			dest: edge.dest,

		}
	}

	let graph = bim_graph_t {
		head: ,
		node_count
	}

	let graph_ptr = graph.as_mut_ptr();
	std::mem::forget(graph);

	graph_ptr
}*/

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
