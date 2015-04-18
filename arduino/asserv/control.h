/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 29/11/13			*
 ****************************************/
#ifndef CONTROL_H
#define CONTROL_H

#include "encoder.h"
#include "robotstate.h"
#include "goals.h"
#include "PID.h"

extern PID_t PID_angle, PID_distance;

class Control{
	public:
	//Constructeur sans argument, utilise les #define
	Control();

	//compute : update le robot_state puis compute l'asserv
	void compute();

	void reset();

	void setMaxAngCurv(float n_max_ang);
	void setMaxAcc(float n_max_acc);
	void setMaxRotSpdRatio(float n_max_rot_spd);

	//Permet la gestion de la pause
	void pause();
	void resume();

	//Get ID
	int getLastFinishedId();
	void resetLastFinishedId();

	private:
	void setConsigne(float consigne_left, float consigne_right); //controles puis modification (renvoie l'overflow)
	void check_acc(float *consigne, float last_consigne);
	void check_dist_acc(float *consigne);
	void check_rot_acc(float *consigne);
	void check_max(float *consigne, float max = CONSIGNE_RANGE_MAX);
	void controlPos(float e_angle, float e_dist); //goal en mm

	void applyPwm();

	int consigne_offset;
	float max_angle;

	float max_acc, max_rot_spd_ratio;

	//Les pwm à appliquer
	float value_consigne_right, value_consigne_left;

	float last_consigne_angle, last_consigne_dist;

	int last_finished_id;
	int paused;
};
#endif
