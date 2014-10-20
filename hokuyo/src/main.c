#include <urg_ctrl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <unistd.h>

#include "hokuyo_config.h"
#include "utils.h"
#include "compat.h"
#include "communication.h"

#ifdef SDL
#include "gui.h"
#endif

void frame(int nb_robots_to_find);

static int use_protocol = 0, symetry = 0;
static long timeStart = 0;
static Hok_t hok1, hok2;

void exit_handler() {
	printf("\n%sClosing lidar(s), please wait...\n", PREFIX);
	if (hok1.urg != 0)
		urg_disconnect(hok1.urg);
	if (hok2.urg != 0)
		urg_disconnect(hok2.urg);
	printf("%sExitting\n", PREFIX);
	kill(getppid(), SIGUSR1); //Erreur envoyee au pere
}

static void catch_SIGINT(int signal){
	exit(EXIT_FAILURE);
}

int main(int argc, char **argv){
	int calib = 1, nb_robots_to_find = 4;
	char *path = 0;
	hok1.urg = 0;
	hok2.urg = 0;

	atexit(exit_handler);
	
	if(argc <= 1 || ( strcmp(argv[1], "red") != 0 && strcmp(argv[1], "yellow") ) ){
		fprintf(stderr, "usage: hokuyo {red|yellow} [path_pipe] [nbr_hok]\n");
		exit(EXIT_FAILURE);
	}

	if (signal(SIGINT, catch_SIGINT) == SIG_ERR) {
        fprintf(stderr, "An error occurred while setting a signal handler for SIGINT.\n");
		exit(EXIT_FAILURE);
    }
	
	if (strcmp(argv[1], "yellow") == 0) {
		symetry = 1;
	}

	if (argc >= 3) {
		path = argv[2];
		if (strcmp(path, "nocalib") == 0) {
			calib = 0;
		} else {
			use_protocol = 1;
		}
	}
	
	if (argc >= 4) {
		nb_robots_to_find = atoi(argv[3]);
	} else {
		nb_robots_to_find = MAX_ROBOTS;
	}

	hok1 = initHokuyo("/dev/ttyACM0", HOK1_A, HOK1_CONE_MIN, HOK1_CONE_MAX, (Pt_t){HOK1_X, HOK1_Y} );
	hok2 = initHokuyo("/dev/ttyACM1", HOK2_A, HOK2_CONE_MIN, HOK2_CONE_MAX, (Pt_t){HOK2_X, HOK2_Y} );

	if (symetry) {
		hok1 = applySymetry(hok1);
		hok2 = applySymetry(hok2);
	}

	checkAndConnect(&hok1);
	checkAndConnect(&hok2);
	
	#ifdef SDL
	initSDL();
	#endif

	if (use_protocol) {
		init_protocol(path);
	}

	printf("%sStarting hokuyo :\n%sLooking for %d robots\n%s%s color\n", PREFIX, PREFIX, nb_robots_to_find, PREFIX, argv[1]);
	timeStart = timeMillis();
	long time_last_try = 0;
	while(1){
		long now = timeMillis();
		if (now - time_last_try > TIMEOUT) {
			printf("%sChecking hokuyos\n", PREFIX);
			checkAndConnect(&hok1);
			checkAndConnect(&hok2);
			time_last_try = now;
		}
		frame(nb_robots_to_find);
	}
	exit(EXIT_SUCCESS);
}

void frame(int nb_robots_to_find){
	long timestamp;
	static long lastTime = 0;
	Pt_t pts1[MAX_DATA], pts2[MAX_DATA];
	Cluster_t robots1[MAX_CLUSTERS], robots2[MAX_CLUSTERS], robots[MAX_ROBOTS];
	int nPts1 = 0, nPts2 = 0, nRobots1 = 0, nRobots2 = 0, nRobots;

	if (hok1.isWorking && hok2.isWorking) {
		printf("Both hokuyos working\n");
		hok1.zone = (ScanZone_t){ BORDER_MARGIN, TABLE_X/2, BORDER_MARGIN, TABLE_Y-BORDER_MARGIN };
		hok2.zone = (ScanZone_t){ TABLE_X/2, TABLE_X-BORDER_MARGIN, BORDER_MARGIN, TABLE_Y-BORDER_MARGIN };
		if (symetry) {
			ScanZone_t temp = hok1.zone;
			hok1.zone = hok2.zone;
			hok2.zone = temp;
		}
	} else {
		hok1.zone = hok2.zone = (ScanZone_t){ BORDER_MARGIN, TABLE_X - BORDER_MARGIN, BORDER_MARGIN, TABLE_Y-BORDER_MARGIN };
	}

	if (hok1.isWorking || hok2.isWorking) {
		long start_t = timeMillis();

		if (hok1.isWorking) {
			nPts1 = getPoints(hok1, pts1);
			if (nPts1 == -1) {
				hok1.isWorking = 0;
			}
		}
		if (hok2.isWorking) {
			nPts2 = getPoints(hok2, pts2);
			if (nPts2 == -1) {
				hok2.isWorking = 0;
			}
		}


		timestamp = timeMillis() - timeStart;
		//printf("%sDuration : %ld\n", PREFIX,timeMillis() - start_t);
		//printf("%sGot %d ans %d points\n", PREFIX, nPts1, nPts2);

		nRobots1 = getClustersFromPts(pts1, nPts1, robots1);
		nRobots2 = getClustersFromPts(pts2, nPts2, robots2);

		//printf("%sCalculated %d and %d clusters\n", PREFIX, nRobots1, nRobots2);

		nRobots1 = sortAndSelectRobots(nRobots1, robots1, nb_robots_to_find);
		nRobots2 = sortAndSelectRobots(nRobots2, robots2, nb_robots_to_find);

		nRobots = mergeRobots(robots1, nRobots1, robots2, nRobots2, robots, nb_robots_to_find);
		//printf("%sGot %d robots\n", PREFIX, nRobots);
		
		#ifdef SDL
		struct color l1Color = {255, 0, 0}, l2Color = {0, 0, 255}, lColor = {255, 0, 255};
		blitMap();
		blitLidar(hok1.pt, l1Color);
		blitLidar(hok2.pt, l2Color);
		blitRobots(robots1, nRobots1, l1Color);
		blitRobots(robots2, nRobots2, l2Color);
		blitRobots(robots, nRobots, lColor);
		blitPoints(pts1, nPts1, l1Color);
		blitPoints(pts2, nPts2, l2Color);
		waitScreen();
		#endif

		if (use_protocol){
			pushResults(robots, nRobots, timestamp);
		}
		else{
			printf("%sHOK2 - %li;%i\n", PREFIX, timestamp, nRobots2);
			for(int i=0; i<nRobots2; i++){
				printf(";;%i:%i", robots2[i].center.x, robots2[i].center.y);
			}
			printf("\n");
			printf("%sHOK1 - %li;%i\n", PREFIX, timestamp, nRobots1);
			for(int i=0; i<nRobots1; i++){
				printf(";;%i:%i", robots1[i].center.x, robots1[i].center.y);
			}
			printf("\n");
			printf("%sALL  - %li;%i\n", PREFIX, timestamp, nRobots);
			for(int i=0; i<nRobots; i++){
				printf(";;%i:%i", robots[i].center.x, robots[i].center.y);
			}
			printf("\n");
		}
	} else {
		sleep(1);
	}
	lastTime = timestamp;
}

