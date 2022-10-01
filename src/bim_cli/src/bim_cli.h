#include <stdarg.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>


typedef struct cli_params_t {
  const char *scenario_file;
} cli_params_t;

struct cli_params_t *read_cl_args(void);
