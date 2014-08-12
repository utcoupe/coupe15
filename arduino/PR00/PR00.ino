"""
    ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
    ║ ║ ║ ║  │ ││ │├─┘├┤ 
    ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
    │ PR00.ino
    └────────────────────

    Main file of Arduino board inside PR00

    Author(s)
        - Alexis Schad : schadoc_alex@hotmail.fr
"""

#include <XBee.h>
#include "constants.h"

void setup() {
    Serial1.begin(BAUDRATE_XBEE);
}

void loop() {
    delay(1000);
}
