#include <urg_ctrl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <SDL/SDL.h>

#define MAX_DATA 683
#define WFENETRE 1280
#define HFENETRE 640

typedef struct ScanZone {
	int xmin, xmax, ymin, ymax;
} ScanZone_t;

typedef struct Pt {
	int x, y;
} Pt_t;

struct fastmathTrigo {
	int n;
	double *cos, *sin; 
};

typedef struct Hokuyo {
	urg_t* urg;
	// Pt_t pt;
	ScanZone_t zone;
	double orientation, cone_min, cone_max; //Scanne dans ori-cone;ori+cone
	int imin, imax, nb_data, isWorking;
	const char *path;
	double error;
	struct fastmathTrigo fm;
} Hok_t;

static Hok_t hok1;

void pause()
{
    int continuer = 1;
    SDL_Event event;
 
    while (continuer)
    {
        SDL_WaitEvent(&event);
        switch(event.type)
        {
            case SDL_QUIT:
                continuer = 0;
        }
    }
}



int main(int argc, char const *argv[])
{
	hok1.urg = malloc(sizeof(urg_t));
	hok1.path = "/dev/ttyACM0";
	hok1.orientation = 0;
	// hok1.pt ={-25, -25};
	hok1.cone_min = -2.356194;
	hok1.cone_max = (M_PI/2);
	hok1.error = 0;
	hok1.fm.n = 0;
	hok1.fm.cos = 0;
	hok1.fm.sin = 0;
	hok1.isWorking = 0;

	int error = urg_connect(hok1.urg, hok1.path, 115200);

	if (error < 0)
		printf("Impossible de se connecter à l'Hokuyo : %s\nVérifiez que vous êtes bien en super-utilisateur", urg_error(hok1.urg));
	else
		printf("Connection réalisée :)\n");

	hok1.imin = urg_rad2index(hok1.urg, hok1.cone_min);
	hok1.imax = urg_rad2index(hok1.urg, hok1.cone_max);

	urg_setCaptureTimes(hok1.urg, UrgInfinityTimes);
	error = urg_requestData(hok1.urg, URG_MD, hok1.imin, hok1.imax);

	if (error < 0) {
		printf("Connection perdue à %s\n", hok1.path);
		hok1.isWorking = 0;
	} else {
		printf("Test de demande de données réussi !\n");
		hok1.isWorking = 1;
		printf("Demande de données de %d à %d sur l'appareil %s OK\n", hok1.imin, hok1.imax, hok1.path);

		hok1.nb_data = urg_dataMax(hok1.urg);
	}

	printf("Récupération des %d angles \n", hok1.nb_data);
	double *angles = malloc(hok1.nb_data * sizeof(double));
	Pt_t *position = malloc(hok1.nb_data * sizeof(Pt_t));
	int i;
	for (i=0; i<hok1.nb_data; i++) {
		angles[i] = urg_index2rad(hok1.urg, i) + hok1.orientation;
	}


	SDL_Surface *ecran = NULL; // Le pointeur qui va stocker la surface de l'écran
	SDL_Init(SDL_INIT_VIDEO);
	if (SDL_Init(SDL_INIT_VIDEO) == -1) // Démarrage de la SDL. Si erreur :
    {
        fprintf(stderr, "Erreur d'initialisation de la SDL : %s\n", SDL_GetError()); // Écriture de l'erreur
        exit(EXIT_FAILURE); // On quitte le programme
    }
    ecran = SDL_SetVideoMode(WFENETRE, HFENETRE, 32, SDL_HWSURFACE);
	SDL_WM_SetCaption("Hokuyo viewer", NULL);


	if (hok1.isWorking) {
			long data[MAX_DATA];
			int n = urg_receiveData(hok1.urg, data, MAX_DATA);
			if (n == 0) {
				hok1.isWorking = 0;
				printf("Connection perdue à %s\n", hok1.path);
			} else{
				printf("Demande de %d points OK\n", n);

				SDL_Surface *dots[MAX_DATA] = {NULL};
				for (int j=0; j <= 2000; ++j){
					int n = urg_receiveData(hok1.urg, data, MAX_DATA);


					for (int i = 0; i < n; i++){
						// printf("%d, %lf\t%ld\n", i, angles[i], data[i]);
						position[i].x = data[i]*cos(angles[i] - M_PI/2);
						position[i].y = data[i]*sin(angles[i] - M_PI/2);

						dots[i] = SDL_CreateRGBSurface(SDL_HWSURFACE, 2, 2, 32, 0, 0, 0, 0);
						SDL_FillRect(dots[i], NULL, SDL_MapRGB(ecran->format, 255, 1, 1));
						SDL_Rect pdot;
						pdot.x = position[i].x*HFENETRE/4000 + WFENETRE/2;
						pdot.y = -position[i].y*HFENETRE/4000; // + HFENETRE/2;
						SDL_BlitSurface(dots[i], NULL, ecran, &pdot);

						// printf("Pt %d : %d %d\n", i, position[i].x, position[i].y);
					}

					// SDL_Surface *rectangle = NULL;
					// rectangle = SDL_CreateRGBSurface(SDL_HWSURFACE, 220, 180, 32, 0, 0, 0, 0);
					// SDL_FillRect(rectangle, NULL, SDL_MapRGB(ecran->format, 255, 255, 255));
					// SDL_Rect position;
					// position.x = 0;
					// position.y = 0;
					// SDL_BlitSurface(rectangle, NULL, ecran, &position);

					SDL_Flip(ecran);
					SDL_FillRect(ecran , NULL , 0x0 );
					if (j%50==0)
							printf("T=%ds\n", j/10);
					// pause();
				}
				printf("Fini ! Fermez la fenêtre pour terminer\n");
				pause();
				for (int i = 0; i < n; i++)
					SDL_FreeSurface(dots[i]);
				SDL_Quit();

				// SDL_FreeSurface(rectangle);
			}
		}

	free(angles);
	free(position);
	if (hok1.urg != 0)
		urg_disconnect(hok1.urg);

	return EXIT_SUCCESS;
}