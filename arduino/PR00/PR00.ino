/*
	╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
	║ ║ ║ ║  │ ││ │├─┘├┤ 
	╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
	│ PR00.ino
	└────────────────────

	Main file of Arduino board inside PR00

	Author(s)
		- Alexis Schad : schadoc_alex@hotmail.fr
*/

#include <XBee.h>
#include "constants.h"
#include "orders.h"

typedef struct packet {
	uint8_t id;
	uint8_t type;
	uint8_t length;
	uint8_t* data;

	packet* next;
} Packet;


// Variables
XBee xbee = XBee();
Rx16Response rx16 = Rx16Response();
uint8_t* data = 0;
uint8_t length = 0;

Packet* packet_buffer_head = NULL;
Packet* packet_buffer_end = NULL;

void setup() {
	Serial1.begin(BAUDRATE_XBEE);
	xbee.setSerial(Serial1);

	#ifdef DEBUG
		Serial.begin(BAUDRATE_USB);
	#endif
}

void readPackets() {
	int i;
	Packet* new_packet;

	xbee.readPacket();

	if (xbee.getResponse().getApiId() == RX_16_RESPONSE) {
		xbee.getResponse().getRx16Response(rx16);
		
		length = rx16.getDataLength();
		data = rx16.getData();

		if(length < 2) {
			#ifdef DEBUG
				Serial.println("Packet invalide, au moins deux octets attendus.");
			#endif
			return;
		}

		new_packet->id = data[1];
		new_packet->type = data[0];

		// Send ACK Order TODO
		
		#ifdef DEBUG
			Serial.print("length:");
			Serial.println(length);
			for(i = 0; i < length; i++) {
				Serial.print("[");
				Serial.print(i);
				Serial.print("] ");
				Serial.println(data[i]);
			}
			Serial.println("");
		#endif
	}

}

void loop() {
	readPackets();
	delay(1000);
}
