/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13      		*
 ****************************************/
#include "goals.h"

/********************************************************
 * 							*
 * 		      CLASSE FIFO			*
 *							*
 ********************************************************/
Fifo::Fifo(){
	nbrGoals = 0;
	current_goal = 0;
	last_goal = 0;
	paused = false;
	maxGoals = MAX_GOALS;
}

int Fifo::pushGoal(int ID, int p_type, float p_data_1, float p_data_2, float p_data_3){
	if(nbrGoals >= maxGoals)
		return -1; //si on est deja au max de goals, return -1

	struct goal *new_goal = new struct goal;
	if(new_goal == 0)
		return -1; //renvoit -1 si alloc fail

	new_goal->type = p_type;
	new_goal->data_1 = p_data_1;
	new_goal->data_2 = p_data_2;
	new_goal->data_3 = p_data_3;
	new_goal->ID = ID;
	new_goal->isReached = false;
	new_goal->next = 0;

	if(current_goal != 0){
		last_goal->next = new_goal;
		last_goal = new_goal;
	}
	else
		current_goal = last_goal = new_goal;

	nbrGoals++;//Un goal de plus !
	return 0;
}

struct goal Fifo::gotoNext(){
	if(current_goal != 0){
		if(current_goal == last_goal)//Si un seul goal, il faut aussi supprimer le dernier
			last_goal = 0;

		struct goal *deleted_goal = current_goal;
		current_goal = current_goal->next;
		delete deleted_goal;
		nbrGoals--;
	}
	return Fifo::getCurrentGoal();
}

void Fifo::killGoal(int ID){
	if(current_goal != 0){
		struct goal *seek_goal, *deleted_goal;

		seek_goal = current_goal;

		while(seek_goal->next != 0){ //on passe tout les goals a partir du deuxieme en revue
			if(seek_goal->next->ID == ID){ //et on supprime les bons ID
				deleted_goal = seek_goal->next;
				seek_goal->next = deleted_goal->next;

				if(deleted_goal == last_goal)//Si dernier, goal, traiter le cas
					last_goal = seek_goal;

				delete deleted_goal;
				nbrGoals--;
			}
			else
				seek_goal = seek_goal->next;
		}
		
		if(current_goal->ID == ID) //puis on s'occupe du premier
			gotoNext();
	}
}

void Fifo::clearGoals(){
	while(current_goal != 0)
		gotoNext();
}

void Fifo::pushIsReached(){
	if(current_goal != 0)
		current_goal->isReached = true;
}

int Fifo::getRemainingGoals(){
	return nbrGoals;
}

struct goal Fifo::getCurrentGoal(){
	if(current_goal == 0){
		struct goal no_goal;
		no_goal.type = NO_GOAL;
		return no_goal;
	}
	else
		return *current_goal;
}

struct goal Fifo::getNextGoal() {
	if(current_goal == 0){
		struct goal no_goal;
		no_goal.type = NO_GOAL;
		return no_goal;
	}
	else if (current_goal->next == 0) {
		struct goal no_goal;
		no_goal.type = NO_GOAL;
		return no_goal;
	}
	else {
		return *(current_goal->next);
	}
}

bool Fifo::isPaused(){
	return paused;
}

void Fifo::pause(){
	paused = true;
}

void Fifo::resume(){
	paused = false;
}
