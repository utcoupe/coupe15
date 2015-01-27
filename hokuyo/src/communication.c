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
    	printf("%sSocket already exists, delete (1) or abort (0) ?\n", PREFIX);
    	scanf("%d", &delete);
    	if (delete){
    		int ret = remove(serv_addr.sun_path);
		   if(ret == 0)
		      printf("%sDeleted !\n", PREFIX);
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

    // printf("Waiting for a connection,\n");

    char cmd[100];
    strcpy(cmd, "sudo nodejs ./client_hok.js ");
    strncat(cmd, path, 100);
    printf("%sLaunching nodeJS client (\"%s\")...\n", PREFIX, cmd);
    // printf("Well, actually, please execute this command in a new terminal (doesn't work well :/)...\n");
    // system(cmd);

    int status;
    int ppid = fork();
    switch (ppid) {
        case -1 :
            printf("%sError : fork()\n", PREFIX);
            exit(EXIT_FAILURE);
        case 0 :
            system(cmd);
            printf("%snodeJS client just closed\n", PREFIX);
            _exit(EXIT_SUCCESS); // on quitte sans exécuter le exit handler() (sinon ça plante sévère ^^)
        default :
            /* processus père*/
            // wait(& status);
            break;
    }

    printf("%sWaiting for connection\n", PREFIX);

    listen(sockfd[0],5);
    clilen = sizeof(cli_addr);
    sockfd[1] = accept(
        sockfd[0],(struct sockaddr *)&cli_addr,&clilen); // instruction bloquante -> connexion réussie
    if (sockfd[1] < 0) {
        perror("Error : accepting");
        exit(EXIT_FAILURE);
    }
    printf("%sA connection has been established\n", PREFIX);
}

//t x1 y1 x2 y2 x3 y3 x4 y4\n
void pushResults(Cluster_t *coords, int nbr, long timestamp) {
    // char testJson[20] = "{ \"patate\": 18 }";
    // write(sockfd[1],testJson,strlen(testJson));
    
    // char* data = parse2JSON(coords, nbr);
    // write(sockfd[1],testJson,strlen(testJson));
}

Cluster_simple_t* pullCommand(){
    // char buf[80];
    // json_t *root;
    // json_error_t error;

    // n=read(sockfd[1],buf,80); // instruction bloquante -> quelque chose à lire
    
    // root = json_loads(buf, 0, &error);
    // free(buf);

    // if(!root)
    // {
    //     printf("Error parsing JSON: on line %d: %s\n", error.line, error.text);
    //     return -1;
    // }

    /*
    3 cas possibles :
        - au début, attente d'un ordre de début du match
        - en cours, réception de la position de nos robots -> retournées au frame
        - à la fin, le code de fin de match ferme les deux programmes
    */
}

void close_protocol(){
	close(sockfd[1]);
	close(sockfd[0]);
}