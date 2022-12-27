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

#ifndef BIM_POLYGON_TOOLS_H
#define BIM_POLYGON_TOOLS_H

#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>
#include <math.h>
#include "../thirdparty/triangle/triangle.h"

typedef struct {
    double x;
    double y;
} point_t;

typedef struct {
    point_t *p1;
    point_t *p2;
} line_t;

typedef struct {
    size_t numofpoints;
    point_t *points;
} polygon_t;

typedef polygon_t multiline_t;

size_t triangle_polygon_rust(const polygon_t *polygon, int *triangle_list);

double geom_tools_area_polygon(const polygon_t *polygon);

double geom_tools_area_polygon_rust(const polygon_t *polygon);

int where_point_rust(double aAx, double aAy, double aBx, double aBy, double aPx, double aPy);

uint8_t is_point_in_triangle_rust(double aAx, double aAy, double aBx, double aBy, double aCx, double aCy,
                                  double aPx, double aPy);

uint8_t geom_tools_is_point_in_polygon(const point_t *point, const polygon_t *polygon);

uint8_t geom_tools_is_point_in_polygon_rust(const point_t *point, const polygon_t *polygon);

double area_rust(const point_t *p1, const point_t *p2, const point_t *p3);

void fswap_rust(double *v1, double *v2);

uint8_t geom_tools_is_intersect_line(const line_t *l1, const line_t *l2);

double geom_tools_length_side(const point_t *p1, const point_t *p2);

double geom_tools_length_side_rust(const point_t *p1, const point_t *p2);

point_t *geom_tools_nearest_point(const point_t *point_start, const line_t *line);

#endif //BIM_POLYGON_TOOLS_H
