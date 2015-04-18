/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 18/12/13			*
 ****************************************/
#include "serial_switch.h"
#include "robotstate.h"
#include "protocol.h"
#include "control.h"
#include "encoder.h"
#include "compat.h"
#include "pins.h"

extern Control control;

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
		FifoPushGoal(id, TYPE_POS, x, y, 0);
		}
		break;
	case GOTOA: {
		int x, y, a_int;
		float a;
		sscanf(argv, "%i;%i;%i", &x, &y, &a_int);
		a = a_int / FLOAT_PRECISION;
		FifoPushGoal(id, TYPE_POS, x, y, 0);
		FifoPushGoal(id, TYPE_ANG, a, 0, 0);
		}
		break;
	case ROT: {
		int a_int;
		float a;
		sscanf(argv, "%i", &a_int);
		a = a_int / FLOAT_PRECISION;
		FifoPushGoal(id, TYPE_ANG, a, 0, 0);
		}
		break;
	case PWM:{
		int l, r, t;
		sscanf(argv, "%i;%i;%i", &l, &r, &t);
		FifoPushGoal(id, TYPE_PWM, l, r, t);
		}
		break;
	case PIDA:{
		int p_int, i_int, d_int;
		float p, i, d;
		sscanf(argv, "%i;%i;%i", &p_int, &i_int, &d_int);
		p = p_int / FLOAT_PRECISION;
		i = i_int / FLOAT_PRECISION;
		d = d_int / FLOAT_PRECISION;
		PIDSet(&PID_angle, p, i, d, ANG_BIAS);
		}
		break;
	case PIDD: {
		int p_int, i_int, d_int;
		float p, i, d;
		p = p_int / FLOAT_PRECISION;
		i = i_int / FLOAT_PRECISION;
		d = d_int / FLOAT_PRECISION;
		sscanf(argv, "%i;%i;%i", &p_int, &i_int, &d_int);
		PIDSet(&PID_distance, p, i, d, DIS_BIAS);
		}
		break;
	case KILLG:
		FifoNextGoal();
		break;
	case CLEANG:{
		FifoClearGoals();
		FifoPushGoal(0, TYPE_POS, current_pos.x, current_pos.y, 0);
		}
		break;
	case RESET_ID:
		control.resetLastFinishedId();
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
		*ret_size = sprintf(ret, "%i;%i;%i;%i", x, y, a_int, control.getLastFinishedId());
		break;
		}
	case ACCMAX:{
		int a_int, r_int;
		float a, r;
		sscanf(argv, "%i;%i", &a_int, &r_int);
		a = a_int / FLOAT_PRECISION;
		r = r_int / FLOAT_PRECISION;
		control.setMaxAcc(a);
		control.setMaxRotSpdRatio(r);
		}
		break;
	case GET_LAST_ID: {
		*ret_size = sprintf(ret, "%i", control.getLastFinishedId());
		break;
		}
	case PAUSE: 
		control.pause();
		break;
	case RESUME:
		control.resume();
		break;
	case WHOAMI:
		*ret_size = sprintf(ret, ARDUINO_ID);
		break;
	default:
		return -1;//commande inconnue
	}
	return 0;
}
