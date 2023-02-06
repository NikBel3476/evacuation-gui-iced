/* Copyright © 2021 bvchirkov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "bim_graph.h"
#include "bim_graph/src/bim_graph_rust.h"

void graph_create_edges(const ArrayList *list_doors, ArrayListEqualFunc callback,
                        bim_edge_t edges[], const ArrayList *zones);

bim_graph_t *bim_graph_new(const bim_t *const bim) {
    bim_edge_t *edges = NULL;
    edges = (bim_edge_t *) calloc(bim->transits->length, sizeof(bim_edge_t));
    if (!edges) {
        return NULL;
    }

    graph_create_edges(bim->transits, arraylist_equal_callback_rust, edges, bim->zones);

    bim_graph_t *bim_graph = NULL;
    bim_graph = graph_create_rust(edges, bim->transits->length, bim->zones->length);
    free(edges);
    if (!bim_graph) {
        return NULL;
    }

    return bim_graph;
}

// Function to print adjacency list representation of a graph
void bim_graph_print(const bim_graph_t *const graph) {
    LOG_TRACE("-------------------------------------------------------------");
    LOG_TRACE("It is printed the graph struct [room_id —(door_id)-> room_id]");
    for (size_t i = 0; i < graph->node_count; i++) {
        // print current vertex and all its neighbors
        const bim_node_t *ptr = graph->head[i];
        while (ptr != NULL) {
            LOG_TRACE("%zu —(%lu)-> %lu\t", i, ptr->eid, ptr->dest);
            ptr = ptr->next;
        }
        LOG_TRACE("");
    }
}

void bim_graph_free(bim_graph_t *graph) {
    for (size_t i = 0; i < graph->node_count; ++i) {
        free(graph->head[i]);
    }
    free(graph->head);
    free(graph);
}

void graph_create_edges(const ArrayList *const list_doors, ArrayListEqualFunc callback,
                        bim_edge_t edges[], const ArrayList *const zones) {
    for (size_t i = 0; i < list_doors->length; ++i) {
        bim_edge_t *edge = &edges[i];
        edge->id = i;

        size_t ids[2] = {0, zones->length};
        for (size_t k = 0, j = 0; k < zones->length; ++k)
            if (callback(zones->data[k], list_doors->data[i]) && j != 2)
                ids[j++] = k;

        edge->src = ids[0];
        edge->dest = ids[1];
//        printf("EDGE id: %zu src: %zu dest: %zu\n", edge->id, edge->src, edge->dest);
    }
}
