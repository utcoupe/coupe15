/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13			*
 ****************************************/
#ifndef GOALS_H
#define GOALS_H

#include "parameters.h"

#define TYPE_POS 1
#define TYPE_ANG 2
#define TYPE_PWM 3
#define NO_GOAL -1

struct goal{
	int type;
	float data_1; //	x	angle	pwmL
	float data_2; //	y	.	pwmR
	float data_3; //	d_rest	.	duree
	int ID;
	bool isReached;
	struct goal *next; //Chaque goal contient un pointeur vers le goal suivant;
};
	
class Fifo{
	public:
	int pushGoal(int ID, int p_type, float p_data_1 = 0, float p_data_2 = 0, float p_data_3 = 0);
	void killGoal(int ID);
	void clearGoals();
	struct goal gotoNext(); //Va au goal suivant et le renvoit
	void pushIsReached(); //Set le flag isReached du current goal

	struct goal getCurrentGoal(); //Renvoie le current goal
	struct goal getNextGoal(); //renvoit le prochain goal
	int getRemainingGoals(); //Renvoie le nombre de goals restant
	bool isPaused();//true si en paus,e false sinon

	void pause();//met en pause
	void resume();//arrete la pause

	Fifo(); //Constructeur
	private:
	bool paused;
	struct goal *current_goal;
	struct goal *last_goal;
	int nbrGoals;
	int maxGoals;
};

#endif
