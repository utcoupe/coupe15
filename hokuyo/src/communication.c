#include "communication.h"
#include "fast_math.h"
#include "global.h"

#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <string.h>
#include <stdio.h>

static int sockfd[2];

void init_protocol(char *path) {
	int servlen;
    socklen_t clilen;
    struct sockaddr_un  cli_addr, serv_addr;

	if ((sockfd[0] = socket(AF_UNIX,SOCK_STREAM,0)) < 0){
        perror("Error : creating socket");
        exit(EXIT_FAILURE);
    }

    bzero((char *) &serv_addr, sizeof(serv_addr));
    serv_addr.sun_family = AF_UNIX;
    strcpy(serv_addr.sun_path, path);
    servlen=strlen(serv_addr.sun_path) + 
                            sizeof(serv_addr.sun_family);

    if( access( serv_addr.sun_path, F_OK ) != -1 ) {
    	// file exists
    	int delete;
    	printf("Socket already exists, delete (1) or abort (0) ?\n");
    	scanf("%d", &delete);
    	if (delete){
    		int ret = remove(serv_addr.sun_path);
		   if(ret == 0)
		      printf("Deleted !\n");
		   else 
		   {
		      perror("Error: unable to delete the file\n");
		      exit(EXIT_FAILURE);
		   }
    	}
	}

    if(bind(sockfd[0],(struct sockaddr *)&serv_addr,servlen)<0){
        perror("Error : binding socket"); 
        exit(EXIT_FAILURE);
    }

    printf("Waiting for a connection,\n");

    char cmd[100];
    strcpy(cmd, "sudo nodejs ./client_hok.js ");
    strncat(cmd, path, 100);
    printf("Launching nodeJS client (\"%s\")...\n", cmd);
    printf("Well, actually, please execute this command in a new terminal (doesn't work well :/)...\n");
    // system(cmd);

    listen(sockfd[0],5);
    clilen = sizeof(cli_addr);
    sockfd[1] = accept(
        sockfd[0],(struct sockaddr *)&cli_addr,&clilen); // instruction bloquante -> connexion réussie
    if (sockfd[1] < 0) {
        perror("Error : accepting");
        exit(EXIT_FAILURE);
    }
    printf("A connection has been established\n");
}

//t x1 y1 x2 y2 x3 y3 x4 y4\n
void pushResults(Cluster_t *coords, int nbr, long timestamp) {
	// int i=0, n;
	// fprintf(pipe, "%ld", timestamp);
	// for(i=0; i<nbr; i++) {
	// 	fprintf(pipe, " %d %d", coords[i].center.x, coords[i].center.y);
	// }
	// for (i=nbr; i<MAX_ROBOTS; i++) {
	// 	fprintf(pipe, " -1 -1");
	// }
	// fprintf(pipe, "\n");
	// fflush(pipe);
}

void close_protocol(){
	close(sockfd[1]);
	close(sockfd[0]);
}