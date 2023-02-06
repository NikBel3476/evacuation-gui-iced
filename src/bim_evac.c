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

#include "bim_evac.h"

static double evac_speed_max;//= 100;  // м/мин
static double evac_density_min;//= 0.1;  // чел/м^2
static double evac_density_max;//= 5;    // чел/м^2
static double evac_modeling_step;//= 0.01; // мин

static double evac_time = 0;

void evac_def_modeling_step(const bim_t *bim) {
    double area = bim_tools_get_area_bim(bim);

    double averageSize = area / bim->zones->length;
    double hxy = sqrt(averageSize);             // характерный размер области, м
    evac_modeling_step = (evac_modeling_step == 0) ? hxy / evac_speed_max * 0.1
                                                   : evac_modeling_step;      // Шаг моделирования, мин
}

static void reset_zones(const ArrayList *zones) {
    for (size_t i = 0; i < zones->length; i++) {
        bim_zone_t *zone = zones->data[i];
        zone->is_visited = false;
        zone->potential = (zone->sign == OUTSIDE) ? 0 : FLT_MAX;
    }
}

static void reset_transits(const ArrayList *transits) {
    for (size_t i = 0; i < transits->length; i++) {
        bim_transit_t *transit = transits->data[i];
        transit->is_visited = false;
        transit->nop_proceeding = 0;
    }
}

void print_transit_evac(bim_transit_t* transit) {
    printf("Transit: %s width: %.20f np: %.20f\n", transit->name, transit->width, transit->nop_proceeding);
}

void print_zone_evac(bim_zone_t* zone) {
    printf("Zone: %s numofpeople: %.20f potential: %.20f\n", zone->name, zone->numofpeople, zone->potential);
}

static int potentialcmp_callback (const ArrayListValue value1, const ArrayListValue value2)
{
    bim_zone_t *zone1 = (bim_zone_t *) value1;
    bim_zone_t *zone2 = (bim_zone_t *) value2;

    if (zone1->potential > zone2->potential) {
        return 1;
    } else if (zone1->potential < (zone2->potential)) {
        return -1;
    }
    return 0;
}

void evac_moving_step(const bim_graph_t *graph, const ArrayList *zones, const ArrayList *transits) {
    reset_zones(zones);
    reset_transits(transits);

    size_t unprocessed_zones_count = zones->length;
    ArrayList *zones_to_process = arraylist_new(unprocessed_zones_count);

    uint64_t outside_id = graph->node_count - 1;
    bim_node_t *ptr = graph->head[outside_id];
    bim_zone_t *outside = zones->data[outside_id];
    bim_zone_t *receiving_zone = outside;

    double potential_sum = 0.0;
    while (1) {
        for (size_t i = 0; i < receiving_zone->numofoutputs && ptr != NULL; i++, ptr = ptr->next) {
            bim_transit_t *transit = transits->data[ptr->eid];
            if (transit->is_visited || transit->is_blocked) continue;

            bim_zone_t *giver_zone = zones->data[ptr->dest];

            receiving_zone->potential = potential_element_rust(receiving_zone, giver_zone, transit);
            potential_sum += receiving_zone->potential;


            double moved_people = part_people_flow_rust(receiving_zone, giver_zone, transit);
            receiving_zone->numofpeople += moved_people;
            giver_zone->numofpeople -= moved_people;
            transit->nop_proceeding = moved_people;

            giver_zone->is_visited = true;
            transit->is_visited = true;

            if (giver_zone->numofoutputs > 1 && !giver_zone->is_blocked
                && arraylist_index_of(zones_to_process, element_id_eq_callback_rust, giver_zone) < 0) {
                arraylist_append(zones_to_process, giver_zone);
            }
        }

        arraylist_sort(zones_to_process, potential_cmp_callback_rust);

        if (zones_to_process->length > 0) {
            receiving_zone = zones_to_process->data[0];
            ptr = graph->head[receiving_zone->id];
            arraylist_remove(zones_to_process, 0);
        }

        if (unprocessed_zones_count == 0) break;
        --unprocessed_zones_count;
    }

    arraylist_free(zones_to_process);
}

