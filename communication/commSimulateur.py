# -*- coding: utf-8 -*-
"""
Cette classe permet de communiquer avec le simulateur qui vient d'instancier l'ia courante
"""

import logging
from collections import deque
import time
import threading

class CommSimulateur:
	def __init__(self, pipe):
		self.__logger = logging.getLogger(__name__.split('.')[0])
		self.__connection = pipe
		self.__input_buffer = deque()

		
	def readOrdersAPI(self):
		self.__readPipe()

		if self.__input_buffer:
			temp = self.__input_buffer.popleft()
			return temp
		else:
			return -1

	def __readPipe(self):
		while self.__connection.poll():
			message = self.__connection.recv()
			self.__input_buffer.append(message)




	def sendOrderAPI(self, address, order, *arguments):
		self.__connection.send((address, order, arguments))
