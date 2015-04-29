#include <AFMotor.h> // AdaFruit Motor shield lib
#include <Servo.h>
#include "orders.h"
#include "constants.h"
Servo servo;
AF_Stepper motor1(MOTOR_STEP_PER_REVOLUTION, 1); // M1 & M2



void setup() {
	motor1.setSpeed(MOTOR_SPEED);

	Serial.begin(SERIAL_BAUDRATE);
	Serial.write(ID_ARDUINO);
}

char order = 0;

void loop() {
        servo.write(170);
	if (Serial.available() > 0) {
		// read the incoming byte:
		order = Serial.read();

		switch(order) {
			case ELEV_MOVE_UP:
				motor1.step(MOTOR_STEP_TO_SWITCH, MOTOR_DIR_UP, DOUBLE);
				Serial.write(ORDER_ACHIEVED);
			break;
			case ELEV_MOVE_DOWN:
				motor1.step(MOTOR_STEP_TO_SWITCH, MOTOR_DIR_DOWN, DOUBLE);
				Serial.write(ORDER_ACHIEVED);
			break;
			case ELEV_RELEASE:
				motor1.release();
				Serial.write(ORDER_ACHIEVED);
			break;
			default:
				Serial.write(ORDER_UNKNOWN);
		}
	}
	delay(10);
}
