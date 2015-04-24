/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 31/03/13			*
 ****************************************/
#ifndef MOTOR_H
#define MOTOR_H

#include "brushlessMotor.h"

void set_pwm(int side, int pwm);

inline void set_pwm_left(int pwm){
	set_pwm(MOTOR_LEFT, pwm);
}

inline void set_pwm_right(int pwm){
	set_pwm(MOTOR_RIGHT, pwm);
}

#endif
