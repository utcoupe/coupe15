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

unsigned long nextTime = 0;

void setup() {
#ifdef __AVR_ATmega2560__
	TCCR3B = (TCCR3B & 0xF8) | 0x01 ;
	TCCR1B = (TCCR1B & 0xF8) | 0x01 ;
#else
#ifdef __AVR_ATmega328P__
	TCCR1B = (TCCR1B & 0xF8) | 0x01 ;
#endif
#endif
	initPins();
	SERIAL_MAIN.begin(BAUDRATE, SERIAL_TYPE);
	SERIAL_MAIN.write(ARDUINO_ID);
	nextTime = micros();
	ControlInit();
}

void loop(){
#if defined(USE_SHARP) && USE_SHARP
	float voltage_sharp;
#endif
#if defined(AUTO_STATUS_HZ) && AUTO_STATUS_HZ != 0
	static int i = 0;
#endif
	nextTime = nextTime + DT*1000000;
	digitalWrite(LED_MAINLOOP, HIGH);

	//Action asserv
	ControlCompute();

#if defined(AUTO_STATUS_HZ) && AUTO_STATUS_HZ != 0
	if (++i % (HZ / AUTO_STATUS_HZ) == 0) {
		ProtocolAutoSendStatus();
		i = 0;
	}
#endif

#if defined(USE_SHARP) && USE_SHARP
	voltage_sharp = (analogRead(PIN_SHARP)*5.0/1024.0);
	if (voltage_sharp > STOP_SHARP_VOLTAGE) {
		control.block_sharp = 1;
	} else {
		control.block_sharp = 0;
	}
#endif

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
