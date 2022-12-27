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

#include "bim_polygon_tools.h"

// https://userpages.umbc.edu/~rostamia/cbook/triangle.html
/// @return Массив номеров точек треугольников
/*static size_t triangle_polygon(const polygon_t *const polygon, int *triangle_list) {
    struct triangulateio in;
    size_t num_of_points = polygon->numofpoints*//* - 1*//*;
    REAL *pointlist = (REAL *) calloc(num_of_points * 2, sizeof(REAL));

    size_t counter = 0;
    for (size_t i = 0; i < num_of_points; i++) {
        pointlist[counter++] = polygon->points[i].x;
        pointlist[counter++] = polygon->points[i].y;
    }

    in.pointlist = pointlist;
    in.pointattributelist = (REAL *) NULL;
    in.pointmarkerlist = (int *) NULL;
    in.numberofpoints = (int)num_of_points;
    in.trianglelist = triangle_list;  // Индексы точек треугольников против часовой стрелки
    in.numberofpointattributes = 0;
    in.triangleattributelist = NULL;
    in.trianglearealist = NULL;
    in.neighborlist = NULL;
    in.numberoftriangles = 0;
    in.numberofcorners = 0;
    in.numberoftriangleattributes = 0;
    in.segmentlist = NULL;
    in.segmentmarkerlist = NULL;
    in.numberofsegments = 0;
    in.holelist = NULL;
    in.numberofholes = 0;
    in.regionlist = NULL;
    in.numberofregions = 0;
    in.edgelist = NULL;
    in.edgemarkerlist = NULL;
    in.normlist = NULL;
    in.numberofedges = 0;

    char *triswitches = "zQ";
    triangulate(triswitches, &in, &in, NULL);
    free(pointlist);
    return (size_t) in.numberoftriangles;
}*/

/*double geom_tools_length_side(const point_t *const p1, const point_t *const p2) {
    return sqrt(pow(p1->x - p2->x, 2) + pow(p1->y - p2->y, 2));
}*/

/*double geom_tools_area_polygon(const polygon_t *const polygon) {
    size_t num_of_triangle_corner = (polygon->numofpoints - 2) * 3;

    int *triangle_list = (int *) calloc(num_of_triangle_corner, sizeof(int));
    if (!triangle_list) {
        return -1;
    }

    size_t number_of_triangles = triangle_polygon_rust(polygon, triangle_list);

    //Вычисляем площадь по формуле S=(p(p-ab)(p-bc)(p-ca))^0.5;
    //p=(ab+bc+ca)0.5
    double areaElement = 0;
    for (size_t i = 0, start_corner = 0; i < number_of_triangles; ++i, start_corner = i * 3) {
        const point_t *a = &polygon->points[triangle_list[start_corner + 0]];
        const point_t *b = &polygon->points[triangle_list[start_corner + 1]];
        const point_t *c = &polygon->points[triangle_list[start_corner + 2]];
        double ab = geom_tools_length_side_rust(a, b);
        double bc = geom_tools_length_side_rust(b, c);
        double ca = geom_tools_length_side_rust(c, a);
        double p = (ab + bc + ca) * 0.5;
        areaElement += sqrt(p * (p - ab) * (p - bc) * (p - ca));
    }

    free(triangle_list);
    return areaElement;
}*/

/*static int where_point(double aAx, double aAy, double aBx, double aBy, double aPx, double aPy) {
    double s = (aBx - aAx) * (aPy - aAy) - (aBy - aAy) * (aPx - aAx);
    if (s > 0) return 1;        // Точка слева от вектора AB
    else if (s < 0) return -1;   // Точка справа от вектора AB
    else return 0;              // Точка на векторе, прямо по вектору или сзади вектора
}*/

