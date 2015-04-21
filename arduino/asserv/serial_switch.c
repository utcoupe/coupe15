/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 18/12/13			*
 ****************************************/

#include <stdio.h>
#include "serial_switch.h"
#include "robotstate.h"
#include "protocol.h"
#include "control.h"
#include "encoder.h"
#include "compat.h"
#include "pins.h"
#include "goals.h"

//La fonction renvoit le nombre d'octet dans ret, chaine de caractère de réponse. Si doublon, ne pas executer d'ordre mais renvoyer les données à renvoyer
int switchOrdre(char ordre, int id, char *argv, char *ret, int *ret_size){ 
	*ret_size = 0;
	switch(ordre){
	case PINGPING:
		digitalWrite(LED_DEBUG, HIGH);
		delay(1);
		digitalWrite(LED_DEBUG, LOW);
		break;
	case GET_CODER:
		*ret_size = sprintf(ret, "%li;%li", left_ticks, right_ticks);
		break;
	case GOTO: {
		int x, y;
		sscanf(argv, "%i;%i", &x, &y);
		FifoPushGoal(id, TYPE_POS, POS_DATA(x, y));
		}
		break;
	case GOTOA: {
		int x, y, a_int;
		float a;
		sscanf(argv, "%i;%i;%i", &x, &y, &a_int);
		a = a_int / FLOAT_PRECISION;
		FifoPushGoal(id, TYPE_POS, POS_DATA(x,y));
		FifoPushGoal(id, TYPE_ANG, ANG_DATA(a));
		}
		break;
	case ROT: {
		int a_int;
		float a;
		sscanf(argv, "%i", &a_int);
		a = a_int / FLOAT_PRECISION;
		FifoPushGoal(id, TYPE_ANG, ANG_DATA(a));
		}
		break;
	case PWM:{
		int l, r, t;
		sscanf(argv, "%i;%i;%i", &l, &r, &t);
		FifoPushGoal(id, TYPE_PWM, PWM_DATA(l, r, t));
		}
		break;
	case PIDALL:
	case PIDRIGHT:
	case PIDLEFT:{
		int p_int, i_int, d_int;
		float p, i, d;
		sscanf(argv, "%i;%i;%i", &p_int, &i_int, &d_int);
		p = p_int / FLOAT_PRECISION;
		i = i_int / FLOAT_PRECISION;
		d = d_int / FLOAT_PRECISION;
		if (ordre == PIDLEFT) 
			PIDSet(&PID_left, p, i, d, LEFT_BIAS);
		else if (ordre == PIDRIGHT)
			PIDSet(&PID_right, p, i, d, RIGHT_BIAS);
		else {
			PIDSet(&PID_left, p, i, d, LEFT_BIAS);
			PIDSet(&PID_right, p, i, d, RIGHT_BIAS);
		}
		}
		break;
	case KILLG:
		FifoNextGoal();
		ControlPrepareNewGoal();
		break;
	case CLEANG:{
		FifoClearGoals();
		ControlPrepareNewGoal();
		FifoPushGoal(0, TYPE_POS, POS_DATA(current_pos.x, current_pos.y));
		}
		break;
	case RESET_ID:
		control.last_finished_id = 0;
		break;
	case SET_POS:{
		int x, y, a_int;
		float angle;
		sscanf(argv, "%i;%i;%i", &x, &y, &a_int);
		angle = a_int / FLOAT_PRECISION;
		RobotStateSetPos(x, y, angle);
		}
		break;
	case GET_POS:{
		int x, y, a_int;
		float a;
		a = current_pos.angle;
	       	x = round(current_pos.x);
		y = round(current_pos.y);
		a_int = a * FLOAT_PRECISION;
		*ret_size = sprintf(ret, "%i;%i;%i", x, y, a_int);
		}
		break;
	case GET_POS_ID:{
		int x, y, a_int;
		float a;
		a = current_pos.angle;
	       	x = round(current_pos.x);
		y = round(current_pos.y);
		a_int = a * FLOAT_PRECISION;
		*ret_size = sprintf(ret, "%i;%i;%i;%i", x, y, a_int, control.last_finished_id);
		break;
		}
	case ACCMAX:{
		int a_int, r_int;
		float a, r;
		sscanf(argv, "%i;%i", &a_int, &r_int);
		a = a_int / FLOAT_PRECISION;
		r = r_int / FLOAT_PRECISION;
		control.max_acc = a;
		control.rot_spd_ratio = r;
		}
		break;
	case GET_LAST_ID: {
		*ret_size = sprintf(ret, "%i", control.last_finished_id);
		break;
		}
	case PAUSE: 
		control.paused = 1;
		break;
	case RESUME:
		control.paused = 0;
		break;
	case WHOAMI:
		*ret_size = sprintf(ret, ARDUINO_ID);
		break;
	default:
		return -1;//commande inconnue
	}
	return 0;
}
