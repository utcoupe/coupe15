/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13			*
 ****************************************/
  
#include <Arduino.h>
#include "compat.h"
#include "parameters.h"
#include "protocol.h"
#include "control.h"
#include "pins.h"
#include "emergency.h"

unsigned long nextTime = 0;

void setup() {
	SERIAL_MAIN.begin(BAUDRATE, SERIAL_TYPE);
#ifdef __AVR_ATmega2560__
	TCCR3B = (TCCR3B & 0xF8) | 0x01 ;
	TCCR1B = (TCCR1B & 0xF8) | 0x01 ;
#else
#ifdef __AVR_ATmega328P__
	TCCR1B = (TCCR1B & 0xF8) | 0x01 ;
#endif
#endif
	initPins();
	SERIAL_MAIN.write(ARDUINO_ID);
	nextTime = micros();
	ControlInit();
}

void loop(){
	nextTime = nextTime + DT*1000000;
	digitalWrite(LED_MAINLOOP, HIGH);

	//Action asserv
	ComputeEmergency();
	ControlCompute();

	// Auto send status if necessary
	ProtocolAutoSendStatus();

	// zone programmation libre
	int available = SERIAL_MAIN.available();
	for(int i = 0; i < available; i++) {
		// recuperer l'octet courant
		ProtocolExecuteCmd(generic_serial_read());
		if ((nextTime - micros()) < MAX_COM_TIME*1000000) {
			break;
		}
	}

	digitalWrite(LED_MAINLOOP, LOW);
	while (micros() < nextTime) {}
}
