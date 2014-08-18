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
  
  initOrders();
}

void readPackets() {
  uint8_t i;
  uint8_t* data = 0;
  uint8_t length = 0;
  uint8_t address = 0;
  uint8_t id = 0;
  uint8_t type = 0;
  uint8_t* params = 0;

  /** Lecture du paquet en attente **/
 
  xbee.readPacket();

  if (xbee.getResponse().getApiId() == RX_16_RESPONSE) {
    #ifdef DEBUG
      Serial.println("### Reading packet");
    #endif
    xbee.getResponse().getRx16Response(rx16);
    
    length = rx16.getDataLength();
    data = rx16.getData();

    if(length < 3) {
      #ifdef DEBUG
        Serial.println("Invalid packet, three or more bytes needed.");
      #endif
      return;
    }

    address = data[0];
    type = data[1];
    id = data[2];
    length -= 3;
    params = (uint8_t*) malloc(length * sizeof(uint8_t));
    for(i = 0; i < length; i++) {
        params[i] = data[i+3];
    }

    #ifdef DEBUG
      Serial.println("[Packet]");
      Serial.print("address:");
      Serial.println(address);
      Serial.print("type:");
      Serial.println(type);
      Serial.print("id:");
      Serial.println(id);
      Serial.print("length:");
      Serial.println(length);

      for(i = 0; i < length; i++) {
        Serial.print("[");
        Serial.print(i);
        Serial.print("] ");
        Serial.println(params[i]);
      }
    #endif
    
    /** Traitement du paquet **/
    #ifdef DEBUG
      Serial.println("### Computing packet");
    #endif
    
    // Envoi ACK TODO
    
    if(address != ADDRESS_ARDUINO) {
      #ifdef DEBUG
        Serial.print("Packet sent to another one (destination= ");
        Serial.print(address);
        Serial.print(", address Arduino=");
        Serial.print(ADDRESS_ARDUINO);
        Serial.println(")");
      #endif
    }
    else {
      #ifdef DEBUG
        Serial.print("Number of order detected parameters: ");
        Serial.println(orders[type]);
      #endif
    }
  }
  else {
    #ifdef INFO
      Serial.println("No packet available");
    #endif
  }
  
}

void loop() {
  #ifdef INFO
    Serial.println("###### Begin of main loop ######");
  #endif
  
  readPackets();
  delay(1000);
}
