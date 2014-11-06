#include "hokuyo_config.h"
#include "utils.h"
#include "fast_math.h"

#include <urg_ctrl.h>
#include <stdlib.h>
#include <stdio.h>


Hok_t initHokuyo(const char *path, double ori, double cone_min, double cone_max, Pt_t pt) {
	int error, i;
	Hok_t hok;
	hok.urg = malloc(sizeof(urg_t));
	hok.path = path;
	hok.orientation = ori;
	hok.pt = pt;
	hok.cone_min = cone_min;
	hok.cone_max = cone_max;
	hok.error = 0;
	hok.fm.n = 0;
	hok.fm.cos = 0;
	hok.fm.sin = 0;
	hok.isWorking = 0;

	return hok;	
}

void checkAndConnect(Hok_t *hok) {
	if (!hok->isWorking) {
		printf("%sHokuyo not connected, trying to connect to %s\n", PREFIX, hok->path);
		int error = urg_connect(hok->urg, hok->path, 115200);
		if (error < 0) {
			printf("%sCan't connect to hokuyo : %s\n", PREFIX, urg_error(hok->urg));
			hok->isWorking = 0;
		} else {
			hok->imin = urg_rad2index(hok->urg, hok->cone_min);
			hok->imax = urg_rad2index(hok->urg, hok->cone_max);

			urg_setCaptureTimes(hok->urg, UrgInfinityTimes);
			error = urg_requestData(hok->urg, URG_MD, hok->imin, hok->imax);
			if (error < 0) {
				printf("%sCan't connect to hokuyo\n", PREFIX);
				hok->isWorking = 0;
			} else {
				printf("%sHokuyo connected\n", PREFIX);
				hok->isWorking = 1;
				printf("%sRequesting data on indexes %d to %d from %s OK\n", PREFIX, hok->imin, hok->imax, hok->path);

				hok->nb_data = urg_dataMax(hok->urg);
				double *angles = malloc(hok->nb_data * sizeof(double));
				int i;
				for (i=0; i<hok->nb_data; i++) {
					angles[i] = modTwoPi(urg_index2rad(hok->urg, i) + hok->orientation);
				}
				hok->fm = initFastmath(hok->nb_data, angles);
				free(angles);
				
				printf("%sCalculted sin/cos data for %s\n", PREFIX, hok->path);
			}
		}
	}
}

Hok_t applySymetry(Hok_t hok) {
	hok.pt = (Pt_t) {TABLE_X - hok.pt.x, hok.pt.y};
	hok.orientation = M_PI - hok.orientation;
	double temp = hok.cone_min;
	hok.cone_min = -hok.cone_max;
	hok.cone_max = -temp;
	return hok;
}
