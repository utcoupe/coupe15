/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13			*
 ****************************************/
#ifndef GOALS_H
#define GOALS_H

#include "parameters.h"
#define MAX_GOALS 15 //nombre max de goals dans la file, évite surcharge mémoire

#define TYPE_POS 1
#define TYPE_ANG 2
#define TYPE_PWM 3
#define NO_GOAL -1
#define STRUCT_NO_GOAL {0,0,0,NO_GOAL,0,0}

typedef struct goal {
	float data_1; //	x	angle	pwmL
	float data_2; //	y	.	pwmR
	float data_3; //	d_rest	.	duree
	int type;
	int ID;
	char is_reached;
} goal_t;

typedef struct fifo {
	goal_t fifo[MAX_GOALS];
	int nb_goals;
	int current_goal;
	int last_goal;

} fifo_t;

extern fifo_t fifo;
void FifoInit();
int FifoPushGoal(int ID, int type, float data_1, float data_2, float data_3);
goal_t* FifoCurrentGoal();
goal_t* FifoNextGoal();
inline void FifoClearGoals() { FifoInit(); }

#endif
