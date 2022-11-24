#![allow(non_camel_case_types)]

use libc::{c_ulong}

#[repr(C)]
pub struct bim_graph_t {
    head: **mut bim_node_t,
    node_count: c_ulong
}

#[repr(C)]
pub struct bim_node_t {
    dest: c_ulong,
    eid: c_ulong,
    next: *mut bim_node_t
}

#[repr(C)]
pub struct bim_edge_t {
    src: c_ulong,
    dest: c_ulong,
    id: c_ulong
}

/*#[no_mangle]
pub extern "C" fn create_graph(edges: *const bim_edge_t, edge_count: c_ulong, node_count: c_ulong) -> *mut bim_graph_t {
    let edges_slice = unsafe {
        std::slice::from_raw_parts(edges as *const bim_edge_t, edge_count as usize)
    }

    for i in 0..edge_count {
        let edge = edges_slice[i];

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