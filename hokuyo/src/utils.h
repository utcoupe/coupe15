#ifndef UTILS_H
#define UTILS_H

#include "fast_math.h"
#include "hokuyo_config.h"

typedef struct Cluster {
	Pt_t pts[MAX_DATA];
	int nb, size;
	Pt_t center;
} Cluster_t;

int getPoints(Hok_t hok, Pt_t* pt_list);
int getClustersFromPts(Pt_t *pt_list, int nb_pts, Cluster_t* clusters);
int sortAndSelectRobots(int n, Cluster_t *robots, int nb_robots_to_find);
int mergeRobots(Cluster_t *r1, int n1, Cluster_t *r2, int n2, Cluster_t *result, int nb_robots_to_find);
int isIn(int e, int *tab, int tab_size);

#endif
