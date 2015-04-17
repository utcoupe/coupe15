/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13			*
 ****************************************/
  
#include "Arduino.h"
#include "compat.h"
#include "parameters.h"
#include "protocol.h"
#include "control.h"
#include "pins.h"

unsigned long index = 0;
unsigned long nextTime = 0;
unsigned long timeLED = 0;

//Creation du controleur
Control control;

#define MAX_READ 64 
void setup() {
#ifdef mega2560
	TCCR3B = (TCCR3B & 0xF8) | 0x01 ;
#else
#ifdef nano328
	TCCR1B = (TCCR1B & 0xF8) | 0x01 ;
#endif
#endif
	initPins();
	SERIAL_MAIN.begin(BAUDRATE, SERIAL_TYPE);
	SERIAL_MAIN.write(ARDUINO_ID);
	nextTime = micros();
}

void loop(){
	nextTime = nextTime + DUREE_CYCLE*1000;
	digitalWrite(LED_MAINLOOP, HIGH);

	//Action asserv
	control.compute();

	// zone programmation libre
	int available = SERIAL_MAIN.available();
	if (available > MAX_READ) {
		available = MAX_READ;
	}
	for(int i = 0; i < available; i++) {
		// recuperer l'octet courant
		executeCmd(generic_serial_read());
	}

	digitalWrite(LED_MAINLOOP, LOW);
	while (micros() < nextTime) {}
}
