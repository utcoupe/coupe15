#include <AFMotor.h> // AdaFruit Motor shield lib
#include "orders.h"
#include "constants.h"

AF_Stepper motor1(MOTORS_STEP_PER_REVOLUTION, 1); // M1 & M2
AF_Stepper motor2(MOTORS_STEP_PER_REVOLUTION, 2); // M3 & M4

void setup() {
	motor1.setSpeed(MOTORS_SPEED);
	motor2.setSpeed(MOTORS_SPEED);

	Serial.begin(SERIAL_BAUDRATE);
	Serial.write(ID_ARDUINO);
}

char order = 0;

void loop() {
	if (Serial.available() > 0) {
		// read the incoming byte:
		order = Serial.read();

		switch(order) {
			case ELEV1_MOVE_UP:
				motor1.step(MOTORS_STEP_TO_SWITCH, MOTOR1_DIR_UP, DOUBLE);
				Serial.write(ORDER_ACHIEVED);
			break;
			case ELEV1_MOVE_DOWN:
				motor1.step(MOTORS_STEP_TO_SWITCH, MOTOR1_DIR_DOWN, DOUBLE);
				Serial.write(ORDER_ACHIEVED);
			break;
			case ELEV1_RELEASE:
				motor1.release();
				Serial.write(ORDER_ACHIEVED);
			break;
			case ELEV2_MOVE_UP:
				motor2.step(MOTORS_STEP_TO_SWITCH, MOTOR2_DIR_UP, DOUBLE);
				Serial.write(ORDER_ACHIEVED);
			break;
			case ELEV2_MOVE_DOWN:
				motor2.step(MOTORS_STEP_TO_SWITCH, MOTOR2_DIR_DOWN, DOUBLE);
				Serial.write(ORDER_ACHIEVED);
			break;
			case ELEV2_RELEASE:
				motor2.release();
				Serial.write(ORDER_ACHIEVED);
			break;
			default:
				Serial.write(ORDER_UNKNOWN);
		}
	}
	delay(10);
}
