/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 29/11/13			*
 ****************************************/
#ifndef CONTROL_H
#define CONTROL_H

#include "PID.h"
#include "parameters.h"

typedef struct control {
	float max_acc, max_spd, rot_spd_ratio;
	float angular_speed, linear_speed;
	int reset, paused, last_finished_id;
	int order_started;
	int pwm_left, pwm_right;
#if defined(USE_SHARP) && USE_SHARP
	int block_sharp;
#endif
} control_t;

extern control_t control;
extern PID_t PID_left, PID_right;

void ControlPrepareNewGoal(void);
void ControlReset(void);

#ifdef __cplusplus
extern "C" void ControlInit(void);
extern "C" void ControlCompute(void);
#else
void ControlInit(void);
void ControlCompute(void);
#endif

#endif
