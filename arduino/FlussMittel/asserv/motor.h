/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 31/03/13			*
 ****************************************/
#ifndef MOTOR_H
#define MOTOR_H

#include "AFMotor.h"
#include "Arduino.h"
#define NO_PWM 0

void set_pwm_right(int pwm);
void set_pwm_left(int pwm);

#endif
