/**************************************** 
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13			*
 ****************************************/
#include "compat.h"
#include "pins.h"

#if ENCODER_EVAL == 4
#ifdef nano328
#error "Nano328 can't handle more than 2 interrupts"
#endif
#endif

extern Control control;

void initPins(){
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
	attachInterrupt(INTERRUPT_ENC_LEFT_A,interruptLeftA,CHANGE);
	attachInterrupt(INTERRUPT_ENC_RIGHT_A,interruptRightA,CHANGE);
	attachInterrupt(INTERRUPT_ENC_LEFT_B,interruptLeftB,CHANGE);
	attachInterrupt(INTERRUPT_ENC_RIGHT_B,interruptRightB,CHANGE);
#elif ENCODER_EVAL == 2
	attachInterrupt(INTERRUPT_ENC_LEFT_A,interruptLeftA,CHANGE);
	attachInterrupt(INTERRUPT_ENC_RIGHT_A,interruptRightA,CHANGE);
#elif ENCODER_EVAL == 1
	attachInterrupt(INTERRUPT_ENC_LEFT_A,interruptLeftA,RISING);
	attachInterrupt(INTERRUPT_ENC_RIGHT_A,interruptRightA,RISING);
#endif
}

unsigned long timeMillis(){
	return millis();
}
unsigned long timeMicros(){
	return micros();
}

//"hack" des interrupt arduino

void interruptLeftA(){
	control.getLenc()->interruptA();
}

void interruptRightA(){
	control.getRenc()->interruptA();
}

#if ENCODER_EVAL == 4
void interruptLeftB(){
	control.getLenc()->interruptB();
}

void interruptRightB(){
	control.getRenc()->interruptB();
}
#endif

void serial_send(char data) { //Envoi d'un octet en serial, dépend de la plateforme
	SERIAL_MAIN.write(data);
}

char generic_serial_read(){
	return SERIAL_MAIN.read();
}
