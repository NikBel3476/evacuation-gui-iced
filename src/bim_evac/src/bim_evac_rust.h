#include <stdarg.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>


double evac_get_time_m_rust(void);

double evac_get_time_s_rust(void);

void evac_set_density_max_rust(double density);

void evac_set_density_min_rust(double density);

void evac_set_modeling_step_rust(double step);

void evac_set_speed_max_rust(double speed);

void evac_time_inc_rust(void);

void evac_time_reset_rust(void);

double speed_through_transit_rust(double transit_width, double density_in_zone, double v_max);
