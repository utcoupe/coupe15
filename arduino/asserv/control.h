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

class Control{
	public:
	//Constructeur sans argument, utilise les #define
	Control();

	//compute : update le robot_state puis compute l'asserv
	void compute();

	//update_robot_state : permet d'update la robot state sans compute l'asserv
	void update_robot_state();

	void reset();

	//set des differents PIDs
	void setPID_angle(float n_P, float n_I, float n_D); //PID de l'asservissement angulaire
	void setPID_distance(float n_P, float n_I, float n_D); //PID de l'asservissement en position

	//set des anti-windup
	void setErrorUseI_angle(float I);
	void setErrorUseI_distance(float I);
	
	void setMaxAngCurv(float n_max_ang);
	void setMaxAcc(float n_max_acc);
	void setMaxRotSpdRatio(float n_max_rot_spd);

	//Push un goal
	int pushGoal(int ID, int p_type, float p_data_1 = 0, float p_data_2 = 0, float p_data_3 = 0);
	void nextGoal(); //va au goal suivant
	void clearGoals();
	int getRemainingGoals();
	void setIsReached() { fifo.pushIsReached(); };

	//Toutes les positions sont renvoyée en mm, toutes les vitess en mm/ms = m/s
	void pushPos(pos n_pos); 
	pos getPos();
	bool isBlocked();

	//Renvoie les codeurs (utile pour debug)
	Encoder* getLenc();
	Encoder* getRenc();

	//Permet la gestion de la pause
	void pause();
	void resume();

	//Get ID
	int getLastFinishedId();
	void resetLastFinishedId();

	private:
	RobotState robot;
	Fifo fifo;
	PID PID_Angle;
	PID PID_Distance;
	//interface avec les PIDs
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
};
#endif
