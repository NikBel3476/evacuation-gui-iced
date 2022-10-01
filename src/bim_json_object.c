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

#include "bim_json_object.h"

const bim_json_object_t* bim_json_copy(const bim_json_object_t *bim_object)
{
    bim_json_object_t *bim;

    uint8_t            levels_count;
    bim_json_level_t   *levels = (bim_json_level_t *) NULL;
    bim_json_address_t *address = (bim_json_address_t *) NULL;

    bim = (bim_json_object_t*)malloc(sizeof(bim_json_object_t));
    if (!bim) {
        LOG_ERROR("Не удалось выделить память для структуры `bim_json_object_t` при копировании");
        return NULL;
    }
    levels = (bim_json_level_t*)malloc(sizeof(bim_json_level_t));
    if (!levels) {
        LOG_ERROR("Не удалось выделить память для структуры `bim_json_level_t` при копировании");
        free(bim);
        return NULL;
    }
    levels_count = bim_object->numoflevels;

    address = (bim_json_address_t*)malloc(sizeof(bim_json_address_t));
    if (!address) {
        free(levels);
        free(bim);
        return NULL;
    }

    address->city            = strdup(bim_object->address->city);
    address->add_info        = strdup(bim_object->address->add_info);
    address->street_address  = strdup(bim_object->address->street_address);

    bim->name        = strdup(bim_object->name);
    bim->address     = address;
    bim->levels      = levels;
    bim->numoflevels = levels_count;

    for (size_t i = 0; i < levels_count; ++i)
    {
        bim_json_level_t *level = &levels[i];
        bim_json_level_t level_original = bim_object->levels[i];
        level->name          = strdup(level_original.name);
        level->z_level       = level_original.z_level;
        level->numofelements = level_original.numofelements;

        bim_json_element_t *elements = (bim_json_element_t*)malloc(sizeof(bim_json_element_t) * level->numofelements);
        if (!elements) {
            LOG_ERROR("Не удалось выделить память для структуры `bim_json_element_t` при копировании");
            free(bim);
            free(levels);
            return NULL;
        }

        level->elements = elements;
        for (size_t j = 0; j < level->numofelements; ++j)
        {
            bim_json_element_t *element = &elements[j];
            bim_json_element_t element_original = level_original.elements[j];

            element->id           = element_original.id;
            element->name         = strdup(element_original.name);
            element->numofpeople  = element_original.numofpeople;
            element->size_z       = element_original.size_z;
            element->z_level      = element_original.z_level;
            element->numofoutputs = element_original.numofoutputs;
            element->sign         = element_original.sign;
            strcpy((void *)element->uuid.x, element_original.uuid.x);

            polygon_t *polygon = (polygon_t*)malloc(sizeof(polygon_t));
            if (!polygon) {
                LOG_ERROR("Не удалось выделить память для структуры `polygon_t` при копировании");
                free(bim);
                free(levels);
                free(elements);
                return NULL;
            }

            {
                polygon->numofpoints = element_original.polygon->numofpoints;
                point_t *points = (point_t*)malloc(sizeof (point_t) * polygon->numofpoints);
                if (!points) {
                    LOG_ERROR("Не удалось выделить память для структуры `bim_json_element_t` при копировании");
                    free(bim);
                    free(levels);
                    free(elements);
                    free(polygon);
                    return NULL;
                }

                for (size_t k = 0; k < polygon->numofpoints; ++k)
                {
                    point_t *point = &points[k];
                    point_t point_original = element_original.polygon->points[k];
                    point->x = point_original.x;
                    point->y = point_original.y;
                }
                polygon->points = points;
            }
            element->polygon = polygon;

            uuid_t* outputs = (uuid_t *)malloc(sizeof(uuid_t) * element->numofoutputs);
            {
                for (size_t k = 0; k < element->numofoutputs; ++k)
                {
                    strcpy((void *)outputs[k].x, element_original.outputs[k].x);
                }
            }
            element->outputs = outputs;
        }
    }

    return bim;
}

static void element_free(bim_json_element_t *element);
static void level_free(bim_json_level_t *level);

void bim_json_free(bim_json_object_t* bim)
{
    bim_json_level_t *levels_ptr = bim->levels;
    for (uint8_t i = 0; i < bim->numoflevels; i++, levels_ptr++)
    {
        level_free(levels_ptr);
    }
    free(bim->levels);
    free((void*)bim->address->add_info);
    free((void*)bim->address->city);
    free((void*)bim->address->street_address);
    free((void*)bim->name);
    free(bim);
}

static void level_free(bim_json_level_t *level)
{
    bim_json_element_t *elements_ptr = level->elements;
    for (uint8_t j = 0; j < level->numofelements; j++, elements_ptr++)
    {
        element_free(elements_ptr);
    }
    free((void*)level->name);
    free(level->elements);
}

static void element_free(bim_json_element_t *element)
{
    free((void*)element->name);
    free(element->outputs);

    if (element->polygon)
    {
        free(element->polygon->points);
        free(element->polygon);
    }
}
