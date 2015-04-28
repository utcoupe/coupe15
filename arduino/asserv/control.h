/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 29/11/13			*
 ****************************************/
#ifndef CONTROL_H
#define CONTROL_H

#include "PID.h"
#include "parameters.h"

#define PAUSE_BIT (1<<0)
#define EMERGENCY_BIT (1<<1)

typedef struct control {
	struct speeds {
		int pwm_left, pwm_right;
		float angular_speed, linear_speed;
	} speeds;
	float max_acc, max_spd, rot_spd_ratio;
	int reset, last_finished_id;
	int order_started;
	int stop_bits;
} control_t;

extern control_t control;
extern PID_t PID_left, PID_right;

void ControlPrepareNewGoal(void);
void ControlReset(void);
void ControlSetStop(int mask);
void ControlUnsetStop(int mask);

#ifdef __cplusplus
extern "C" void ControlInit(void);
extern "C" void ControlCompute(void);
#else
void ControlInit(void);
void ControlCompute(void);
#endif

#endif
