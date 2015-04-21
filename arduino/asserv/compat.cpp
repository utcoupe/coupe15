#include "compat.h"
#include "parameters.h"

extern "C" void serial_print(const char *str) {
	SERIAL_MAIN.print(str);
}

extern "C" void serial_send(char data) { //Envoi d'un octet en serial, dépend de la plateforme
	SERIAL_MAIN.write(data);
}

extern "C" char generic_serial_read(){
	return SERIAL_MAIN.read();
}

