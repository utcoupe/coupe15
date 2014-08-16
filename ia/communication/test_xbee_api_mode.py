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
		The most important is 'rf_data' which contain data (in byte format)

	Code for TX is used to change the intensity LED on Arduino port (see test_xbee_rx.ino for the Arduino part)
	Code for RX is used to show the data received in python, sent by the Arduino (see test_xbee_tx.ino for the Arduino part)

	Author(s)
		- Alexis Schad : schadoc_alex@hotmail.fr
"""

from xbee import XBee
import serial
from time import sleep

PORT = '/dev/ttyUSB1'
BAUD_RATE = 57600

# Open serial port
ser = serial.Serial(PORT, BAUD_RATE)

# Code for TX
# Create API object
xbee = XBee(ser)

# Code for RX
"""
def message_received(data):
	print(data)
# Create API object
xbee = XBee(ser, callback=message_received)
"""
# Continuously read or print packets
while True:
	try:
		# Code for TX
		try:
			y = b'\x43\x05\x04'
			x = int(input("x: "))
			x = y + x.to_bytes(1, "big") + x.to_bytes(1, "big")
			print(x)
			xbee.send('tx', dest_addr=b'\x00\x43', data=x)
		except:
			print(str(x)+" is not a valid value")
			break

		# Code for RX
		"""
		sleep(0.1)
		"""
	except KeyboardInterrupt:
		break

xbee.halt()
ser.close()
