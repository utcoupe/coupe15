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

unsigned long index = 0;
unsigned long timeStart = 0;
unsigned long timeLED = 0;

//Creation du controleur
Control control;

#define MAX_READ 64 
void setup(){
#ifdef mega2560
	TCCR3B = (TCCR3B & 0xF8) | 0x01 ;
#else
#ifdef nano328
	TCCR1B = (TCCR1B & 0xF8) | 0x01 ;
#endif
#endif
	initPins();
	SERIAL_MAIN.begin(115200, SERIAL_8N1);
	analogWrite(MOTOR1_SPD, 127);
	analogWrite(MOTOR2_SPD, 127);
}

void loop(){
	while(1);
	// on note le temps de debut 
	timeStart = micros();
	if (timeStart - timeLED > 60*1000000) {
		digitalWrite(LED_MAINLOOP, HIGH);
	}

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

	// On attend le temps qu'il faut pour boucler
	long udelay = DUREE_CYCLE*1000-(micros()-timeStart);
	if(udelay<0) {
		timeLED = timeStart;
		digitalWrite(LED_MAINLOOP, LOW);
	}
	else
		delayMicroseconds(udelay);
}