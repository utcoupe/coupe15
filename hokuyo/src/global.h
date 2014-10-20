#ifndef GLOBAL_H
#define GLOBAL_H

#include "fast_math.h"
#include <math.h>

#define PREFIX "[C-HK]  "
//#define SDL

#define TABLE_X 3000
#define TABLE_Y 2000
#define MAX_DATA 1024
#define MAX_CLUSTERS 50
#define MAX_ROBOTS 4
#define BORDER_MARGIN 50
#define TIMEOUT 1000


#define CONE_CALIB  (10.0/180)*M_PI
#define DIST_CALIB 100
#define CALIB_MEASURES 10
#define CALIB_X (TABLE_X/2)
#define CALIB_Y (TABLE_Y/2)
#define CALIB_PT (Pt_t) { CALIB_X, CALIB_Y }

#define HOK1_X -25
#define HOK1_Y -25 
#define HOK1_A 0
#define HOK1_CONE_MIN 0
#define HOK1_CONE_MAX (M_PI/2)

#define HOK2_X 3025 
#define HOK2_Y 1000 
#define HOK2_A M_PI
#define HOK2_CONE_MIN (-M_PI/2)
#define HOK2_CONE_MAX (M_PI/2)


#define CLUSTER_POINTS_BACKWARDS 15
#define MAX_DIST 200
#define MAX_SIZE_TO_MERGE 200
#define NB_PTS_MIN 3


#endif
