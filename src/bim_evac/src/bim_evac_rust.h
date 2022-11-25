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

/**
 * Скорость потока на лестнице
 *
 * # Arguments
 * * `density_in_zone` - плотность в элементе, из которого выходит поток
 * * `direction` - направление движения (1 - вверх, -1 - вниз)
 *
 * # Returns
 * Скорость потока при движении по лестнице в зависимости от плотности, м/мин
 */
double evac_speed_on_stair_rust(double density_in_zone,
                                int direction);

void evac_time_inc_rust(void);

void evac_time_reset_rust(void);

/**
 * Скорость потока в комнате
 *
 * # Arguments
 * * `density_in_zone` - плотность в элементе, из которого выходит поток
 * * `v_max` - максимальная скорость потока
 *
 * # Returns
 * Скорость потока по горизонтальному пути, м/мин
 */
double speed_in_room_rust(double density_in_zone,
                          double v_max);

/**
 * Скорость потока в проёме
 *
 * # Arguments
 * * `transit_width` - ширина проема, м
 * * `density_in_zone` - плотность в элементе, чел/м2
 * * `v_max` - максимальная скорость потока
 *
 * # Returns
 * скорость потока в проеме в зависимости от плотности, м/мин
 */
double speed_through_transit_rust(double transit_width,
                                  double density_in_zone,
                                  double v_max);
