#include <stdarg.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

/**
 * Подсчитывает количество людей в здании по расширенной структуре
 */
double bim_tools_get_num_of_people_rust(const bim_t *bim);

/**
 * Устанавливает в помещение заданное количество людей
 */
void bim_tools_set_people_to_zone_rust(bim_zone_t *element, float num_of_people);

int find_zone_callback_rust(ArrayListValue value1, ArrayListValue value2);

line_t *intersected_edge_rust(const polygon_t *polygon_element, line_t *line);

struct bim_zone_t *_outside_init_rust(const bim_json_object_t *bim_json);

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
