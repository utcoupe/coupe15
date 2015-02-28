#ifndef COMMUNICATION_H
#define COMMUNICATION_H

#include "fast_math.h"
#include "utils.h"
#include <unistd.h>
#include <sys/types.h>

void sayHello();
void pushResults(Cluster_t *coords, int nbr, long timestamp);
void pushError(char error);

/* ERROR CODES :
	1 : one Hokuyo missing
	2 : no Hokuyo connected
*/

#endif
