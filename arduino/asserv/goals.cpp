/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13      		*
 ****************************************/
#include "goals.h"

fifo_t fifo;

void FifoInit() {
	int i;
	fifo.nb_goals = 0;
	fifo.current_goal = 0;
	fifo.last_goal = -1;
	for (i=0; i<MAX_GOALS; i++) {
		fifo.fifo[i].type = NO_GOAL;
	}
}

int FifoPushGoal(int ID, int type, float data_1, float data_2, float data_3) {
	goal_t *new_goal;
	if (fifo.nb_goals >= MAX_GOALS) {
		return -1;
	}

	fifo.last_goal = (fifo.last_goal + 1) % MAX_GOALS;
	new_goal = &fifo.fifo[fifo.last_goal];

	new_goal->type = type;
	new_goal->data_1 = data_1;
	new_goal->data_2 = data_2;
	new_goal->data_3 = data_3;
	new_goal->ID = ID;
	new_goal->is_reached = 0;

	fifo.nb_goals++;
	return 0;

}

goal_t* FifoCurrentGoal() {
	return &fifo.fifo[fifo.current_goal];
}

goal_t* FifoNextGoal() {
	goal_t *current_goal = FifoCurrentGoal();
	if (current_goal->type != NO_GOAL) {
		current_goal->type = NO_GOAL;
		fifo.current_goal = (fifo.current_goal + 1) % MAX_GOALS;
		fifo.nb_goals--;
	}
	return FifoCurrentGoal();
}
