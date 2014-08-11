# -*- coding: utf-8 -*-

"""
    ╦ ╦╔╦╗╔═╗┌─┐┬ ┬┌─┐┌─┐
    ║ ║ ║ ║  │ ││ │├─┘├┤ 
    ╚═╝ ╩ ╚═╝└─┘└─┘┴  └─┘
    │ test_xbee_api_mode.py
    └────────────────────

    Script to test receiving data from an Arduino
    Results of the test : IT WORKS
        data is a dictionnary like this :
        {'id': 'rx', 'source_addr': b'\x00C', 'rssi': b'$', 'rf_data': b'\xc8bc', 'options': b'\x00'}
        The most important is 'rf_data' which contain data (in bytes)

    Author(s)
        - Alexis Schad : schadoc_alex@hotmail.fr
"""

from xbee import XBee
import serial
from time import sleep

PORT = '/dev/ttyUSB0'
BAUD_RATE = 57600

# Open serial port
ser = serial.Serial(PORT, BAUD_RATE)

def message_received(data):
    print(data)
# Create API object
xbee = XBee(ser, callback=message_received)

# Continuously read and print packets
while True:
    try:
        #xbee.send('tx', dest_addr=b'\x00\x43', data=b'\x08abc')
        sleep(1)
    except KeyboardInterrupt:
        break

xbee.halt()
ser.close()
