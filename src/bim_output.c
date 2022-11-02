#include "bim_output.h"

void bim_output_head  (const bim_t *const bim, FILE *fp)
{
    fprintf(fp, "t,");
    for (size_t i = 0; i < bim->zones->length; i++)
    {
        bim_zone_t *zone = bim->zones->data[i];
        fprintf(fp, "%s,", zone->name);
    }
    for (size_t i = 0; i < bim->transits->length; i++)
    {
        bim_transit_t *transit = bim->transits->data[i];
        fprintf(fp, "%s,", transit->name);
    }
    fprintf(fp, "\n");
    fflush(fp);
}

void bim_output_body  (const bim_t *const bim, float time, FILE *fp)
{
    fprintf(fp, "%.2f,", time);
    for (size_t i = 0; i < bim->zones->length; i++)
    {
        bim_zone_t *zone = bim->zones->data[i];
        fprintf(fp, "%.2f,", zone->numofpeople);
    }

    for (size_t i = 0; i < bim->transits->length; i++)
    {
        bim_transit_t *transit = bim->transits->data[i];
        fprintf(fp, "%.2f,", transit->nop_proceeding);
    }
    fprintf(fp, "\n");
    fflush(fp);
}

char* bim_basename    (char *path_to_file)
{
    char *fn;
    char *suffix;
    char *out_file;

    (fn = strrchr(path_to_file, '/')) ? ++fn : (fn = path_to_file);
    (suffix = strrchr(fn, '.')) ? suffix : (suffix = fn);

    char *s = (char*)calloc(strlen(fn) - strlen(suffix) + 1, sizeof (char));
    if (!s)
    {
        return NULL;
    }
    strncpy(s, fn, strlen(fn) - strlen(suffix));

#if defined(_WIN32) || defined(_WIN64)
    out_file = (char *)calloc(strlen(OUTPUT_DIR) + strlen(s) + 7, sizeof(char));
    strcpy(out_file, "..\\\\");
    strcat(out_file, OUTPUT_DIR);
    strcat(out_file, "\\\\");
#else
    out_file = (char *)calloc(strlen(OUTPUT_DIR) + strlen(s) + 5, sizeof(char));
    strcpy(out_file, "../");
    strcat(out_file, OUTPUT_DIR);
    strcat(out_file, "/");
#endif
    strcat(out_file,  s);
    free(s);

    return out_file;
}

char *bim_create_file_name  (const char* bfn, const char* middle_name, const char* suffix)
{
    char *fn = (char*)calloc((strlen(bfn) + strlen(middle_name) + strlen(suffix) + 1), sizeof (char));
    if (!fn)
    {
        return NULL;
    }

    strcat(fn, bfn);
    strcat(fn, middle_name);
    strcat(fn, suffix);

    return fn;
}
