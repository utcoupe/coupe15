/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 29/11/13			*
 ****************************************/
#ifndef CONTROL_H
#define CONTROL_H

#include "PID.h"

typedef struct control {
	float max_angle, max_acc, max_rot_spd_ratio;
	float value_consigne_right, value_consigne_left;
	float last_consigne_angle, last_consigne_dist;
	int reset, paused, last_finished_id, consigne_offset;
	char order_started;
} control_t;

extern control_t control;
extern PID_t PID_angle, PID_distance;

void ControlSetMaxRotSpdRatio(float n_max_rot_spd);
void ControlSetMaxAcc(float n_max_acc);
void ControlSetMaxAngCurv(float n_max_ang);
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
