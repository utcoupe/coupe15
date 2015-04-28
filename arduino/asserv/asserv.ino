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
	int available, sent_bytes;
	nextTime = nextTime + DT*1000000;
	digitalWrite(LED_MAINLOOP, HIGH);

	//Action asserv
	ComputeEmergency();
	ControlCompute();

	// Flush serial every time to stay in time
	Serial.flush();
	// zone programmation libre
	available = SERIAL_MAIN.available();
	sent_bytes = 0;
	for(int i = 0; i < available; i++) {
		// recuperer l'octet courant
		sent_bytes = ProtocolExecuteCmd(generic_serial_read());
	}
	// Auto send status if necessary
	ProtocolAutoSendStatus(MAX_BYTES_PER_IT - sent_bytes);

	digitalWrite(LED_MAINLOOP, LOW);
	while (micros() < nextTime) {}
}
