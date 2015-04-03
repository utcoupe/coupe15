/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 29/11/13			*
 ****************************************/
#include "motor.h"
#include "parameters.h"

//Controleur :
//0:127   : Marche arriere
//127:255 : Marche avant
Motor motor_left(MOTOR_LEFT);
Motor motor_right(MOTOR_RIGHT);

void set_pwm_left(int pwm){
	if (pwm != NO_PWM) {
		pwm = -pwm;//les moteurs sont faces à face, pour avancer il faut qu'il tournent dans un sens différent
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
	motor_left.setPwm(pwm);
}

void set_pwm_right(int pwm){
	if (pwm != NO_PWM) {
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
	motor_right.setPwm(pwm);
}
