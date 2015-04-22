/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 29/11/13			*
 ****************************************/
#ifndef PARAMETERS_H
#define PARAMETERS_H

#define BAUDRATE 57600
#define SERIAL_TYPE SERIAL_8N1
#define ARDUINO_ID "A"

/* Simple ou Double ou Quadruple evaluation ? 
 * La quadruple evaluation utilise 4 interruption par tick
 * (une pour chaque changement de valeur des fils A et B)
 *
 * La double evaluation utilise 2 interruptions par tick
 * (une pour chaque changement de valeur du fil A
 *
 * La simple evaluation utilise 1 interruption par tick
 * (front montant du fil A)
 *
 * Ces trois méthodes sont equivalentes
 * La quadruple evaluation est plus précise mais utilise
 * plus de puissance processeur
 * Il convient de tester la plus adapté selon le processeur
 * et le nombre de ticks du codeur 
 * 
 * OPTIONS : '1' - '2 - '4' */

#define ENCODER_EVAL 1

#define HZ 100
#define DT (1.0/HZ)
#define MAX_COM_TIME 0.001 // s

#define SPD_MAX 1
#define ACC_MAX 500 //consigne*s-2
#define RATIO_ROT_SPD_MAX 0.8
#define K_DISTANCE_REDUCTION 10 // réduction de la vitesse linéaire quand on tourne

#define ENC_RESOLUTION 1024 //resolution du codeur

#define ENC_LEFT_RADIUS 36.15 //REGLE PAR TEST - rayon de la roue codeuse
#define ENC_RIGHT_RADIUS 36.15 //REGLE PAR TEST - rayon de la roue codeuse
#define ENTRAXE_ENC 323.85 //REGLE PAR TES - Distance entre chaque roue codeuse en mm

#define ERROR_ANGLE 0.02 //erreur en angle(radians) maximale pour considérer l'objectif comme atteint
#define ERROR_POS 10 // erreur en position (mm)  maximale pour considérer l'objectif comme atteint

#define CONE_ALIGNEMENT 2.09 //120deg


#define LEFT_P 0.004
#define LEFT_I 0.004
#define LEFT_D 0
#define LEFT_BIAS 0

#define RIGHT_P 0.004
#define RIGHT_I 0.004 
#define RIGHT_D 0
#define RIGHT_BIAS 0

#define TIME_BETWEEN_ORDERS 500

//DEFINES ARDUINO
#define SERIAL_MAIN Serial

/*****************************************
 *            PRIVATE                    *
 *****************************************/
#if ENCODER_EVAL == 4
	#define TICKS_PER_TURN (ENC_RESOLUTION * 4)
#elif ENCODER_EVAL == 2
	#define TICKS_PER_TURN (ENC_RESOLUTION * 2)
#elif ENCODER_EVAL == 1
	#define TICKS_PER_TURN ENC_RESOLUTION
#endif
#endif
