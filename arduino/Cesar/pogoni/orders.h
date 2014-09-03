/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ orders.h
  └────────────────────

  Contain all orders.cpp define, prototypes and variables

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#ifndef ORDERS_H
#define ORDERS_H

// List of parameters type
#define INT 1
#define CHAR 2
#define LONG 3
#define FLOAT 4
#define NB_BYTES_INT 1
#define NB_BYTES_CHAR 1
#define NB_BYTES_LONG 4
#define NB_BYTES_FLOAT 4

// Orders:
// id order,nb parameters[,type parameter 1,type parameter 2,...]
// 00-09 : Ordres spéciaux
// 10-49 : Ordres pour le gros robot
// 50-89 : Ordres pour le petit robot
// 90-99 : Ordres pour la tourelle

#define NO_ACK  0
#define ACK     1
#define ERROR   2
#define PING    3
#define TEST    4

#define NB_ORDERS 100
#define NB_MAX_PARAMS_ORDER 8

// Prototypes
int* params(int nb, ...);
int getNbParams(int type);
int getParam(int type, int n);
void initOrders();

// Variables
int* orders[NB_ORDERS];


#endif
