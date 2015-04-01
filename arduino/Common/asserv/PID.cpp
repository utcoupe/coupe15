/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 13/10/13			*
 ****************************************/
#include "PID.h"
#include "Arduino.h"

PID::PID(float n_P, float n_I, float n_D, float n_error_use_I, float n_bias){
	setErrorUseI(n_error_use_I);
	setPID(n_P,n_I,n_D);
	setBias(n_bias);
	reset();
	
}

void PID::setErrorUseI(float I) {
	error_use_I = I;
}

void PID::setPID(float n_P, float n_I, float n_D){
	if(n_P == 0 || n_I < 0 || n_D < 0)
		return; //Controle de PID correct
	P = n_P;
	I = n_I;
	D = n_D;
}

void PID::setBias(float n_bias){
	bias = n_bias;
}

void PID::reset(){
	last_error = 0;//ici, on va créer une premire dérivée trop grande, ce sera corrigé à l'initialisation du compute
	error_I = 0;
	output = 0;
	initDone = false;
}

float PID::compute(float error){
	float error_D;

	if(!initDone){ //Lors du premier compute, on ne tient pas compte de I et D
		error_I = 0;
		error_D = 0;
		initDone = true;	
	}
	else{
		error_D = (error - last_error); //derivée = deltaErreur/dt - dt est la période de compute
		if (error_use_I == 0 || abs(error) < error_use_I) {
			error_I += error; //integrale = somme(erreur*dt) - dt est la période de compute
		}
	}
	
	output = bias + (P*error) + (I*error_I) + (D*error_D); //calcul de la sortie avec le PID

	last_error = error;

	return output;
}

float PID::getOutput(){
	return output;
}
