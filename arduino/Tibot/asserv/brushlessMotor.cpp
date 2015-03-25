//Par Quentin pour UTCoupe2013 01/04/2013
//Commande de shield arduino brushless by UTCoupe

#include "Arduino.h"

#include "brushlessMotor.h"


/******************************************
               MOTORS
******************************************/
/*********************************
DIG1 and DIG2 defined to 0 :
linear adjustment of the speed

might be configured to smth else in order use speed control
see datasheet of DEC-MODULE-24/2
***********************************/

Motor::Motor(int n_motor_side) {
	motor_side = n_motor_side;

	switch (motor_side) {
		case MOTOR_LEFT:{
		 	pinMode(MOTOR1_SPD, OUTPUT);

		 	pinMode(MOTOR1_EN, OUTPUT);
			digitalWrite(MOTOR1_EN, LOW); //Enable motor

			pinMode(MOTOR1_RDY, INPUT);
			break;
		}
		case MOTOR_RIGHT:{
			pinMode(MOTOR2_SPD, OUTPUT);

			pinMode(MOTOR2_EN, OUTPUT);
			digitalWrite(MOTOR2_EN,LOW); //enable motor

			pinMode(MOTOR2_RDY, INPUT);
		   	break;
		}
	}
}

void Motor::setPwm(int pwm) {
	switch (motor_side) {
		case MOTOR_LEFT:{
			analogWrite(MOTOR1_SPD, pwm);
			if (pwm == NO_PWM) {
				digitalWrite(MOTOR1_EN,LOW); //disable motor when pwm = 0
			}
			else {
				digitalWrite(MOTOR1_EN,HIGH); //enable motor when pwm != 0
			}
		    	break;
		}
		case MOTOR_RIGHT:{
			analogWrite(MOTOR2_SPD, pwm);
			if (pwm == NO_PWM) {
				digitalWrite(MOTOR2_EN,LOW); //disable motor when pwm = 0
			}
			else {
				digitalWrite(MOTOR2_EN,HIGH); //enable motor when pwm != 0
			}
			break;
		}
	}
}
