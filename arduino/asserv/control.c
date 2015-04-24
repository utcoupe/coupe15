/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 29/11/13			*
 ****************************************/

#include "encoder.h"
#include "robotstate.h"
#include "goals.h"
#include "control.h" 
#include "compat.h"
#include "motor.h"
#include "local_math.h"
#include <math.h>

#define ANG_REACHED (0x1)
#define POS_REACHED (0x2)
#define REACHED (ANG_REACHED | POS_REACHED)

#define sign(x) ((x)>=0?1:-1)

control_t control, last_control;

void goalPos(goal_t *goal);
void goalPwm(goal_t *goal);
void goalAngle(goal_t *goal);
int controlPos(float dd, float da);

float calcSpeed(float init_spd, float dd, float max_spd, float final_speed);
void applyPID(void);
void applyPwm(void);
void stopRobot(void);

void ControlInit(void) {
	control.reset = 1;
	control.paused = 0;
	control.angular_speed = 0,
	control.linear_speed = 0;
	control.last_finished_id = 0;

	control.max_acc = ACC_MAX;
	control.max_spd = SPD_MAX; control.rot_spd_ratio = RATIO_ROT_SPD_MAX;

	RobotStateInit();
	FifoInit();
	PIDInit(&PID_left);
	PIDInit(&PID_right);
	PIDSet(&PID_left, LEFT_P, LEFT_I, LEFT_D, LEFT_BIAS);
	PIDSet(&PID_right, RIGHT_P, RIGHT_I, RIGHT_D, RIGHT_BIAS);
}

void ControlReset(void) {
	control.linear_speed = 0;
	control.last_finished_id = 0;
	FifoClearGoals();
	RobotStateReset();
	ControlPrepareNewGoal();
}

void ControlPrepareNewGoal(void) {
	control.order_started = 0;
}

void ControlCompute(void) {
	long now;
	static long time_reached = -1;
	goal_t* current_goal = FifoCurrentGoal();
	RobotStateUpdate();
	last_control = control;

	switch (current_goal->type) {
		case TYPE_ANG:
			goalAngle(current_goal);
			break;
		case TYPE_POS:
			goalPos(current_goal);
			break;
		case TYPE_PWM:
			goalPwm(current_goal);
			break;
		default:
			stopRobot();
			break;
	}

	if (control.paused)
		stopRobot();

	now = timeMicros();

	if (current_goal->is_reached) {
		if (time_reached < 0) {
			time_reached = now;
		}
		control.last_finished_id = current_goal->ID;
		stopRobot();
		if (fifo.nb_goals > 1 && 
		(now-time_reached) > (TIME_BETWEEN_ORDERS*1000000)) {
			//Si le but est atteint et que ce n'est pas 
			//le dernier, on passe au suivant
			FifoNextGoal();
			ControlPrepareNewGoal();
			time_reached = -1;
		}
	}

	applyPwm();
}

/* INTERNAL FUNCTIONS */

void goalPwm(goal_t *goal) {
	static long start_time;
	long now = timeMicros();
	if (!control.order_started){
		start_time = now;
		control.order_started = 1;
	}
	if ((now - start_time)/1000.0 <= goal->data.pwm_data.time){
		float pwmR, pwmL;
		pwmL = goal->data.pwm_data.pwm_l;
		pwmR = goal->data.pwm_data.pwm_r;

		control.pwm_left = pwmL;
		control.pwm_right = pwmR;
	}
	else {
		control.pwm_left = 0;
		control.pwm_right = 0;
		goal->is_reached = 1;
	}
}

void goalAngle(goal_t *goal) {
	float angle, da;
	angle = goal->data.ang_data.angle;
	da = angle - current_pos.angle;

	if (goal->data.ang_data.modulo) {
		da = moduloTwoPI(da);
	}
	
	if (controlPos(0, da) & ANG_REACHED) {
		goal->is_reached = 1;
	}
}

void goalPos(goal_t *goal) {
	int x, y;
	float dx, dy, da, dd, goal_a;

	x = goal->data.pos_data.x;
	y = goal->data.pos_data.y;
	dx = x - current_pos.x;
	dy = y - current_pos.y;
	goal_a = atan2(dy, dx);
	da = (goal_a - current_pos.angle);
	da = moduloTwoPI(da);
	dd = sqrt(pow(dx, 2.0)+pow(dy, 2.0));

	if (abs(da) > CONE_ALIGNEMENT) {
		da = moduloPI(da);
		dd = - dd;
	}

	if (controlPos(dd, da) == REACHED) {
		goal->is_reached = 1;
	}
}

int controlPos(float dd, float da) {
	int ret;
	float dda, ddd;

	dda = da * (ENTRAXE_ENC/2);
	ddd = dd * exp(-abs(K_DISTANCE_REDUCTION*da));

	control.angular_speed = calcSpeed(control.angular_speed, dda, 
			control.max_spd * control.rot_spd_ratio, 0);
	control.linear_speed = calcSpeed(control.linear_speed, ddd,
			control.max_spd, 0);

	ret = 0;
	if (abs(dd) < ERROR_POS) {
		ret |= POS_REACHED;
	}
	if (abs(da) < ERROR_ANGLE) {
		ret |= ANG_REACHED;
	}

	applyPID();
	return ret;
}

float calcSpeed(float init_spd, float dd, float max_spd, float final_speed) {
	float dd_abs, acc_spd, dec_spd, target_spd;
	int d_sign;
	dd_abs = abs(dd);
	d_sign = sign(dd);

	init_spd *= d_sign;
	acc_spd = init_spd + (control.max_acc*DT);
	dec_spd = sqrt(2*control.max_acc*dd_abs) - (control.max_acc*DT) + final_speed;
	target_spd = min(max_spd, min(acc_spd, dec_spd))*d_sign;
	return target_spd;
}

void stopRobot(void) {
	// restore control and re-compute speeds
	control = last_control;
	controlPos(0,0);
}

void emergencyStop(void) {
	control.pwm_left = 0;
	control.pwm_right = 0;
	control.linear_speed = 0;
	control.angular_speed = 0;
}

void applyPwm(void) {
	set_pwm_left(control.pwm_left);
	set_pwm_right(control.pwm_right);
}

void applyPID(void) {
	float left_spd, right_spd;
	float left_ds, right_ds;
	left_spd = control.linear_speed - control.angular_speed;
	right_spd = control.linear_speed + control.angular_speed;
	left_ds = left_spd - wheels_spd.left;
	right_ds = right_spd - wheels_spd.right;
	control.pwm_left = PIDCompute(&PID_left, left_ds);
	control.pwm_right = PIDCompute(&PID_right, right_ds);
}
