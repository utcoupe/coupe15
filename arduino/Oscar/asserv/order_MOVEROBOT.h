/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ communication_xbee.h
  └────────────────────

  Contain all prototypes of communication_xbee.ino

  Author(s)
    - Alexis Schad : schadoc_alex@hotmail.fr
*/

#ifndef ORDER_MOVEROBOT_H
#define ORDER_MOVEROBOT_H

#include "AFMotor.h"

#define NO_PWM 0

void set_pwm_right(int pwm);
void set_pwm_left(int pwm);

#endif
