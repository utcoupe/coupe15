/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13			*
 ****************************************/
#include "robotstate.h"
#include "compat.h"
#include "local_math.h"
#include "encoder.h"
#include <math.h>

pos_t current_pos;

void PosUpdateAngle() {
	if (current_pos.angle > M_PI) {
		current_pos.angle -= 2.0*M_PI;
		current_pos.modulo_angle++;
	}
	else if (current_pos.angle <= -M_PI) {
		current_pos.angle += 2.0*M_PI;
		current_pos.modulo_angle--;
	}
}

void RobotStateInit() {
	current_pos.x = 0;
	current_pos.y = 0;
	current_pos.angle = 0;
	current_pos.modulo_angle = 0;
	encoders_reset();
}

void RobotStateSetPos(float x, float y, float angle) {
	current_pos.x = x;
	current_pos.y = y;
	current_pos.angle = angle;
	PosUpdateAngle();
}

void RobotStateUpdate() {
	static long left_last_ticks = 0, right_last_ticks = 0;
	static float last_angle = 0;
	long ticksR, ticksL;
	float dd, dl, dr, d_angle;

	ticksR = right_ticks;
	ticksL = left_ticks;
	dl = (ticksL - left_last_ticks)*TICKS_TO_MM_LEFT;
	dr = (ticksR - right_last_ticks)*TICKS_TO_MM_RIGHT;

	//d_angle = atan2((dr - dl), ENTRAXE_ENC); //sans approximation tan
	d_angle = (dr - dl)/ENTRAXE_ENC; // approximation tan
	current_pos.angle += d_angle;
	PosUpdateAngle();

	dd = (dr + dl) / 2.0;
	current_pos.x += dd*cos((current_pos.angle + last_angle)/2.0);
	current_pos.y += dd*sin((current_pos.angle + last_angle)/2.0);

	// prepare la prochaine update
	right_last_ticks = ticksR;
	left_last_ticks = ticksL;
	last_angle = current_pos.angle;
}
