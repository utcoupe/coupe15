/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13			*
 ****************************************/
#include "robotstate.h"
#include "compat.h"
#include "local_math.h"
#include <math.h>

/********************************************************
 * 							*
 * 		      CLASSE ROBOTSTATE			*
 *							*
 ********************************************************/
RobotState::RobotState():encoderLeft(LEFT_SIDE), encoderRight(RIGHT_SIDE)
{
	RobotState::reset();
}

void RobotState::reset(){
	use_block = false;
	last_block = false;
	blocked = false;
	current_pos.x = 0;
	current_pos.y = 0;
	current_pos.angle = 0;
	current_pos.modulo_angle = 0;
	encoderRight.reset();
	encoderLeft.reset();
	last_ticksR = encoderRight.getTicks();
	last_ticksL = encoderLeft.getTicks();
}

pos RobotState::getMmPos(){
	pos mm_pos;
	mm_pos.angle = current_pos.angle + 2*M_PI*current_pos.modulo_angle;
	mm_pos.x = current_pos.x / FIXED_POINT_PRECISION;
	mm_pos.y = current_pos.y / FIXED_POINT_PRECISION;
	return mm_pos;
}

Encoder* RobotState::getRenc(){
	return &encoderRight;
}

Encoder* RobotState::getLenc(){
	return &encoderLeft;
}

void RobotState::pushMmPos(pos n_pos){
	current_pos.x = n_pos.x * FIXED_POINT_PRECISION;
	current_pos.y = n_pos.y * FIXED_POINT_PRECISION;
	current_pos.angle = moduloTwoPI(n_pos.angle);
	current_pos.modulo_angle = ceil(n_pos.angle/(2*M_PI));
}

void RobotState::update(){
	static float last_angle = current_pos.angle;
	long ticksR = encoderRight.getTicks();
	long ticksL = encoderLeft.getTicks();
	float dl = (ticksL - last_ticksL)*TICKS_TO_MM_LEFT;
	float dr = (ticksR - last_ticksR)*TICKS_TO_MM_RIGHT;

	//float d_angle = atan2((dr - dl), ENTRAXE_ENC); //sans approximation tan
	float d_angle = (dr - dl)/ENTRAXE_ENC; //sans approximation tan
	current_pos.angle += d_angle;
	if (current_pos.angle > M_PI) {
		current_pos.angle -= 2.0*M_PI;
		current_pos.modulo_angle++;
	}
	else if (current_pos.angle <= -M_PI) {
		current_pos.angle += 2.0*M_PI;
		current_pos.modulo_angle--;
	}

	dl *= FIXED_POINT_PRECISION;
	dr *= FIXED_POINT_PRECISION;

	float dd = (dr + dl) / 2.0;
	current_pos.x += round(dd*cos((current_pos.angle + last_angle)/2.0));
	current_pos.y += round(dd*sin((current_pos.angle + last_angle)/2.0));


	//prepare la prochaine update
	last_ticksR = ticksR;
	last_ticksL = ticksL;
	last_angle = current_pos.angle;

	if (use_block) {
		blocked_management();
	}
}

//Set un flag si robot bloqué
void RobotState::blocked_management() {
	static pos last_pos = current_pos;
	static float time = 0;

	time += DUREE_CYCLE;
	if (time > PERIOD_BLOCKED) {
		bool local_block;
		int dx = current_pos.x - last_pos.x;
		int dy = current_pos.y - last_pos.y;
		float da = current_pos.angle - last_pos.angle; //delta angle
		int dd2 = dx*dx + dy*dy; //Delta distrance carré
		//On ajoute la distance parcourue par l'angle à la distance "droite"
		dd2 += da*da*ENTRAXE_ENC*ENTRAXE_ENC; //Tout est au carré pour eviter les sqrt

		//Si on a pas assez bougé
		if (dd2 < MIN_DIST_BLOCKED*MIN_DIST_BLOCKED) {
			local_block = true;
		} else {
			local_block = false;
		}
		blocked = local_block && last_block; //Evite les faux positifs
		last_block = local_block;
		last_pos = current_pos;
		time = 0; //Remise à 0
	}
}

void RobotState::useBlock(bool state) {
	use_block = state;
	if (use_block == false) {
		last_block = false;
		blocked = false;
	}
}

bool RobotState::isBlocked() {
	return blocked;
}
