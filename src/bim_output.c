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
