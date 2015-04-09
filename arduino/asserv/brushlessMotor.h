//Adapted from Adafruit Motor Shield by Quentin C for UTCoupe
//Defined for brushless controler shield designed by UTCoupe
//08/04/2013

#ifndef BRUSHLESSMOTOR_H
#define BRUSHLESSMOTOR_H

#include "parameters.h"
#include "pins.h"

#define MOTOR_LEFT 1
#define MOTOR_RIGHT 2

#define NO_PWM 666

class Motor
{
	public:
	Motor(int n_motor_side);
	void setPwm(int pwm);

	private:
	int motor_side;
	int last_pwm;
};

#endif
