/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ orders.h
  └────────────────────

  Contain all orders define and parameters

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

/*
  Orders:
  id order,nb parameters[,type parameter 1,type parameter 2,...]

  00-09 : Ordres spéciaux
  10-49 : Ordres pour le gros robot
  50-89 : Ordres pour le petit robot
  90-99 : Ordres pour la tourelle
*/
#define NO_ACK  0
#define ACK     1
#define ERROR   2
#define PING    3
#define TEST    4

#define NB_ORDERS 100
#define NB_MAX_PARAMS_ORDER 8

uint32_t params(uint32_t nb, ...) {
  uint32_t i;
  uint32_t final_param = nb;
  va_list ap;
  
  va_start(ap, nb);
  for(i = 1; i < nb+1; i++) {
    final_param += va_arg(ap, uint32_t) << (4*i);
  }
  va_end(ap);
  
  return final_param;
}

uint32_t orders[NB_ORDERS];
void initOrders() {
  int i, j;
  // Initialisation
  for(i = 0; i < NB_ORDERS; i++) {
    orders[i] = 0;
  }
  /* Useless for Arduino
  orders[NO_ACK]    = ;
  orders[ACK]    = ;
  orders[ERROR]    = ;
  */
  orders[PING]    = params(0);
  orders[TEST]    = params(2, INT, FLOAT);
}

int getNbParams(int type) {
  return (int) orders[type] & 0X0F;
}
int getParam(int type, int n) {
  return (int) orders[type] & (0x0F << (n*4));
}

#endif
