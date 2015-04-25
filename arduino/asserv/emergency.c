#include "emergency.h"
#include "pins.h"
#include "control.h"
#include "compat.h"
#include "parameters.h"
#include "Arduino.h"

emergency_status_t emergency_status = {.phase = NO_EMERGENCY};

void ComputeEmergency(void) {
#if USE_SHARP
	float analog, distance;
	analog = analogRead(PIN_SHARP);
	distance = 151.25*pow(analog,-1.19);
	switch (emergency_status.phase) {
		case NO_EMERGENCY:
			if (distance > 0 && distance < EMERGENCY_STOP_DISTANCE) {
				emergency_status.start_time = timeMillis();
				emergency_status.phase = FIRST_STOP;
				ControlSetStop(EMERGENCY_BIT);
			}
			break;
		case FIRST_STOP:
			if (distance > EMERGENCY_STOP_DISTANCE || distance == 0) {
				emergency_status.phase = NO_EMERGENCY;
				ControlUnsetStop(EMERGENCY_BIT);
			}
			if ((timeMillis() - emergency_status.start_time) > (EMERGENCY_WAIT_TIME*1000)) {
				emergency_status.phase = SLOW_GO;
				emergency_status.old_max_spd = control.max_spd;
				control.max_spd *= EMERGENCY_SLOW_GO_RATIO;
				ControlUnsetStop(EMERGENCY_BIT);
			}
			break;
		case SLOW_GO:
			if (distance > EMERGENCY_STOP_DISTANCE || distance == 0) {
				emergency_status.phase = NO_EMERGENCY;
				control.max_spd = emergency_status.old_max_spd;
				ControlUnsetStop(EMERGENCY_BIT);
			}
			break;
	}
#endif
}
