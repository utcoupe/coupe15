#ifndef COMMUNICATION_H
#define COMMUNICATION_H

#include "fast_math.h"
#include "utils.h"
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/un.h> // contient sockaddr_un

/*
static int sockfd[2]
	sockfd[0] est le descripteur du socket d'initialisation
	sockfd[1] est celui du socket de communication
*/

/* Fonction de connexion,
				/!\ fonction blocante ! tant qu'on a pas de client
				/!\ contient un fork() !
*/
void init_protocol(char* path);

void pushResults(Cluster_t *coords, int nbr, long timestamp);
void close_protocol();

#endif
