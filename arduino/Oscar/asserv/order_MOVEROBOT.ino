/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ AFMotor.ino
  └────────────────────

  Adafruit Motor shield library
  copyright Adafruit Industries LLC, 2009
  this code is public domain, enjoy!
  Adapté pour UTCoupe2011 par Arthur, 19/01/2011
  Moteurs 1 et 2 correspondent à la carte Rugged

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#include "AFMotor.h"
#include "order_MOVEROBOT.h"

//Controleur :
//-255:0 : Marche arrière
//0:255  : Marche avant

AF_DCMotor motor_left(1, MOTOR12_64KHZ);
AF_DCMotor motor_right(2, MOTOR12_64KHZ);

void set_pwm_left(int pwm){
	pwm = -pwm;//les moteurs sont faces à face, pour avancer il faut qu'il tournent dans un sens différent
	/*
	if (pwm > 0)
		pwm += PWM_MIN;
	else if (pwm < 0)
		pwm -= PWM_MIN;
	*/
	if(pwm > 255)
		pwm = 255;
	else if(pwm < -255)
		pwm = -255;

	if(pwm >= 0)
		motor_left.run(FORWARD);
	else
		motor_left.run(BACKWARD);

	motor_left.setSpeed(abs(pwm));
}

void set_pwm_right(int pwm) {
	/*
	if (pwm > 0)
		pwm += PWM_MIN;
	else if (pwm < 0)
		pwm -= PWM_MIN;
	*/
	if(pwm > 255)
		pwm = 255;
	else if(pwm < -255)
		pwm = -255;

	if(pwm >= 0)
		motor_right.run(FORWARD);
	else
		motor_right.run(BACKWARD);
	
	motor_right.setSpeed(abs(pwm));
}

void initOrder_MOVEROBOT() {
	set_pwm_right(0);
	set_pwm_left(0);
}

void executeOrder_MOVEROBOT(int pwm) {
	set_pwm_right(pwm);
	set_pwm_left(pwm);
}
