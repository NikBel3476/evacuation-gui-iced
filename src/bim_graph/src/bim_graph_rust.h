#include <stdarg.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
#include "../../../thirdparty/arraylist/arraylist.h"

int32_t arraylist_equal_callback_rust(ArrayListValue value1, ArrayListValue value2);

struct bim_graph_t *graph_create_rust(const struct bim_edge_t *edges,
                                 unsigned long edge_count,
                                 unsigned long node_count);
