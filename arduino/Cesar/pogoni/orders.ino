/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ orders.cpp
  └────────────────────

  Contain all functions relative to orders

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#include "pogoni.h"
#include "constants.h"
#include "orders.h"

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

int getNbParams(int type) {
  return (int) orders[type] & 0X0F;
}

int getParam(int type, int n) {
  return (int) orders[type] & (0x0F << (n*4));
}

void initOrders() {
  int i, j;
  // Initialisation
  for(i = 0; i < NB_ORDERS; i++) {
    orders[i] = 0;
  }
  /* Useless for this Arduino
  orders[NO_ACK]    = ;
  orders[ACK]    = ;
  orders[ERROR]    = ;
  */
  orders[PING]    = params(0);
  orders[TEST]    = params(2, INT, FLOAT);
}
