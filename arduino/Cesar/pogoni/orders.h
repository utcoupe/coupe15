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

#define LONG_TO_FLOAT_COEFF 1000.0
#define LONG_MAX_POSITIVE_NUMBER 2147483647
#define LONG_OFFSET 4294967295

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

// Prototypes
void executeOrder(int type, byte* params);
void initOrders();
int* params(int nb, ...);
int getNbParams(int type);
int getNbBytes(int type);
int getNbBytesType(int type);
int getTypeParam(int type, int n);

#endif
