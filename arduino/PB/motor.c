/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 29/11/13			*
 ****************************************/

#include "parameters.h"
#include "brushlessMotor.h"

#ifndef PWM_MIN
#define PWM_MIN 0
#endif

//Controleur :
//0:127   : Marche arriere
//127:255 : Marche avant

void set_pwm(int side, int pwm) {
	if (side == MOTOR_LEFT) {
		//les moteurs sont faces à face, pour avancer 
		//il faut qu'il tournent dans un sens différent
		pwm = -pwm;
	}
	if (pwm != 0) {
		if (pwm > 0)
			pwm += PWM_MIN;
		else if (pwm < 0)
			pwm -= PWM_MIN;

		pwm += 127;

		if(pwm > 255)
			pwm = 255;
		else if(pwm < 0)
			pwm = 0;
	}
	BrushlessMotorSetPwm(side, pwm);
}

