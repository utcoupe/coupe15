/*
  ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
  ║ ║ ║ ║  │ ││ │├─┘├┤ 
  ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
  │ pogoni.ino
  └────────────────────

  Main file of Arduino board inside Cesar

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
  uint8_t* data = 0;
  int length;
  int address, id, type, nb_bytes_params;
  byte* params = 0;
  int i;

  /** Lecture du paquet en attente **/
  xbee.readPacket();

  if (xbee.getResponse().getApiId() == RX_16_RESPONSE) {
    #ifdef DEBUG
      Serial.println("### Reading packet");
    #endif
    xbee.getResponse().getRx16Response(rx16);
    
    length = (int) rx16.getDataLength();
    data = rx16.getData();

    if(length < 3) {
      #ifdef DEBUG
        Serial.println("Invalid packet, three or more bytes needed.");
      #endif
      return;
    }

    address = (int) data[0];
    type = (int) data[1];
    id = (int) data[2];
    length -= 3;
    params = (byte*) malloc(length * sizeof(byte));
    for(i = 0; i < length; i++) {
        params[i] = (byte) data[i+3];
    }

    #ifdef DEBUG
      Serial.println("[Packet]");
      Serial.print("  address:");
      Serial.println(address);
      Serial.print("  type:");
      Serial.println(type);
      Serial.print("  id:");
      Serial.println(id);
      Serial.print("  length:");
      Serial.println(length);
      
      Serial.println("  data:");
      for(i = 0; i < length; i++) {
        Serial.print("    [");
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
    
    nb_bytes_params = getNbBytesData(type);
    #ifdef DEBUG
      Serial.print("Number of expected bytes: ");
      Serial.println(nb_bytes_params);
    #endif

    if(length != nb_bytes_params) {
      #ifdef DEBUG
        Serial.println("ERROR: Number of expected bytes is different from number of received bytes");
      #endif
      // TODO
    }
    else if(address != ADDRESS_ARDUINO) {
      #ifdef DEBUG
        Serial.print("Packet sent to another one (destination= ");
        Serial.print(address);
        Serial.print(", address Arduino=");
        Serial.print(ADDRESS_ARDUINO);
        Serial.println(")");
      #endif
      // TODO
    }
    else {
         
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
