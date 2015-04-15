/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13			*
 ****************************************/
#ifndef ROBOTSTATE_H
#define ROBOTSTATE_H

#include "parameters.h"
#include "encoder.h"
#include <math.h>

#define TICKS_TO_MM_LEFT ((float)((2.0*M_PI*ENC_LEFT_RADIUS)/(TICKS_PER_TURN)))// = mm/ticks
#define MM_TO_TICKS_LEFT ((float)(1/ENC_TICKS_TO_MM_LEFT))
#define TICKS_TO_MM_RIGHT ((float)((2.0*M_PI*ENC_RIGHT_RADIUS)/(TICKS_PER_TURN)))// = mm/ticks
#define MM_TO_TICKS_RIGHT ((float)(1/ENC_TICKS_TO_MM_RIGHT))

typedef struct pos pos;
struct pos{
	long x;
	long y;
	float angle;
	int modulo_angle;
};

class RobotState{
	public:
	RobotState();//Constructeur
	void reset();
	pos getMmPos();
	Encoder* getRenc();
	Encoder* getLenc();
	void pushMmPos(pos n_pos);
	void update();

	bool isBlocked();
	void useBlock(bool state);

	private:
	void blocked_management();
	Encoder encoderLeft;
	Encoder encoderRight;
	pos current_pos;
	bool blocked, use_block, last_block; //Detecte si le robot est bloqué (attention ici immobile = bloqué)
	long last_ticksR;
	long last_ticksL;
};

#endif
