//Par Quentin pour UTCoupe2013 01/04/2013
//Commande de shield arduino brushless by UTCoupe

#include <Arduino.h>
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

void BrushlessMotorsInit() {
		pinMode(MOTOR1_SPD, OUTPUT);
		pinMode(MOTOR1_EN, OUTPUT);
		pinMode(MOTOR1_BRK, OUTPUT);
		pinMode(MOTOR2_SPD, OUTPUT);
		pinMode(MOTOR2_EN, OUTPUT);
		pinMode(MOTOR2_BRK, OUTPUT);

		digitalWrite(MOTOR1_BRK, HIGH);
		digitalWrite(MOTOR2_BRK, HIGH);
		digitalWrite(MOTOR1_EN, LOW);
		digitalWrite(MOTOR2_EN, LOW);
}

void BrushlessMotorSetPwm(int motor_side, int pwm) {
	static int last_pwms[2] = {0, 0};
	int *last_pwm;
	if (motor_side == MOTOR_LEFT) {
		last_pwm = &last_pwms[0];
	} else {
		last_pwm = &last_pwms[1];
	}
	if (pwm == *last_pwm) {
		return;
	}
	else {
		*last_pwm = pwm;
	}
	switch (motor_side) {
		case MOTOR_LEFT:{
			analogWrite(MOTOR1_SPD, pwm);
			if (pwm == 0) {
				digitalWrite(MOTOR1_EN,LOW); //disable motor when pwm = 0
			}
			else {
				digitalWrite(MOTOR1_EN,HIGH); //enable motor when pwm != 0
			}
		    	break;
		}
		case MOTOR_RIGHT:{
			analogWrite(MOTOR2_SPD, pwm);
			if (pwm == 0) {
				digitalWrite(MOTOR2_EN,LOW); //disable motor when pwm = 0
			}
			else {
				digitalWrite(MOTOR2_EN,HIGH); //enable motor when pwm != 0
			}
			break;
		}
	}
}
