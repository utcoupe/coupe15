#include "emergency.h"
#include "pins.h"
#include "control.h"
#include "compat.h"
#include "parameters.h"
#include "Arduino.h"

emergency_status_t emergency_status = {.phase = NO_EMERGENCY};

void ComputeEmergency(void) {
#if USE_SHARP
	float analog, distance, voltage;
	long now;
	now = timeMillis();
	analog = analogRead(PIN_SHARP);
	voltage = 5.0*analog/1023.0;
	if (voltage == 0) {
		distance = 1000;
	} else {
		distance = 0.123/voltage;
	}
	switch (emergency_status.phase) {
		case NO_EMERGENCY:
			if (distance < EMERGENCY_STOP_DISTANCE) {
				if (emergency_status.start_detection_time < 0) {
					emergency_status.start_detection_time = now;
				} else if (now - emergency_status.start_detection_time > 300) {
					emergency_status.start_time = now;
					emergency_status.start_detection_time = -1;
					emergency_status.phase = FIRST_STOP;
					ControlSetStop(EMERGENCY_BIT);
				}
			}
			break;
		case FIRST_STOP:
			if (distance > EMERGENCY_STOP_DISTANCE) {
				emergency_status.phase = NO_EMERGENCY;
				ControlUnsetStop(EMERGENCY_BIT);
			}
			if ((now - emergency_status.start_time) > (EMERGENCY_WAIT_TIME*1000)) {
				emergency_status.phase = SLOW_GO;
				emergency_status.old_max_spd = control.max_spd;
				control.max_spd *= EMERGENCY_SLOW_GO_RATIO;
				ControlUnsetStop(EMERGENCY_BIT);
			}
			break;
		case SLOW_GO:
			if (distance > EMERGENCY_STOP_DISTANCE) {
				emergency_status.phase = NO_EMERGENCY;
				control.max_spd = emergency_status.old_max_spd;
				ControlUnsetStop(EMERGENCY_BIT);
			}
			break;
	}
#endif
}
