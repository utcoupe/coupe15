/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ orders.h
  └────────────────────

  Contient les define relatifs aux ordres et les prototypes des fonctions

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#ifndef ORDERS_H
#define ORDERS_H

/* Orders:
  id order,nb parameters[,type parameter 1,type parameter 2,...]
  00-09 : Ordres spéciaux
  10-49 : Ordres pour le gros robot
  50-89 : Ordres pour le petit robot
  90-99 : Ordres pour la tourelle

  Pour ajouter un ordre :
  1 - Ajouter un define avec un id unique (exemple : #define TEST 4)
  2 - Dans la fonction initOrders() de orders.ino, ajouter une ligne
      pour configurer les paramètres de l'ordre (nombre, type)
  3 - Dans la fonction executeOrder() de orders.ino, ajouter un case
      au switch pour récupérer les paramètres et appeler une
      fonction EXTERNE au switch.
*/
#define NB_ORDERS 100

#define NO_ACK  0
#define ACK     1
#define ERROR   2
#define PING    3
#define TEST    4


// List of parameters type
#define INT 1
#define CHAR 2
#define LONG 3
#define FLOAT 4
#define NB_BYTES_INT 1
#define NB_BYTES_CHAR 1
#define NB_BYTES_LONG 4
#define NB_BYTES_FLOAT 4

#define LONG_TO_FLOAT_COEFF 1000.0
#define LONG_MAX_POSITIVE_NUMBER 2147483647
#define LONG_OFFSET 4294967295

// Prototypes
void executeOrder(int type, byte* params);
void initOrders();
int* params(int nb, ...);
int getNbParams(int type);
int getNbBytes(int type);
int getNbBytesType(int type);
int getTypeParam(int type, int n);

int getParamInt(int type, int n, byte* params);
char getParamChar(int type, int n, byte* params);
long getParamLong(int type, int n, byte* params);
float getParamFloat(int type, int n, byte* params);
int getNbBytesBeforeParam(int type, int n);

#endif
