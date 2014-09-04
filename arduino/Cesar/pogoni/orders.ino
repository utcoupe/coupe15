/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ orders
  └────────────────────

  Contain all functions relative to orders

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#include "constants.h"
#include "orders.h"

static int* orders[NB_ORDERS];

void executeOrder() {
  // Switch géant pour lancer les ordres
}

void initOrders() {
  int i, j;
  // Initialisation
  for(i = 0; i < NB_ORDERS; i++) {
    orders[i] = NULL;
  }

  orders[PING]    = params(0);
  orders[TEST]    = params(2, INT, FLOAT);
}

int* params(int nb, ...) {
  int i;
  int* final_param = NULL;
  int temp;
  va_list ap;

  final_param = (int*) malloc((nb+1) * sizeof(int));
  if(final_param == NULL) {
    return NULL;
  }
  final_param[0] = nb;

  va_start(ap, nb);
  for(i = 1; i <= nb; i++) {
    temp = va_arg(ap, int);
    Serial.print(" ");
    Serial.println(temp);
    final_param[i] = temp;
  }
  va_end(ap);
  
  return final_param;
}

int getNbParams(int type) {
  return getTypeParam(type, 0);
}

int getNbBytes(int type) {
  int i, nb_bytes = 0;
  int nb_params = getNbParams(type);
  for(i = 1; i <= nb_params; i++) {
    nb_bytes += getNbBytesType(getTypeParam(type, i));
  }
  return nb_bytes;
}

int getNbBytesType(int type) {
  switch(type) {
    case INT:
      return NB_BYTES_INT;
    case CHAR:
      return NB_BYTES_CHAR;
    case LONG:
      return NB_BYTES_LONG;
    case FLOAT:
      return NB_BYTES_FLOAT;
    default:
      return 0;
  }
}

int getTypeParam(int type, int n) {
  if(orders[type] == NULL) {
    return 0;
  }
  return orders[type][n];
}

