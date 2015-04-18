/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 15/04/15			*
 ****************************************/

#include "parameters.h"
#include "PID.h"
#include "Arduino.h"

void PIDInit(PID_t *pid) {
	pid->P = 0;
	pid->I = 0;
	pid->D = 0;
	pid->bias = 0;
	pid->error_sum = 0;
	pid->last_error = 0;
	pid->init_done = 0;
}

void PIDReset(PID_t *pid) {
	pid->error_sum = 0;
	pid->last_error = 0;
	pid->init_done = 0;
}

void PIDSet(PID_t *pid, float P, float I, float D, float bias) {
		I /= FREQ;
		D *= FREQ;
		pid->P = P;
		pid->I = I;
		pid->D = D;
		pid->bias = bias;
}

float PIDCompute(PID_t *pid, float error) {
	float error_D;

	if(!pid->init_done){ 
		//Lors du premier compute, on ne tient pas compte de D
		error_D = 0;
		pid->init_done = 1;	
	} else {
		//derivée = deltaErreur/dt - dt est la période de compute
		error_D = (error - pid->last_error); 
	}

	pid->error_sum += error;
	pid->last_error = error;
	
        //calcul de la sortie avec le PID
	pid->output = pid->bias + (pid->P*error) + 
		(pid->I*pid->error_sum) + (pid->D*error_D);

	return pid->output;
}
