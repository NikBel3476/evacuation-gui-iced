#include <stdarg.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
#include "../../../thirdparty/arraylist/arraylist.h"
#include "../../bim_graph.h"

bim_graph_t *graph_create_rust(const bim_edge_t edges[], size_t edge_count, size_t node_count);

int32_t arraylist_equal_callback_rust(ArrayListValue value1, ArrayListValue value2);
