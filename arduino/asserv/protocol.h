#ifndef PROTOCOL_H
#define PROTOCOL_H

// 	COMMANDS :
// 'ordre;id;arg1;arg2;argn'
//  For example :
// 'GOTOA;3;120;1789;31400'
// 'GET_CODER;0;'
// issues the order GOTOA with
// ID 3 to X=120, Y=1789 and angle = 3.14
//
// WARNING : order should be
//  ONE ascii char long
//
//  float are transmitted as integer
//  therefore any number refered as 
//  "decimal" is actually an int
//  multiplied by FLOAT_PRECISION

// BEGIN_ORDERS - Do not remove this comment
#define	GOTOA 		'c' 	// x(int);y(int);a(decimal) - (mm and radian)
#define	GOTO 		'd' 	// x(int);y(int) - (mm)
#define	ROT 		'e' 	// a(decimal) - (radian)
#define	KILLG 		'f' 	// no args, go to next order
#define	CLEANG 		'g' 	// no args, cancel all orders
#define	PIDLEFT		'h' 	// p(decimal);i(decimal);d(decimal) - set left PID
#define	PIDRIGHT	'i' 	// p(decimal);i(decimal);d(decimal) - set right PID
#define PIDALL 		'u' 	// p(decimal);i(decimal);d(decimal) - set both PID
#define	GET_CODER 	'j' 	// no args, response : l(long);r(long)
#define	PWM 		'k' 	// l(int);r(int);duration(int) - set left and right pwm for duration ms
#define	ACCMAX 		'l' 	// a(int),r(decimal) - set max acceleration (mm/s-2) and rotation ratio
#define	SPDMAX 		'x' 	// a(int),r(decimal) - set max acceleration (mm/s-2) and rotation ratio
#define	SET_POS		'm' 	// x(int);y(int);a(decimal) - set pos (mm / radians)
#define	GET_POS		'n' 	// no args, response : x(int);y(int);a(decimal) - get current pos (mm and radians)
#define GET_SPD 	'y' 	// no args, respond : l(int);r(int) - get wheels speed (mm/s)
#define GET_TARGET_SPD 	'v' 	// no args, respond : l(int);r(int) - get target wheels speed (mm/s)
#define	GET_POS_ID 	'o'		// no args, response : x(int);y(int);a(decimal);id(int) - get current pos and last id (mm and radians)
#define GET_LAST_ID	't' 	// no args, response : id(int)
#define	PAUSE 		'q' 	// no args, pauses control
#define	RESUME 		'r'		// no args, resumes control
#define RESET_ID 	's' 	// no args, reset last finished id to 0
#define PINGPING 	'z'		// no args, switch led state
#define WHOAMI 		'w' 	// no args, answers 'ASSERV' or 'PAP'
// END_ORDERS - Do not remove this comment

#define FLOAT_PRECISION 1000.0
#define FAILED_MSG "FAILED\n"
#define MAX_COMMAND_LEN 60
#define MAX_ID_LEN 10
#define ID_START_INDEX 2
#define MAX_RESPONSE_LEN 50

#ifdef __cplusplus
extern "C" int ProtocolExecuteCmd(char data);
extern "C" void ProtocolAutoSendStatus(void);
#else
void ProtocolAutoSendStatus(void);
int ProtocolExecuteCmd(char data);
#endif

#endif
