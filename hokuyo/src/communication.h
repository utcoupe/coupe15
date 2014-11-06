#ifndef COMMUNICATION_H
#define COMMUNICATION_H

#include "fast_math.h"
#include "utils.h"

void init_protocol();
void pushResults(Cluster_t *coords, int nbr, long timestamp);

#endif
