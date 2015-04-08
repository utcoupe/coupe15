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

#define LOCAL_ADDR ADDR_TIBOT_ASSERV //Ici l'adresse locale du client

void interruptLeftA();
void interruptRightA();
#if ENCODER_EVAL == 4
void interruptLeftB();
void interruptRightB();
#endif
#if GESTION_3EME_FIL
void interruptLeft0();
void interruptRight0();
#endif

void initPins();
unsigned long timeMillis();
unsigned long timeMicros();
void serial_send(char data);
char generic_serial_read();

#endif
