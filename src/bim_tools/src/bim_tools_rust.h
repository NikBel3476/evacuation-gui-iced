#include <stdarg.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>


line_t *intersected_edge_rust(const polygon_t *polygon_element, line_t *line);

/**
 * Возможные варианты стыковки помещений, которые соединены проемом
 *
 * Код ниже определяет область их пересечения
 * ```
 * +----+  +----+     +----+
 *      |  |               | +----+
 *      |  |               | |
 *      |  |               | |
 * +----+  +----+          | |
 *                         | +----+
 * +----+             +----+
 *      |  +----+
 *      |  |          +----+ +----+
 *      |  |               | |
 * +----+  |               | |
 *         +----+          | +----+
 *                    +----+
 * ```
 * *************************************************************************
 * 1. Определить грани помещения, которые пересекает короткая сторона проема
 * 2. Вычислить среднее проекций граней друг на друга
 */
double width_door_way_rust(const polygon_t *zone1,
                           const polygon_t *zone2,
                           const line_t *edge1,
                           const line_t *edge2);