void evac_moving_step_with_log(const bim_graph_t *graph, const ArrayList *zones, const ArrayList *transits) {
    reset_zones(zones);
    reset_transits(transits);
//    for (size_t i = 0; i < zones->length; i++) {
//        print_zone_evac(zones->data[i]);
//    }
//    for (size_t i = 0; i < transits->length; i++) {
//        print_transit_evac(transits->data[i]);
//    }

    size_t unprocessed_zones_count = zones->length;
//    ArrayList *zones_to_process = arraylist_new(unprocessed_zones_count);
    ArrayList *zones_to_process = arraylist_new(0);

    uint64_t outside_id = graph->node_count - 1;
    bim_node_t *ptr = graph->head[outside_id];
    bim_zone_t *outside = zones->data[outside_id];
    bim_zone_t *receiving_zone = outside;

    double potential_sum = 0.0;
    while (1) {
        for (size_t i = 0; i < receiving_zone->numofoutputs && ptr != NULL; i++, ptr = ptr->next) {
            bim_transit_t *transit = transits->data[ptr->eid];
            if (transit->is_visited || transit->is_blocked) continue;

            bim_zone_t *giver_zone = zones->data[ptr->dest];

//            printf(
//                "a: %.20f p: %.20f r: %.20f\n",
//                giver_zone->area,
//                receiving_zone->potential,
//                potential_element_rust(receiving_zone, giver_zone, transit)
//            );
            receiving_zone->potential = potential_element_rust(receiving_zone, giver_zone, transit);
            potential_sum += receiving_zone->potential;
//            printf(
//                "rz: %s numofpeople: %.20f potential: %.20f\n",
//                receiving_zone->name,
//                receiving_zone->numofpeople,
//                receiving_zone->potential
//            );
//            printf("rz: %s p: %.15f\n", receiving_zone->name, receiving_zone->numofpeople);

//            printf("rz: %s tz: %s t: %s\n", receiving_zone->name, giver_zone->name, transit->name);
            double moved_people = part_people_flow_rust(receiving_zone, giver_zone, transit);
            receiving_zone->numofpeople += moved_people;
            giver_zone->numofpeople -= moved_people;
            transit->nop_proceeding = moved_people;
//            printf("rz: %s mp: %.20f\n", receiving_zone->name, moved_people);

            giver_zone->is_visited = true;
            transit->is_visited = true;

            if (giver_zone->numofoutputs > 1 && !giver_zone->is_blocked
                && arraylist_index_of(zones_to_process, element_id_eq_callback_rust, giver_zone) < 0) {
                arraylist_append(zones_to_process, giver_zone);
            }

//            printf("UNPROCESSED ZONES: %zu zones_to_process: %u\n", unprocessed_zones_count, zones_to_process->length);
//            printf("STEP: %zu\n", i);
//            printf("PTR dest: %zu eid: %zu moved_people: %.20f\n", ptr->dest, ptr->eid, moved_people);
//            if (ptr->next != NULL) {
//                printf("NEXT dest: %zu eid: %zu\n", ptr->next->dest, ptr->next->eid);
//            }
//            print_transit_evac(transit);
//            print_zone_evac(receiving_zone);
//            print_zone_evac(giver_zone);
        }

//        for (size_t i = 0; i < zones_to_process->length; i++) {
//            print_zone_evac(zones_to_process->data[i]);
//        }

//        if (unprocessed_zones_count == zones->length - 0) {
//            printf("before sort\n");
//            for (size_t i = 0; i < zones_to_process->length; i++) {
//                print_zone_evac(zones_to_process->data[i]);
//            }
//        }

        arraylist_sort(zones_to_process, potential_cmp_callback_rust);

//        if (unprocessed_zones_count == zones->length - 0) {
//            printf("after sort\n");
//            for (size_t i = 0; i < zones_to_process->length; i++) {
//                print_zone_evac(zones_to_process->data[i]);
//            }
//        }
//        break;

//        for (size_t i = 0; i < zones->length; i++) {
//            print_zone_evac(zones->data[i]);
//        }
//        break;

//        if (unprocessed_zones_count == graph->node_count - 100) {
//            for (size_t i = 0; i < zones->length; i++) {
//                print_zone_evac(zones->data[i]);
//            }
//            break;
//        }

//        for (size_t i = 0; i < zones->length; i++) {
//            print_zone_evac(zones->data[i]);
//        }

        if (zones_to_process->length > 0) {
            receiving_zone = zones_to_process->data[0];
//            print_zone_evac(receiving_zone);
            ptr = graph->head[receiving_zone->id];
            arraylist_remove(zones_to_process, 0);
        }

        if (unprocessed_zones_count == 0) break;
        --unprocessed_zones_count;
    }

//    for (size_t i = 0; i < zones->length; i++) {
//        printf(
//            "Zone: %s numofpeople: %.20f potential: %.20f\n",
//            ((bim_zone_t*)zones->data[i])->name,
//            ((bim_zone_t*)zones->data[i])->numofpeople,
//            ((bim_zone_t*)zones->data[i])->potential
//        );
//    }

//    printf("potential_sum = %.5f\n", potential_sum);
    arraylist_free(zones_to_process);
}

void evac_set_speed_max(double val) {
    evac_speed_max = val;
}

void evac_set_density_min(double val) {
    evac_density_min = val;
}

void evac_set_density_max(double val) {
    evac_density_max = val;
}

void evac_set_modeling_step(double val) {
    evac_modeling_step = val;
}

double evac_get_time_s() {
    return evac_time * 60;
}

double evac_get_time_m() {
    return evac_time;
}

void evac_time_inc() {
    evac_time += evac_modeling_step;
}

void evac_time_reset() {
    evac_time = 0;
}
