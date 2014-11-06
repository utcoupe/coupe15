#ifndef UTILS_H
#define UTILS_H

#include "fast_math.h"
#include "hokuyo_config.h"

typedef struct Cluster {
	Pt_t pts[MAX_DATA];
	int nb, size;
	Pt_t center;
} Cluster_t;

/* Demande les points à l'Hokuyo
	IN: structure de l'Hokuyo à appeler
	OUT: liste de points (simple tableau de distances),
		nb de points retournés, -1 en cas d'échec
*/
int getPoints(Hok_t hok, Pt_t* pt_list);

/* 
	IN: liste de points, nb de points
	OUT: clusters, nb de robots (= de clusters)
*/
int getClustersFromPts(Pt_t *pt_list, int nb_pts, Cluster_t* clusters);

/* 
	IN: 
	OUT: 
*/
int sortAndSelectRobots(int n, Cluster_t *robots, int nb_robots_to_find);

/* 
	IN: 
	OUT: 
*/
int mergeRobots(Cluster_t *r1, int n1, Cluster_t *r2, int n2, Cluster_t *result, int nb_robots_to_find);

/* 
	IN: 
	OUT: 
*/
int isIn(int e, int *tab, int tab_size);

#endif
