#ifndef PROTOCOL_H
#define PROTOCOL_H

// 	COMMANDS : 		//
// 'ordre;id;arg1;arg2;argn' 	//
//  For example :
// 'GOTO;3;120;1789' 		//
// 'GET_CODER;0;'
// issues the order GOTO with 	//
// ID 3 to X=120 and Y = 1789 	//
//
// WARNING : ordre should be 	//
//  ONE ascii char long 	//

#define	GOTOA 		'c' 	// x(int);y(int);a(float) - (mm and radian)
#define	GOTO 		'd' 	// x(int);y(int) - (mm)
#define	ROT 		'e' 	// a(float) - (radian)
#define	KILLG 		'f' 	// no args, go to next order
#define	CLEANG 		'g' 	// no args, cancel all orders
#define	PIDA 		'h' 	// p(float);i(float);d(float) - set angle PID
#define	PIDD 		'i' 	// p(float);i(float);d(float) - set distance PID
#define	GET_CODER 	'j' 	// no args, response : l(long);r(long)
#define	PWM 		'k' 	// l(int);r(int);duration(int) - set left and right pwm for duration ms
#define	ACCMAX 		'l' 	// a(float) - set max acceleration (mm/s-2)
#define	SET_POS		'm' 	// x(int);y(int);a(float) - set pos (mm / radians)
#define	GET_POS		'n' 	// no args, response : x(int);y(int);a(float) - get current pos (mm and radians)
#define	GET_POS_ID 	'o'	// no args, response : x(int);y(int);a(float);id(int) - get current pos and last id (mm and radians)
#define GET_LAST_ID	't' 	// no args, response : id(int)
#define	IS_BLOCKED 	'p' 	// no args, reponse : isBlocked(int) - NOT WORKING
#define	PAUSE 		'q' 	// no args, pauses control
#define	RESUME 		'r'	// no args, resumes control
#define RESET_ID 	's' 	// no args, reset last finished id to 0
#define PINGPING 	'z'	// no args, switch led state
#define WHOAMI 		'w' 	// no args, answers 'ASSERV' or 'PAP'

#define FAILED_MSG "FAILED\n"
#define MAX_COMMAND_LEN 60
#define MAX_ID_LEN 10
#define ID_START_INDEX 2
#define MAX_RESPONSE_LEN 50

int executeCmd(char data);

#endif
