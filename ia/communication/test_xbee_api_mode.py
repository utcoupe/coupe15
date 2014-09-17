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

PORT = '/dev/ttyUSB0'
BAUD_RATE = 57600

# Open serial port
ser = serial.Serial(PORT, BAUD_RATE)

# Code for TX/RX
# Create API object
def message_received(data):
	print(data)
xbee = XBee(ser, callback=message_received)#, escaped=True)

# Code for RX
"""

# Create API object
xbee = XBee(ser, )
"""
# Continuously read or print packets
while True:
	try:
		# Code for TX
		try:
			head = b'\x43\x04\x01' # \x43 : adresse du destinataire, \x04 : id de l'ordre, \x01 : id unique du packet
			x = int(input("data: "))
			#y = int(input("new delay: "))

			# if y < 0:
			#	y += 4294967295
			
			order = x.to_bytes(1, "big")

			xbee.send('tx', dest_addr=b'\x00\x43', data=order)

			#print(order)
			#print("");
		except:
			break

		# Code for RX
		"""
		sleep(0.1)
		"""
	except KeyboardInterrupt:
		break

xbee.halt()
ser.close()
