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

// Variables
XBee xbee = XBee();
Rx16Response rx16 = Rx16Response();

void setup() {
  Serial1.begin(BAUDRATE_XBEE);
  xbee.setSerial(Serial1);

  #ifdef DEBUG
    Serial.begin(BAUDRATE_USB);
  #endif
}

void loopOrder() {
  uint8_t i;
  uint8_t* data = 0;
  uint8_t length = 0;
  uint8_t address = 0;
  uint8_t id = 0;
  uint8_t type = 0;
  uint8_t* params = 0;

  xbee.readPacket();

  if (xbee.getResponse().getApiId() == RX_16_RESPONSE) {
    xbee.getResponse().getRx16Response(rx16);
    
    length = rx16.getDataLength();
    data = rx16.getData();

    if(length < 3) {
      #ifdef DEBUG
        Serial.println("Packet invalide, au moins trois octets attendus.");
      #endif
      return;
    }

    address = data[0];
    id = data[1];
    type = data[2];
    length -= 3;
    params = (uint8_t*) malloc(length * sizeof(uint8_t));
    for(i = 0; i < length; i++) {
        params[i] = data[i+3];
    }

    #ifdef DEBUG
      Serial.println("[Packet]");
      Serial.print("address:");
      Serial.println(address);
      Serial.print("id:");
      Serial.println(id);
      Serial.print("type:");
      Serial.println(type);
      Serial.print("length:");
      Serial.println(length);

      for(i = 0; i < length; i++) {
        Serial.print("[");
        Serial.print(i);
        Serial.print("] ");
        Serial.println(params[i]);
      }
      Serial.println("");
    #endif
  }

}

void loop() {
  loopOrder();
  delay(1000);
}
