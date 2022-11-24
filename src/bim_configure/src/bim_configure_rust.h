#include <stdarg.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
#include "../../bim_configure.h"


typedef enum distribution_type_rust {
  distribution_from_bim,
  distribution_uniform,
} distribution_type_rust;

typedef enum transits_width_type_rust {
  transits_width_from_bim,
  transits_width_users,
} transits_width_type_rust;

typedef struct uuid_t_rust uuid_t_rust;

typedef struct bim_cfg_file_name_t_rust {
  char x[256];
} bim_cfg_file_name_t_rust;

typedef struct special_t_rust {
  struct uuid_t_rust *uuid;
  unsigned char num_of_uuids;
  float value;
} special_t_rust;

typedef struct bim_cfg_distribution_t_rust {
  enum distribution_type_rust type;
  float density;
  struct special_t_rust *special;
  unsigned char num_of_special_blocks;
} bim_cfg_distribution_t_rust;

typedef struct bim_cfg_transitions_width_t_rust {
  enum transits_width_type_rust type;
  float doorwayin;
  float doorwayout;
  struct special_t_rust *special;
  unsigned char num_of_special_blocks;
} bim_cfg_transitions_width_t_rust;

typedef struct bim_cfg_modeling_t_rust {
  float step;
  float speed_max;
  float density_min;
  float density_max;
} bim_cfg_modeling_t_rust;

typedef struct bim_cfg_scenario_t_rust {
  struct bim_cfg_file_name_t_rust *bim_jsons;
  struct bim_cfg_file_name_t_rust logger_configure;
  unsigned char num_of_bim_jsons;
  struct bim_cfg_distribution_t_rust distribution;
  struct bim_cfg_transitions_width_t_rust transits;
  struct bim_cfg_modeling_t_rust modeling;
} bim_cfg_scenario_t_rust;

//const struct bim_cfg_scenario_t_rust *bim_cfg_load(const char *path_to_file);

const bim_cfg_scenario_t* bim_cfg_load (const char *filename);
