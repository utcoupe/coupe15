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

// Variables
XBee xbee = XBee();
Rx16Response rx16 = Rx16Response();
uint8_t* data = 0;
uint8_t length = 0;

void setup() {
    Serial1.begin(BAUDRATE_XBEE);
    xbee.setSerial(Serial1);

    // DEBUG
    Serial.begin(9600);
}

void loop() {
    xbee.readPacket();
    int i;

    if (xbee.getResponse().getApiId() == RX_16_RESPONSE) {
        xbee.getResponse().getRx16Response(rx16);
        
        data = rx16.getData();
        length = rx16.getDataLength();
        Serial.print("length:");
        Serial.println(length);
        
        for(i = 0; i < length; i++) {
            Serial.println(data[i]);
        }
        Serial.println("");
    }

    delay(1000);
}
