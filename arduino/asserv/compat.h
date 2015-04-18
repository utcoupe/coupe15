/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13			*
 ****************************************/
#ifndef COMPAARDUINO_H
#define COMPAARDUINO_H

#include "Arduino.h"
#include "parameters.h"
#include "motor.h"
#include "encoder.h"
#include "control.h"
#include "pins.h"

extern Control control;

inline unsigned long timeMillis(){
	return millis();
}
inline unsigned long timeMicros(){
	return micros();
}

inline void serial_send(char data) { //Envoi d'un octet en serial, dépend de la plateforme
	SERIAL_MAIN.write(data);
}

inline char generic_serial_read(){
	return SERIAL_MAIN.read();
}

inline void initPins(){
	//set mode des pins pour arduino
	pinMode(PIN_ENC_LEFT_A,INPUT_PULLUP);
	pinMode(PIN_ENC_LEFT_B,INPUT_PULLUP);
	pinMode(PIN_ENC_RIGHT_A,INPUT_PULLUP);
	pinMode(PIN_ENC_RIGHT_B,INPUT_PULLUP);

	pinMode(LED_DEBUG, OUTPUT);
	pinMode(LED_MAINLOOP, OUTPUT);
	pinMode(LED_BLOCKED, OUTPUT) ;
	digitalWrite(LED_DEBUG, LOW); //LOW = eteinte
	digitalWrite(LED_MAINLOOP, LOW); //LOW = eteinte
	digitalWrite(LED_BLOCKED, LOW); //LOW = eteinte
	//Definition des interruptions arduino en fonction du type d'évaluation
#if ENCODER_EVAL == 4
	attachInterrupt(INTERRUPT_ENC_LEFT_A,leftInterruptA,CHANGE);
	attachInterrupt(INTERRUPT_ENC_RIGHT_A,rightInterruptA,CHANGE);
	attachInterrupt(INTERRUPT_ENC_LEFT_B,leftInterruptB,CHANGE);
	attachInterrupt(INTERRUPT_ENC_RIGHT_B,rightInterruptB,CHANGE);
#elif ENCODER_EVAL == 2
	attachInterrupt(INTERRUPT_ENC_LEFT_A,leftInterruptA,CHANGE);
	attachInterrupt(INTERRUPT_ENC_RIGHT_A,rightInterruptA,CHANGE);
#elif ENCODER_EVAL == 1
	attachInterrupt(INTERRUPT_ENC_LEFT_A,leftInterruptA,RISING);
	attachInterrupt(INTERRUPT_ENC_RIGHT_A,rightInterruptA,RISING);
#endif
}

#endif
