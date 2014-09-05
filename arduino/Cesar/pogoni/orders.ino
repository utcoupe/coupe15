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

// Switch géant dans lequel sont exécutés les ordres
void executeOrder(int type, byte* params) {
  switch(type) {
    case TEST:
      long param1 = getParamLong(type, 1, params);
      Serial.print("Order TEST: ");
      Serial.println(param1);
    break;
  }
}

// Initialisation des ordres et des paramètres associés
void initOrders() {
  int i, j;
  // Initialisation
  for(i = 0; i < NB_ORDERS; i++) {
    orders[i] = NULL;
  }

  orders[PING]    = params(0);
  orders[TEST]    = params(1, LONG);
}

/** Fonctions permettant de gérer les paramètres des ordres **/

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

int getParamInt(int type, int n, byte* params) {
  if(getTypeParam(type, n) != INT) {
    #ifdef DEBUG
      Serial.print("ERROR: type of param ");
      Serial.print(n);
      Serial.println(" isn't configured as INT");
    #endif
    return 0;
  }

  return (int) params[getNbBytesBeforeParam(type, n)];
}

long getParamLong(int type, int n, byte* params) {
  int first_index_param_n, i;
  long param = 0, temp, temp2, temp3;

  if(getTypeParam(type, n) != LONG) {
    #ifdef DEBUG
      Serial.print("ERROR: type of param ");
      Serial.print(n);
      Serial.println(" isn't configured as LONG");
    #endif
    return 0;
  }

  first_index_param_n = getNbBytesBeforeParam(type, n);
  for(i = 0; i < NB_BYTES_LONG; i++) {
    param += ((long) params[first_index_param_n + i]) << (8 * (NB_BYTES_LONG - i - 1));
  }
  return param;
}

int getNbBytesBeforeParam(int type, int n) {
  int i, nb_bytes = 0;

  for(i = 1; i < n; i++) {
    nb_bytes += getNbBytesType(getTypeParam(type, i));
  }

  return nb_bytes;
}