/*static uint8_t
is_point_in_triangle(double aAx, double aAy, double aBx, double aBy, double aCx, double aCy,
                      double aPx, double aPy) {
    int q1 = where_point_rust(aAx, aAy, aBx, aBy, aPx, aPy);
    int q2 = where_point_rust(aBx, aBy, aCx, aCy, aPx, aPy);
    int q3 = where_point_rust(aCx, aCy, aAx, aAy, aPx, aPy);

    return (q1 >= 0 && q2 >= 0 && q3 >= 0);
}*/

/*uint8_t geom_tools_is_point_in_polygon(const point_t *const point, const polygon_t *const polygon) {
    size_t numof_triangle_corner = (polygon->numofpoints - 2) * 3;

    int *triangle_list = NULL;
    triangle_list = (int *) calloc(numof_triangle_corner, sizeof(int));
    if (!triangle_list) {
        return -1;
    }

    size_t numberoftriangles = triangle_polygon_rust(polygon, triangle_list);
    uint8_t result = 0;
    for (size_t i = 0, start_corner = 0; i < numberoftriangles; ++i, start_corner = i * 3) {
        const point_t *a = &polygon->points[triangle_list[start_corner + 0]];
        const point_t *b = &polygon->points[triangle_list[start_corner + 1]];
        const point_t *c = &polygon->points[triangle_list[start_corner + 2]];
        result = is_point_in_triangle_rust(a->x, a->y, b->x, b->y, c->x, c->y, point->x, point->y);
        if (result == 1) break;
    }
    free(triangle_list);
    return result;
}*/

// signed area of a triangle
/*static double area(const point_t *p1, const point_t *p2, const point_t *p3) {
    return (p2->x - p1->x) * (p3->y - p1->y) - (p2->y - p1->y) * (p3->x - p1->x);
}*/

/*static void fswap(double *v1, double *v2) {
    double tmp_v1 = *v1;
    *v1 = *v2;
    *v2 = tmp_v1;
}*/

// https://e-maxx.ru/algo/segments_intersection_checking
/*static uint8_t intersect_1(double a, double b, double c, double d) {
    if (a > b) fswap_rust(&a, &b);
    if (c > d) fswap_rust(&c, &d);
    return fmax(a, c) <= fmin(b, d);
}*/

// check if two segments intersect
uint8_t geom_tools_is_intersect_line(const line_t *const l1, const line_t *const l2) {
    const point_t *p1 = l1->p1;
    const point_t *p2 = l1->p2;
    const point_t *p3 = l2->p1;
    const point_t *p4 = l2->p2;
    return intersect_1_rust(p1->x, p2->x, p3->x, p4->x)
           && intersect_1_rust(p1->y, p2->y, p3->y, p4->y)
           && area_rust(p1, p2, p3) * area_rust(p1, p2, p4) <= 0
           && area_rust(p3, p4, p1) * area_rust(p3, p4, p2) <= 0;
}

// Определение точки на линии, расстояние до которой от заданной точки является минимальным из существующих
point_t *geom_tools_nearest_point(const point_t *const point_start, const line_t *const line) {
    point_t a = {line->p1->x, line->p1->y};
    point_t b = {line->p2->x, line->p2->y};

    if (geom_tools_length_side_rust(&a, &b) < 1e-9) {
        return line->p1;
    }

    double A = point_start->x - a.x;
    double B = point_start->y - a.y;
    double C = b.x - a.x;
    double D = b.y - a.y;

    double dot = A * C + B * D;
    double len_sq = C * C + D * D;
    double param = -1;

    if (len_sq != 0) {
        param = dot / len_sq;
    }

    double xx, yy;

    if (param < 0) {
        xx = a.x;
        yy = a.y;
    } else if (param > 1) {
        xx = b.x;
        yy = b.y;
    } else {
        xx = a.x + param * C;
        yy = a.y + param * D;
    }

    point_t *point_end = NULL;
    point_end = (point_t *) malloc(sizeof(point_t));
    point_end->x = xx;
    point_end->y = yy;
    return point_end;
}

