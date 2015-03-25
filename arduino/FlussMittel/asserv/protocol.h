#ifndef PROTOCOL_H
#define PROTOCOL_H

#define	PINGPING_AUTO 'a'
#define	PINGPING 'b'
#define	GOTOA 'c'
#define	GOTO 'd'
#define	ROT 'e'
#define	KILLG 'f'
#define	CLEANG 'g'
#define	PIDA 'h'
#define	PIDD 'i'
#define	GET_CODER 'j'
#define	PWM 'k'
#define	ACCMAX 'l'
#define	SET_POS 'm'
#define	GET_POS 'n'
#define	GET_POS_ID 'o'
#define GET_LAST_ID 't'
#define	IS_BLOCKED 'p'
#define	PAUSE 'q'
#define	RESUME 'r'
#define	RESET_ID 's'

void executeCmd(char data);

#endif
