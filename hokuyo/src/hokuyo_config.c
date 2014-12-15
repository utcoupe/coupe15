#include "hokuyo_config.h"
#include "utils.h"
#include "fast_math.h"

#include <urg_ctrl.h>
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h> // pour sleep() uniquement


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

void initWizard (Hok_t *hok1, Hok_t *hok2, int symetry){
	Angles_t errors;

	printf("%sLaunching initWizard...\n", PREFIX);

	// Début de l'initialisation du premier Hokuyo
	printf("%sPut the 1st hokuyo on the platform which is in front of the public,\n", PREFIX);
	if (symetry == 0) // On est vert
		printf("%son the left-hand side.\n", PREFIX);
	else
		printf("%son the right-hand side.\n", PREFIX);
	printf("%sIt must look to the other side.\n", PREFIX);
	printf("%sOnce done, please plug it into the Rasp (press any key to continue)\n", PREFIX);
	getchar(); // en attendant un ENTER
	// boucle de vérification qu'il est branché
	while (!hok1->isWorking) {
		checkAndConnect(hok1);
		sleep(1);
	}
	printf("%sOk, first hokuyo detected !\n", PREFIX);

	printf("%sPut the mark on the nearest corner of the stairs. (press any key to continue)\n", PREFIX);
	getchar(); // en attendant un ENTER
	// boucle de vérification de l'assiette
	do{
		if (hok1->isWorking){
			errors = frameWizard (hok1, 4, symetry);

			if ((errors.pitch == -1) && (errors.heading == -1)){
				printf("%sHokuyo disconnected\n", PREFIX);
				continue;
			} else {
				if ((errors.pitch == -2) && (errors.heading == -2))
					printf("%sCan't see the cone\n", PREFIX);
				else
					printf("%sPitch error : %lf\n", PREFIX, errors.pitch);
			}
		} else {
			checkAndConnect(hok1);
		}
		sleep(1);
	} while (errors.pitch > 0.025); // trigo, en estimant que nos cylindres font 10cm de haut à max 2m de distance
	// une fois l'erreur suffisement petite
	printf("%sOk, let's say that's good\n", PREFIX);
	// prendre l'erreur ce cap
	hok1->error = errors.heading;
	printf("%sThis hokuyo has been correctly configured (press any key to continue)\n", PREFIX);
	getchar();


	// Début de l'initialisation du second Hokuyo
	printf("%sPut the 2nd hokuyo on the platform which on the side of the area,\n", PREFIX);
	if (symetry == 0) // On est vert
		printf("%son the right-hand side.\n", PREFIX);
	else
		printf("%son the left-hand side.\n", PREFIX);
	printf("%sIt must look to the other side.\n", PREFIX);
	printf("%sOnce done, please plug it into the Rasp (press any key to continue)\n", PREFIX);
	getchar(); // en attendant un ENTER
	// boucle de vérification qu'il est branché
	while (!hok2->isWorking) {
		checkAndConnect(hok2);
		sleep(1);
	}
	printf("%sOk, the second hokuyo has detected !\n", PREFIX);

	printf("%sPut the mark on the nearest corner of the stairs. (press any key to continue)\n", PREFIX);
	getchar(); // en attendant un ENTER
	// boucle de vérification de l'assiette
	do{
		if (hok2->isWorking){
			errors = frameWizard (hok2, 4, symetry);

			if ((errors.pitch == -1) && (errors.heading == -1)){
				printf("%sHokuyo disconnected\n", PREFIX);
				continue;
			} else {
				if ((errors.pitch == -2) && (errors.heading == -2))
					printf("%sCan't see the cone\n", PREFIX);
				else
					printf("%sPitch error : %lf\n", PREFIX, errors.pitch);
			}
		} else {
			checkAndConnect(hok2);
		}
		sleep(1);
	} while (errors.pitch > 0.025); // trigo, en estimant que nos cylindres font 10cm de haut à max 2m de distance
	// une fois l'erreur suffisement petite
	printf("%sOk, let's say that's good\n", PREFIX);
	// prendre l'erreur ce cap
	hok2->error = errors.heading;
	printf("%sThis hokuyo has been correctly configured (press any key to continue)\n", PREFIX);
	getchar();

	printf("%sWaiting for the match to start...\n", PREFIX);
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

Angles_t frameWizard (Hok_t *hok, int hok_pos, int symetry){
	Pt_t pts[MAX_DATA], coneCenter;
	Angles_t results;
	Cluster_t clusters[MAX_CLUSTERS];
	Cluster_simple_t cone;
	int nPts = 0, nClusters = 0, distToCone;

	if (hok->isWorking) {
		// Valeurs de coneCenter et de la zone de l'hokuyo
		coneCenter.y = CONE_Y;
		if (((hok_pos == 4) && !symetry) || ((hok_pos == 3) && symetry)){ // si on est sur la gauche de la table (vu du public)
			hok->zone = (ScanZone_t){ BORDER_MARGIN, TABLE_X/2, BORDER_MARGIN, TABLE_Y-BORDER_MARGIN };
			coneCenter.x = CONE_X_LEFT;
		} else { // si on est sur la droite
			hok->zone = (ScanZone_t){ TABLE_X/2, TABLE_X-BORDER_MARGIN, BORDER_MARGIN, TABLE_Y-BORDER_MARGIN };
			coneCenter.x = CONE_X_RIGHT;
		}

		// Valeur de la distance entre l'Hokuyo et le cône
		if (hok_pos == 3){ // si on est sur un côté
			distToCone = sqrt(dist_squared((Pt_t) {HOK2_X, HOK2_Y}, (Pt_t) {CONE_X_RIGHT, CONE_Y}));
		} else { // si on est dans un coin
			distToCone = sqrt(dist_squared((Pt_t) {HOK1_X, HOK1_Y}, (Pt_t) {CONE_X_LEFT, CONE_Y}));
		}

		if (hok->isWorking) {
			nPts = getPoints(*hok, pts);
			if (nPts == -1) {
				hok->isWorking = 0;
				results.pitch = -1;
				results.heading = -1;
				return results;
			}
		} else {
			results.pitch = -1;
			results.heading = -1;
			return results; // Hokuyo  disconnected
		}

		nClusters = getClustersFromPts(pts, nPts, clusters);

		cone = findCone(nClusters, clusters, coneCenter);

		if ((cone.center.x ==-1) && (cone.center.y ==-1))
		{
			results.pitch = -2;
			results.heading = -2;
			return results; // cone lost
		}

		// Calcul des erreurs (normalement ce sont des tan-1 mais on les néglige vu l'angle)
		// --- pitch
		results.pitch = ((CONE_CALIB * CONE_HEIGHT/2)/((float)cone.size) - CONE_HEIGHT/2)/(distToCone);
		// --- heading
		results.heading = (sqrt(dist_squared(cone.center, coneCenter)))/(distToCone);

		return results;
	} else {
		results.pitch = -1;
		results.heading = -1;
		return results; // Hokuyo  disconnected
	}
}