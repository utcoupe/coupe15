/****************************************
 * Author : Quentin C			*
 * Mail : quentin.chateau@gmail.com	*
 * Date : 18/04/15			*
 ****************************************/
#ifndef ENCODER_H
#define ENCODER_H

#include "parameters.h"

extern volatile long left_ticks;
extern volatile long right_ticks;

void left_encoder_reset(void);
void right_encoder_reset(void);

inline void encoders_reset(void) {
	left_encoder_reset();
	right_encoder_reset();
}

void leftInterruptA(void);
void rightInterruptA(void);
#if ENCODER_EVAL == 4
void leftInterruptB(void);
void rightInterruptB(void);
#endif

#endif
