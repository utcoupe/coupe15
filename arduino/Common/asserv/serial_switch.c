/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 18/12/13			*
 ****************************************/
#include "serial_switch.h"
#include "protocol.h"
#include "control.h"
#include "compat.h"

extern Control control;

//La fonction renvoit le nombre d'octet dans ret, chaine de caractère de réponse. Si doublon, ne pas executer d'ordre mais renvoyer les données à renvoyer
int switchOrdre(char ordre, int id, char *argv, char *ret, int *ret_size){ 
	*ret_size = 0;
	switch(ordre){
	case PING:
		digitalWrite(LED_DEBUG, HIGH);
		delay(1);
		digitalWrite(LED_DEBUG, LOW);
		break;
	case GET_CODER:
		*ret_size = sprintf(ret, "%li;%li", control.getLenc()->getTicks(), control.getRenc()->getTicks());
		break;
	case GOTO: {
		int x, y;
		sscanf(argv, "%i;%i", &x, &y);
		control.pushGoal(id, TYPE_POS, x, y, 0);
		}
		break;
	case GOTOA: {
		int x, y;
		float a;
		sscanf(argv, "%i;%i;%f", &x, &y, &a);
		control.pushGoal(id, TYPE_POS, x, y, 0);
		control.pushGoal(id, TYPE_ANG, a, 0, 0);
		}
		break;
	case ROT: {
		float a;
		sscanf(argv, "%f", &a);
		control.pushGoal(id, TYPE_ANG, a, 0, 0);
		}
		break;
	case PWM:{
		int l, r, t;
		sscanf(argv, "%i;%i;%i", &l, &r, &t);
		control.pushGoal(id, TYPE_PWM, l, r, t);
		}
		break;
	case PIDA:{
		float p, i, d;
		sscanf(argv, "%f;%f;%f", &p, &i, &d);
		control.setPID_angle(p, i, d);
		}
		break;
	case PIDD: {
		float p, i, d;
		sscanf(argv, "%f;%f;%f", &p, &i, &d);
		control.setPID_distance(p, i, d);
		}
		break;
	case KILLG:
		control.nextGoal();
		break;
	case CLEANG:{
		control.clearGoals();
		pos pos = control.getPos();
		control.pushGoal(0, TYPE_POS, pos.x, pos.y, 0);
		control.setIsReached();
		}
		break;
	case RESET_ID:
		control.resetLastFinishedId();
		break;
	case SET_POS:{
		pos pos;
		sscanf(argv, "%li;%li;%f", &(pos.x), &(pos.y), &(pos.angle));
		control.pushPos(pos);
		}
		break;
	case GET_POS:{
		pos pos = control.getPos();
		int x = pos.x, y = pos.y;
		float a = pos.angle;
		*ret_size = sprintf(ret, "%i;%i;%f", x, y, (double)a);
		}
		break;
	case GET_POS_ID:{
		pos pos = control.getPos();
		int x = pos.x, y = pos.y;
		float a = pos.angle;
		*ret_size = sprintf(ret, "%i;%i;%f;%i", x, y, (double)a, control.getLastFinishedId());
		break;
		}
	case ACCMAX:{
		float a, r;
		sscanf(argv, "%f;%f", &a, &r);
		control.setMaxAcc(a);
		control.setMaxRotSpdRatio(r);
		}
		break;
	case GET_LAST_ID: {
		*ret_size = sprintf(ret, "%i", control.getLastFinishedId());
		break;
		}
	case IS_BLOCKED:
		*ret_size = sprintf(ret, "%i", control.isBlocked());
		break;
	case PAUSE: 
		control.pause();
		break;
	case RESUME:
		control.resume();
		break;
/*	case ORDRE_001:
		if (!doublon) {
			//Execution des ordre
			//Les fonction btoi(), btol() et btof() aident à récupérer les arguments

			// Coder ici les actions à executer
		}
		//Formation et envoi d'une réponse
		//Les fonctions itob(), ltob() et itof() aident à formet les arguments

		//Coder ici la formation des données de retour

		break;*/
	default:
		return -1;//commande inconnue
	}
	return 0;
}
