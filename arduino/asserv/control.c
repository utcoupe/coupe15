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

control_t control;

void applyPwm(void);
void checkMax(float *consigne, float max);
void checkRotAcc(float *consigne);
void checkDistAcc(float *consigne);
void checkAcc(float *consigne, float last_consigne);
void setConsigne(float consigne_left, float consigne_right);
void controlPos(goal_t *goal);
void controlPwm(goal_t *goal);
void controlAngle(goal_t *goal);
void controlConsigne(float da, float dd);

void ControlInit(void) {
	control.reset = 1;
	control.paused = 0;
	control.value_consigne_right = 0;
	control.value_consigne_left = 0;
	control.last_finished_id = 0;

	ControlSetMaxAngCurv(MAX_ANGLE);
	ControlSetMaxAcc(ACC_MAX);
	ControlSetMaxRotSpdRatio(RATIO_SPD_ROT_MAX);

	PIDInit(&PID_angle);
	PIDInit(&PID_distance);
	RobotStateInit();
	FifoInit();
}

void ControlReset(void) {
	control.value_consigne_left = 0;
	control.value_consigne_right = 0;
	FifoClearGoals();
	RobotStateReset();
	ControlPrepareNewGoal();
}

void ControlPrepareNewGoal(void) {
	PIDReset(&PID_angle);
	PIDReset(&PID_distance);
	control.order_started = 0;
}

void ControlSetMaxAngCurv(float n_max_ang) {
	control.max_angle = n_max_ang;
}

void ControlSetMaxAcc(float n_max_acc) {
	control.max_acc = n_max_acc / FREQ; 
}

void ControlSetMaxRotSpdRatio(float n_max_rot_spd) {
	control.max_rot_spd_ratio = n_max_rot_spd;
}

void ControlCompute(void) {
	goal_t* current_goal = FifoCurrentGoal();
	RobotStateUpdate();

	if (control.paused || current_goal->type == NO_GOAL){
		setConsigne(NO_PWM, NO_PWM);
		goto finalize;
	}

	switch (current_goal->type) {
		case TYPE_ANG:
			controlAngle(current_goal);
			break;
		case TYPE_POS:
			controlPos(current_goal);
			break;
		case TYPE_PWM:
			controlPwm(current_goal);
			break;
		default:
			break;
	}

finalize:
	applyPwm();
	if (current_goal->is_reached) {
		control.last_finished_id = current_goal->ID;
		if (fifo.nb_goals > 1){
			//Si le but est atteint et que ce n'est pas 
			//le dernier, on passe au suivant
			FifoNextGoal();
			ControlPrepareNewGoal();
		}
	}
}

/* 	INTERNAL FUNCTIONS 	*/
void applyPwm(void) {
	set_pwm_left((int)control.value_consigne_left);
	set_pwm_right((int)control.value_consigne_right);
}

void controlPwm(goal_t *goal) {
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
		setConsigne(pwmL, pwmR);
	}
	else {
		setConsigne(NO_PWM, NO_PWM);
		goal->is_reached = 1;
	}
}

void controlAngle(goal_t *goal) {
	float da = (goal->data.ang_data.angle - current_pos.angle);
	
	//da = moduloTwoPI(da); //Commenter pour multi-tour

	if (abs(da) <= ERROR_ANGLE) {
		setConsigne(NO_PWM, NO_PWM);
		goal->is_reached = 1;
	} else {
		controlConsigne(da, 0);
	}
}

void controlPos(goal_t *goal) {
	float dx = goal->data.pos_data.x - current_pos.x;
	float dy = goal->data.pos_data.y - current_pos.y;
	float goal_a = atan2(dy, dx);
	float da = (goal_a - current_pos.angle);
	float dd = sqrt(pow(dx, 2.0)+pow(dy, 2.0));//erreur en distance
	float d = dd * cos(da); //Distance adjacente
	static char aligne = 0;
	static long start_end_timer;

	da = moduloTwoPI(da);

	//Init ordre
	if (!control.order_started) {
		if(abs(da) < control.max_angle) {
			aligne = 1;
		}
		else {
			aligne = 0;
		}
		control.order_started = 1;
		start_end_timer = -1;
	}


	if (aligne || (abs(da) > CONE_ALIGNEMENT)) {
		da = moduloPI(da);
	}

	if (abs(d) < ERROR_POS && dd < 2*ERROR_POS) {
		if (start_end_timer < 0) {
			start_end_timer = timeMillis();
		}  else if (!goal->is_reached &&
			timeMillis() - start_end_timer > TIME_BETWEEN_ORDERS) {
				goal->is_reached = 1;
		}
		da = 0;
	}

	//Fin de la procedure d'alignement
	if(!aligne && abs(da) <= ERROR_ANGLE_TO_GO) {
		aligne = 1;
	}

	//En cours d'alignement
	if(!aligne) {
		//On tourne sur place avant de se déplacer
		controlConsigne(da, 0);
	}
	//En cours de déplacement
	else {
		controlConsigne(da, d);
	}
}

void controlConsigne(float da, float dd) {
	float consigneAngle, consigneDistance, consigneR, consigneL;
	//Asservissement en position, renvoie une consigne de vitesse
	//Calcul des spd angulaire
	//erreur = angle à corriger pour etre en direction du goal
	consigneAngle = PIDCompute(&PID_angle, da); 
	//Calcul des spd de distance
	//erreur = distance au goal
	consigneDistance = PIDCompute(&PID_distance, dd);

	checkMax(&consigneAngle, CONSIGNE_RANGE_MAX * control.max_rot_spd_ratio);
	checkRotAcc(&consigneAngle);

	checkMax(&consigneDistance, CONSIGNE_RANGE_MAX - abs(consigneAngle));
	checkDistAcc(&consigneDistance);

	//On additionne les deux speed pour avoir une trajectoire curviligne
	consigneR = consigneDistance + consigneAngle; 
	consigneL = consigneDistance - consigneAngle; 

	control.last_consigne_angle = consigneAngle;
	control.last_consigne_dist = consigneDistance;
	setConsigne(consigneL, consigneR);
}

void checkMax(float *consigne, float max) {
	if(*consigne > max)
		*consigne = max;
	else if(*consigne < -max)
		*consigne = -max;
}

void checkRotAcc(float *consigne) {
	checkAcc(consigne, control.last_consigne_angle);
}

void checkDistAcc(float *consigne) {
	checkAcc(consigne, control.last_consigne_dist);
}

void checkAcc(float *consigne, float last_consigne) {
	float diff = abs(*consigne) - (abs(last_consigne) + control.max_acc);

	if (diff > 0) {
		if (*consigne > 0) {
			*consigne -= diff;
		} else {
			*consigne += diff;
		}
	}
}

void setConsigne(float consigne_left, float consigne_right){
	if (consigne_right == NO_PWM && consigne_left == NO_PWM) {
		control.value_consigne_right = NO_PWM;
		control.value_consigne_left = NO_PWM;
	} else {
		if (consigne_right == 0 && consigne_left == 0) {
			//Pour pas casser l'asserv quand on s'arrete
			control.last_consigne_angle = 0;
			control.last_consigne_dist = 0;
		}

		//Tests d'overflow
		checkMax(&consigne_left, CONSIGNE_RANGE_MAX);
		checkMax(&consigne_right, CONSIGNE_RANGE_MAX);
		
		control.value_consigne_right = consigne_right;
		control.value_consigne_left = consigne_left;
	}
}
