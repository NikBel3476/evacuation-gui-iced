use bim_tools::{bim_t_rust, bim_transit_t_rust, bim_zone_t_rust};
use fnv::FnvHashMap;
use petgraph::Undirected;
use std::hash::Hash;

struct Graph<VId, E = (), V = ()> {
	vertices: FnvHashMap<VId, V>,
	adjacency: FnvHashMap<VId, Vec<(VId, E)>>,
}

impl<VId, E, V> Graph<VId, E, V>
where
	VId: Eq + Hash,
	V: Hash,
{
	fn new() -> Graph<VId, E, V> {
		Graph {
			vertices: FnvHashMap::default(),
			adjacency: FnvHashMap::default(),
		}
	}

	fn push_vertex(self: &mut Graph<VId, E, V>, vid: VId, vertex: V) {
		self.vertices.insert(vid, vertex);
	}

	fn push_edge(self: &mut Self, from: VId, to: VId, edge: E) {
		let adjacent_to_from = self.adjacency.entry(from).or_default();
		adjacent_to_from.push((to, edge));
	}
}

impl<VId, E> Graph<VId, E, ()>
where
	VId: Eq + Hash,
{
	fn push_vid(self: &mut Self, vid: VId) {
		self.vertices.insert(vid, ());
	}
}

impl<VId, E, V> Graph<VId, E, V>
where
	VId: Eq + Hash + Clone,
	V: Hash,
	E: Clone,
{
	fn push_undirected_edge(self: &mut Self, from: VId, to: VId, edge: E) {
		self.push_edge(from.clone(), to.clone(), edge.clone());
		self.push_edge(to, from, edge);
	}
}

pub struct Node {
	dest: u64,
	edge_id: u64,
}

pub struct Edge {
	id: usize,
	src: u64,
	dest: u64,
}

/*pub fn graph_new(bim: &bim_t_rust) -> petgraph::Graph<Node, Edge, Undirected> {
	let edges = graph_create_edges(&bim.transits, &bim.zones);

	graph
}

pub fn graph_create_edges(
	list_doors: &[bim_transit_t_rust],
	zones: &[bim_zone_t_rust],
) -> Vec<Edge> {
	let mut edges: Vec<Edge> = vec![];

	for (i, transition) in list_doors.iter().enumerate() {
		let mut ids = [0, zones.len()];
		let mut j = 0usize;
		for (k, zone) in zones.iter().enumerate() {
			if equal_callback(zone, transition) && j != 2 {
				ids[j] = k;
				j += 1;
			}
		}

		let edge = Edge {
			id: i,
			src: ids[0] as u64,
			dest: ids[1] as u64,
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

pub fn graph_create(edges: &[Edge], node_count: usize) -> petgraph::Graph<Node, Edge, Undirected> {
	let mut graph = petgraph::Graph::new_undirected();

	let mut src = 0usize;
	let mut dest = 0usize;
	let mut eid = 0usize;
	for edge in edges {
		src = edge.src as usize;
		dest = edge.dest as usize;
		eid = edge.id;

		// 1. allocate a new node of adjacency list from `src` to `dest`
		let new_node = Node {
			edge_id: eid as u64,
			dest: dest as u64,
		};

		graph.add_node(new_node);
	}

	graph
}*/
