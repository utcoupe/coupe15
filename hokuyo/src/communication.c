#include "communication.h"
#include "fast_math.h"
#include "global.h"

#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <string.h>
#include <stdio.h>

static int sockfd[2];

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