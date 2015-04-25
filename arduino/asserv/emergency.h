#ifndef EMERGENCY_H
#define EMERGENCY_H

#define EMERGENCY_WAIT_TIME 10 // seconds
#define EMERGENCY_SLOW_GO_RATIO 0.3 // spd = 0.3*max_spd in slow_go mode

typedef enum emergency_phase {
	NO_EMERGENCY,
	FIRST_STOP,
	SLOW_GO
} emergency_phase_t;

typedef struct emergency_status {
	float old_max_spd;
	long start_time;
	emergency_phase_t phase;
} emergency_status_t;

#ifdef __cplusplus
extern "C" void ComputeEmergency(void);
#else
void ComputeEmergency(void);
#endif

#endif
