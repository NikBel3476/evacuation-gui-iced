#include <stdarg.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>


typedef struct point_t {
  double x;
  double y;
} point_t;

typedef struct polygon_t {
  uint64_t numofpoints;
  struct point_t *points;
} polygon_t;

typedef struct line_t {
  struct point_t *p1;
  struct point_t *p2;
} line_t;

/**
 * signed area of a triangle
 */
double area_rust(const struct point_t *p1, const struct point_t *p2, const struct point_t *p3);

void fswap_rust(double *v1, double *v2);

double geom_tools_area_polygon_rust(const struct polygon_t *polygon);

/**
 * check if two segments intersect
 */
uint8_t geom_tools_is_intersect_line_rust(const struct line_t *l1, const struct line_t *l2);

uint8_t geom_tools_is_point_in_polygon_rust(const struct point_t *point,
                                            const struct polygon_t *polygon);

double geom_tools_length_side_rust(const struct point_t *p1, const struct point_t *p2);

/**
 * Определение точки на линии, расстояние до которой от заданной точки является минимальным из существующих
 */
struct point_t *geom_tools_nearest_point_rust(const struct point_t *point_start,
                                              const struct line_t *line);

/**
 * https://e-maxx.ru/algo/segments_intersection_checking
 */
uint8_t intersect_1_rust(double a, double b, double c, double d);

uint8_t is_point_in_triangle_rust(double a_ax,
                                  double a_ay,
                                  double a_bx,
                                  double a_by,
                                  double a_cx,
                                  double a_cy,
                                  double a_px,
                                  double a_py);

/**
 * #Returns
 * Массив номеров точек треугольников
 *
 * https://userpages.umbc.edu/~rostamia/cbook/triangle.html
 */
uint64_t triangle_polygon_rust(const struct polygon_t *polygon, int32_t *triangle_list);

int where_point_rust(double a_ax, double a_ay, double a_bx, double a_by, double a_px, double a_py);
