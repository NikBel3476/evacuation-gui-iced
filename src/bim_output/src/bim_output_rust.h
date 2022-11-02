#include <stdarg.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>


char *bim_basename(char *path_to_file);

char *bim_create_file_name(const char *base_file_name, const char *middle_name, const char *suffix);
