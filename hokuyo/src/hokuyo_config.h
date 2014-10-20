#ifndef HOKUYO_CONFIG_H
#define HOKUYO_CONFIG_H

#include "fast_math.h"
#include <urg_ctrl.h>

typedef struct ScanZone {
	int xmin, xmax, ymin, ymax;
} ScanZone_t;

typedef struct Hokuyo {
	urg_t* urg;
	Pt_t pt;
	ScanZone_t zone;
	double orientation, cone_min, cone_max; //Scanne dans ori-cone;ori+cone
	int imin, imax, nb_data, isWorking;
	const char *path;
	double error;
	struct fastmathTrigo fm;
} Hok_t;

Hok_t initHokuyo(const char *path, double ori, double cone_min, double cone_max, Pt_t pt);
void checkAndConnect(Hok_t *hok);
Hok_t applySymetry(Hok_t hok);

#endif
