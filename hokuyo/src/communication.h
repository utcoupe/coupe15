#ifndef COMMUNICATION_H
#define COMMUNICATION_H

#include "fast_math.h"
#include "utils.h"
#include <unistd.h>
#include <sys/types.h>

void sayHello();
void pushResults(Cluster_t *coords, int nbr, long timestamp);

#endif
