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
FILE* logfile;

void exit_handler() {
	int status;
	fprintf(logfile, "\n%sClosing lidar(s), please wait...\n", PREFIX);
	if (hok1.urg != 0)
		urg_disconnect(hok1.urg);
	if (hok2.urg != 0)
		urg_disconnect(hok2.urg);

	// XXX on ne free rien ? genre nos hok et tout ?

	fflush(logfile);
	if (logfile != NULL){
		fprintf(logfile, "\n%sClosing log file and exiting, please wait...\n", PREFIX);
		fclose(logfile);
	}
	// kill(getppid(), SIGUSR1); //Erreur envoyee au pere
}

static void catch_SIGINT(int signal){
	exit(EXIT_FAILURE);
}

int main(int argc, char **argv){
	// Disable buffering on stdout
	setvbuf(stdout, NULL, _IOLBF, 0);

	int calib = 1, nb_robots_to_find = 4;
	hok1.urg = 0;
	hok2.urg = 0;

	// Open log file
	logfile = fopen("/home/mewen/hokuyo.log", "a+");
	if (logfile == NULL) {
		fprintf(stderr, "Can't open log file\n");
		exit(EXIT_FAILURE);
	}
	fprintf(logfile, "\n\n===== Starting Hokuyo =====\n");
	sayHello();

	atexit(exit_handler); // en cas de signal de fermeture, on déconnecte proprement
	
	if(argc <= 1 || ( strcmp(argv[1], "green") != 0 && strcmp(argv[1], "yellow") ) ){
		fprintf(stderr, "usage: hokuyo {green|yellow} {use|no}_init_wizard [nbr_robots]\n");
		exit(EXIT_FAILURE);
	}

	if (signal(SIGINT, catch_SIGINT) == SIG_ERR) {
		fprintf(stderr, "An error occurred while setting a signal handler for SIGINT.\n");
		exit(EXIT_FAILURE);
	 }

	if (argc >= 4) {
		nb_robots_to_find = atoi(argv[3]);
	} else {
		nb_robots_to_find = MAX_ROBOTS;
	}


	hok1 = initHokuyo("/dev/ttyACM0", HOK1_A, HOK1_CONE_MIN, HOK1_CONE_MAX, (Pt_t){HOK1_X, HOK1_Y} );
	hok2 = initHokuyo("/dev/ttyACM1", HOK2_A, HOK2_CONE_MIN, HOK2_CONE_MAX, (Pt_t){HOK2_X, HOK2_Y} );

	if (strcmp(argv[1], "yellow") == 0) {
		// si on est jaune, on inverse les positions ! (au lieu de changer les cst)
		symetry = 1;
		hok1 = applySymetry(hok1);
		hok2 = applySymetry(hok2);
	}

	if (strcmp(argv[2], "use_init_wizard") == 0){
		initWizard(&hok1, &hok2, symetry);
	}

	checkAndConnect(&hok1);
	checkAndConnect(&hok2);
	
	#ifdef SDL
	initSDL();
	#endif

	// if (use_protocol) {
	// 	 init_protocol(path); // Attente de l'ordre de départ du match
	// }

	fprintf(logfile, "%sStarting hokuyo :\n%sLooking for %d robots\n%s%s color\n", PREFIX, PREFIX, nb_robots_to_find, PREFIX, argv[1]);
	fflush(stdout);
	timeStart = timeMillis();
	long time_last_try = 0;
	while(1){
		long now = timeMillis();
		if (now - time_last_try > TIMEOUT) {
			fprintf(logfile, "%sChecking hokuyos\n", PREFIX);
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
		pushInfo('2');
		fprintf(logfile, "Both hokuyos working\n");
		hok1.zone = (ScanZone_t){ BORDER_MARGIN, TABLE_X/2, BORDER_MARGIN, TABLE_Y-BORDER_MARGIN }; // l'hok1 se charge de la partie gauche (vu du public)
		hok2.zone = (ScanZone_t){ TABLE_X/2, TABLE_X-BORDER_MARGIN, BORDER_MARGIN, TABLE_Y-BORDER_MARGIN }; // l'hok2 se charge de la partie droite
		if (symetry) {
			ScanZone_t temp = hok1.zone;
			hok1.zone = hok2.zone;
			hok2.zone = temp;
		}
	} else { // si ya qu'un des deux hok à marcher, le seul survivant scanne toute la table
		pushInfo('1');
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
		//fprintf(logfile, "%sDuration : %ld\n", PREFIX,timeMillis() - start_t);
		//fprintf(logfile, "%sGot %d and %d points\n", PREFIX, nPts1, nPts2);

		nRobots1 = getClustersFromPts(pts1, nPts1, robots1);
		nRobots2 = getClustersFromPts(pts2, nPts2, robots2);

		//fprintf(logfile, "%sCalculated %d and %d clusters\n", PREFIX, nRobots1, nRobots2);

		nRobots1 = sortAndSelectRobots(nRobots1, robots1, nb_robots_to_find);
		nRobots2 = sortAndSelectRobots(nRobots2, robots2, nb_robots_to_find);

		nRobots = mergeRobots(robots1, nRobots1, robots2, nRobots2, robots, nb_robots_to_find);
		//fprintf(logfile, "%sGot %d robots\n", PREFIX, nRobots);
		
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

		// if (use_protocol){
			pushResults(robots, nRobots, timestamp);
		// }
		// else{
			// fprintf(logfile, "%sHOK2 - %li;%i\n", PREFIX, timestamp, nRobots2);
			// for(int i=0; i<nRobots2; i++){
			// 	fprintf(logfile, ";;%i:%i", robots2[i].center.x, robots2[i].center.y);
			// }
			// fprintf(logfile, "\n");
			// fprintf(logfile, "%sHOK1 - %li;%i\n", PREFIX, timestamp, nRobots1);
			// for(int i=0; i<nRobots1; i++){
			// 	fprintf(logfile, ";;%i:%i", robots1[i].center.x, robots1[i].center.y);
			// }
			// fprintf(logfile, "\n");
			// fprintf(logfile, "%sALL  - %li;%i\n", PREFIX, timestamp, nRobots);
			// for(int i=0; i<nRobots; i++){
			// 	fprintf(logfile, ";;%i:%i", robots[i].center.x, robots[i].center.y);
			// }
			// fprintf(logfile, "\n");
		// }
	} else {
		pushInfo('0');
		sleep(1);
	}
	lastTime = timestamp;
}

