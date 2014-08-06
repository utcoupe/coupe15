# -*- coding: utf-8 -*-
"""
Ce fichier est objet qui gère toute la communication
"""

from collections import deque
import time
import logging

from . import parser_c
from . import serial_comm
from . import conversion
import threading
from constantes import *


class CommunicationGlobale():
	def __init__(self):
		self.__logger = logging.getLogger(__name__.split('.')[0])
		self.nbTimeoutPaquets=0
		self.nbTransmitedPaquets = 0
		self.empty_fifo = True
		self.__enable_return_display = False


		self.address = {}
		self.orders = {}
		self.ordersArguments = {}
		self.ordersRetour = {}
		self.argumentSize = {}
		self.returnSize = {}
		(self.address, self.orders, self.argumentSize, self.ordersArguments, self.ordersRetour) = parser_c.parseConstante()
		self.nbAddress = len(self.address)//2

			
		for order in self.orders:#revertion de self.argumentSize
			if isinstance(order, (str)):
				size = self.argumentSize[order]
				self.argumentSize[self.orders[order]] = size

		for order in self.orders:# on vérifie la cohérance entre serial_defines.c et serial_defines.h
			self.checkParsedOrderSize(order)

		#on crée un dico de taille de retour
		for order in self.orders:
			size = 0
			for i,typeToGet in enumerate(self.ordersRetour[order]):
				if typeToGet == 'int':
					size += 2
				elif typeToGet == 'long':
					size += 4				
				elif typeToGet == 'float':
					size += 4
				else:
					self.__logger.error("Parseur: le parseur a trouvé un type non supporté")
			self.returnSize[order] = size

		
		self.ordreLog = [[(-1,"")]*64 for x in range(self.nbAddress+1)] #stock un historique des ordres envoyés, double tableau de tuple (ordre,data)
		self.arduinoIdReady = [False]*(self.nbAddress+1)
		self.lastConfirmationDate = [-1]*(self.nbAddress+1)#date de la dernière confirmation(en milliseconde)
		self.lastSendDate = [-1]*(self.nbAddress+1)#date du dernier envoie(en milliseconde)
		self.lastIdConfirm = [63]*(self.nbAddress+1)
		self.lastIdSend = [63]*(self.nbAddress+1)
		self.nbRenvoiImmediat = [0]*(self.nbAddress+1)
		self.nbNextRenvoiImmediat = [0]*(self.nbAddress+1)
		self.nbUnconfirmedPacket = [(0, -1)]*(self.nbAddress+1) # (nbUnconfimed, dateFirstUnconfirmed)
		
		
		if TEST_MODE == False and (ENABLE_TOURELLE == True or ENABLE_TIBOT == True):
			self.liaisonXbee = serial_comm.ComSerial(PORT_XBEE, VITESSE_XBEE, PARITY_XBEE)
		if TEST_MODE == False and ENABLE_FLUSSMITTEL == True:
			self.liaisonArduino = serial_comm.ComSerial(PORT_OTHER, VITESSE_OTHER, PARITY_OTHER)


		#defines de threads
		self.lastHighPrioTaskDate = 0
		self.lastLowPrioTaskDate = 0

		self.ordersToRead = deque()
		self.ordersToSend = deque()
		self.mutexOrdersToRead = threading.Lock()
		self.mutexOrdersToSend = threading.Lock()
		gestionThread = threading.Thread(target=self.gestion)
		gestionThread.start()		


	def getConst(self):
		dico = {}
		dico['address'] = self.address
		dico['orders'] = self.orders
		dico['argumentSize'] = self.argumentSize
		dico['ordersArguments'] = self.ordersArguments
		dico['ordersRetour'] = self.ordersRetour
		dico['returnSize'] = self.returnSize

		return dico

	def getSystemReady(self):
		readyList = ()
		for address in self.address:
			if isinstance(address, (int)):
				if self.arduinoIdReady[address]:
					readyList += (self.address[address],)

		return readyList
	
	def enableReturnDisplay(self):
		self.__enable_return_display = True

						#Thread

	def gestion(self):
		while THREAD_ACTIF:
			date = int(time.time()*1000)
			
			#tâches de hautes priotités
			if (date - self.lastHighPrioTaskDate) > HIGH_PRIO_SPEED:
				self.lastHighPrioTaskDate = date

				#Lecture des entrées
				if READ_INPUT == True:
					new_input = self.readOrders()
					if len(new_input)>0:
						self.mutexOrdersToRead.acquire()
						self.ordersToRead += new_input
						self.mutexOrdersToRead.release()

				#Renvoie des ordres non confirmés
				if RENVOI_ORDRE == True:
					for address in self.address:
						if isinstance(address, (int)):
							#procedure de renvoi en cas de TIMEOUT
							if (date - self.nbUnconfirmedPacket[address][1]) > TIMEOUT and self.nbUnconfirmedPacket[address][1] != -1:
								indiceARenvoyer = self.getAllUnknowledgeId(address)
								for indice in indiceARenvoyer:
									self.nbTimeoutPaquets += 1
									self.__logger.warning("Renvoie après TIMEOUT de l'ordre: %s d'id %s au robot %s binaire : %s", self.orders[self.ordreLog[address][indice][0]], indice, self.address[address], self.ordreLog[address][indice])
									self.sendMessage(address, self.ordreLog[address][indice][1])
									self.lastSendDate[address] = date 
									self.nbUnconfirmedPacket[address] = (self.nbUnconfirmedPacket[address][0], date)
									self.lastIdSend[address] = indice
				#Ecriture des ordres
				if WRITE_OUTPUT == True:
					self.sendOrders()
									
			#tâche de faibles priorités
			if (date - self.lastLowPrioTaskDate) > LOW_PRIO_SPEED:
				self.lastLowPrioTaskDate = date

				#recherche d'arduino
				if PROBING_DEVICES == True:
					for address in self.address:
						if isinstance(address, (int)):
							if self.arduinoIdReady[address] == False:
								self.askResetId(address)

				#Verification de la liaison avec les arduinos
				if KEEP_CONTACT == True:# On envoie un PING pour verifier si le device est toujours présent
					for address in self.address:
						if isinstance(address, (int)):
							if self.arduinoIdReady[address] != False:
								if (date - self.lastConfirmationDate[address]) > OFF_LIGNE_TIMEOUT and (date - self.arduinoIdReady[address]) > OFF_LIGNE_TIMEOUT:#le système est considere comme hors ligne
									self.__logger.error("L'arduino %s va être reset car elle a depasser le TIMEOUT", self.address[address])
									self.arduinoIdReady[address] = False
								elif (date - self.lastSendDate[address]) > KEEP_CONTACT_TIMEOUT:
									self.sendOrderAPI(address, self.orders['PINGPING_AUTO'])

			waitBeforeNextExec = (HIGH_PRIO_SPEED -(int(time.time()*1000) - date))
			if waitBeforeNextExec > 0:
				time.sleep(waitBeforeNextExec/1000.0)


	def stopGestion(self):
		THREAD_ACTIF = False


	def sendMessage(self, address, data):
		if (address == self.address['ADDR_FLUSSMITTEL_OTHER'] or address == self.address['ADDR_FLUSSMITTEL_ASSERV']) and ENABLE_FLUSSMITTEL == True and TEST_MODE == False: 
			self.liaisonArduino.send(data)
		elif (ENABLE_TOURELLE == True or ENABLE_TIBOT ==  True) and TEST_MODE == False:
			self.liaisonXbee.send(data)







						#Gestion des id

	def getId(self, address):
		"""retourne l'id qu'il faut utiliser pour envoyer un packet à l'adresse passé en argument"""
		if self.lastIdSend[address] == 63:
			self.lastIdSend[address] = 0
		else:
			self.lastIdSend[address] += 1

		return self.lastIdSend[address]

	def getNextIdOfId(self, idd):
		"""retourne l'id d'après"""
		if idd != 63:
			return idd+1
		else:
			return 0

	def getNextConfirmeId(self, address):
		"""retourne le prochain id attendu"""
		if self.lastIdConfirm[address] != 63:
			return self.lastIdConfirm[address]+1
		else:
			return 0

	def getAllUnknowledgeId(self, address):
		if self.lastIdSend[address] != self.lastIdConfirm[address]:
			unconfirmedId = self.getNextConfirmeId(address)
			unconfirmedIds = (unconfirmedId,)
			while unconfirmedId != self.lastIdSend[address]:
				if unconfirmedId != 63:
					unconfirmedId += 1
				else:
					unconfirmedId = 0
				unconfirmedIds += (unconfirmedId,)
			return unconfirmedIds
		return ()


	def removeOrdersInFile(self, address):# Warning, only on reset !
		remainOrdersToSend = deque()
		self.mutexOrdersToSend.acquire()
		for packet in self.ordersToSend:
			if packet[0] != address:
				remainOrdersToSend.append(packet)
			else:
				self.__logger.critical("drop de l'ordre %s par l'arduino %s suite à un reset", self.orders[ packet[1]], self.address[ packet[0]])
		self.ordersToSend = remainOrdersToSend
		self.mutexOrdersToSend.release()

	def askResetId(self, address): #demande a une arduino de reset
		self.removeOrdersInFile(address)
		self.lastConfirmationDate[address] = -1
		self.nbUnconfirmedPacket[address] = (0, -1)
		self.lastSendDate[address] = -1
		self.arduinoIdReady[address] = False
		self.nbRenvoiImmediat[address] = 0
		self.nbNextRenvoiImmediat[address] = 0
		self.lastIdConfirm[address] = 63
		self.lastIdSend[address] = 63

		chaineTemp = chr(address+192)
		self.sendMessage(address, chaineTemp)


	#cas où on reçoi
	def acceptConfirmeResetId(self, address):#accepte la confirmation de reset d'un arduino
		self.__logger.info("L'arduino %s a accepte le reset", self.address[address])
		self.removeOrdersInFile(address)
		self.lastConfirmationDate[address] = -1
		self.nbUnconfirmedPacket[address] = (0, -1)
		self.lastSendDate[address] = -1
		self.arduinoIdReady[address] = int(time.time()*1000)
		self.nbRenvoiImmediat[address] = 0
		self.nbNextRenvoiImmediat[address] = 0
		self.lastIdConfirm[address] = 63
		self.lastIdSend[address] = 63
		

	def confirmeResetId(self, address):#renvoie une confirmation de reset
		self.__logger.info("Reponse à la demande de confirmation de reset de l'arduino %s", self.address[address])
		self.removeOrdersInFile(address)
		self.lastConfirmationDate[address] = -1
		self.nbUnconfirmedPacket[address] = (0, -1)
		self.lastSendDate[address] = -1
		self.arduinoIdReady[address] = int(time.time()*1000)
		self.nbRenvoiImmediat[address] = 0
		self.nbNextRenvoiImmediat[address] = 0
		self.lastIdConfirm[address] = 63
		self.lastIdSend[address] = 63

		chaineTemp = chr(address+224)
		self.sendMessage(address, chaineTemp)







	def extractData(self, rawInput):
		""" prend rawInput une chaine de caractère qui correspond  qui correspond à un ordre, retourne les autres packerData est prêt à être interpréter"""
		
		#Affiche les retours arduino après le découpage en paquet et avec le traitement 
		"""
		print("DEBUG")
		for letter in rawInput:
			print(conversion.intToBinary(letter)[:8])
		print("FIN DEBUG")
		"""

	

		packetAddress = rawInput[0] - 128

		if packetAddress > 96:# l'arduino confirme le reset
			if packetAddress-96 in self.address:
				self.acceptConfirmeResetId(packetAddress-96)
				return 0
			else:
				self.__logger.warning("corrupted address on reset confirme from arduino, adress %s", packetAddress-96)
				return -1

		elif packetAddress > 64:# l'arduino demande un reset
			if packetAddress-64 in self.address:
				self.confirmeResetId(packetAddress-64)
				return 0
			else:
				self.__logger.warning("corrupted address on reset request from arduino, address %s", packetAddress-64)
				return -1

		elif len(rawInput)>=3:#cas normal
			packetId = rawInput[1]

			# si la longeur des données reçu est bonne
			if 0 < packetAddress < (self.nbAddress+1) and 0 <= packetId < 64:
				order = self.ordreLog[packetAddress][packetId][0]
				if order != -1:
					if len(rawInput[2:-1])*7//8 == self.returnSize[ order ]:
						return (packetAddress, packetId, rawInput[2:-1])# on supprime les deux carctères du dessus et le paquet de fin
					else:
						self.__logger.warning("Le paquet est mal formé, l'address ou l'id est invalide debug_A")
						return -1
				else:
					self.__logger.error("On essaye de lire, l'id %s en provenance de l'arduino %s mais il n'est existe pas de trace dans le log (un vieux paquet qui trainait sur un client avant la nouvelle init ?)", packetId, self.address[packetAddress])
					return -1
			elif 0 < packetAddress < (self.nbAddress+1) and packetId > 63:
				self.__logger.warning("L'arduino %s nous indique avoir mal reçu un message, message d'erreur %s", self.address[packetAddress], packetId)
				if self.nbNextRenvoiImmediat[packetAddress] != 0:
					self.nbRenvoiImmediat[packetAddress] += 1
				return -1
			else:
				self.__logger.warning("Le paquet est mal formé, l'address ou l'id est invalide")
				return -1
		else:
			self.__logger.warning("Le paquet n'est pas un reset et ne fait même pas 3 octet, des données ont probablement été perdue, paquet droppé")
			return -1

	def getXbeeOrders(self):
		rawInputList = []
		""" retourne ordersList, une liste d'élements sous la forme(adresse, id, data) où data est prêt à être interpréter"""
		if TEST_MODE == False and (ENABLE_TOURELLE == True or ENABLE_TIBOT == True):
			rawInputList += self.liaisonXbee.read()

		if TEST_MODE == False and ENABLE_FLUSSMITTEL == True:
			rawInputList += self.liaisonArduino.read()

		ordersList = deque()

		for rawInput in rawInputList:
			ret = self.extractData(rawInput)
			if ret != -1 and ret != 0 and ret is not None:# cas où les données sont de la bonne taille et que ça n'a rien à voir avec le système de reset
				ordersList.append(ret)

		return ordersList


	def readOrders(self):
		ordersList = self.getXbeeOrders()
		returnOrders = deque()

		for order in ordersList:
			address = int(order[0])
			idd = int(order[1])
			
			unconfirmedIds = self.getAllUnknowledgeId(address)
			if idd in unconfirmedIds:
				#ne pas renvoyer  les paquets sans argument et dont on a louppé les confimations
				date = int(time.time()*1000)
				returnMissed = False
				lastIdToAccept = -1

				if idd == self.getNextConfirmeId(address):
					#self.__logger.debug("Success: l'arduino %s a bien recu l'ordre %s d'id: %s", self.address[address], self.orders[self.ordreLog[address][idd][0]], idd)
					self.nbTransmitedPaquets +=1
					self.nbUnconfirmedPacket[address] = (self.nbUnconfirmedPacket[address][0] - unconfirmedIds.index(idd) - 1, date)#on bidone le chiffre date, mais c'est pas grave
					self.lastIdConfirm[address] = idd
					self.lastConfirmationDate[address] = date
				else:
					i = 0
					lastIdToAccept = self.lastIdConfirm[address]
					"""while lastIdToAccept != idd and returnMissed == False:
						if (self.returnSize[ self.ordreLog[address][unconfirmedIds[i]][0] ] == 0 and returnMissed == False):
							lastIdToAccept = unconfirmedIds[i]
						else:
							returnMissed = True
						if i > MAX_UNCONFIRMED_PACKET:
							self.__logger.critical("ERREUR CODE: ce cas ne devrait pas arriver")
						i +=1

					if lastIdToAccept != self.lastIdConfirm[address]:
						if returnMissed == True:
							self.__logger.warning("Warning: l'arduino %s a bien recu les ordres jusque %s mais il manque au moins un retour (avec argument) donc on ne confirme que %s d'id: %s", self.address[address], idd, self.orders[self.ordreLog[address][lastIdToAccept][0]], lastIdToAccept)
							self.nbTransmitedPaquets += 1
							self.nbUnconfirmedPacket[address] = (self.nbUnconfirmedPacket[address][0] - unconfirmedIds.index(lastIdToAccept) - 1, date)#on bidone le chiffre date, mais c'est pas grave
							self.lastIdConfirm[address] = lastIdToAccept
						
					
					self.lastConfirmationDate[address] = date"""
					
				if idd == self.getNextConfirmeId(address) or lastIdToAccept != self.lastIdConfirm[address]:
					#python enleve les zero lors de la conversion en binaire donc on les rajoute, sauf le premier du protocole
					argumentData = ""
					for octet in order[2]:
						temp = bin(octet)[2:].zfill(7)
						argumentData += temp

					arguments = []
					index = 0
					for returnType in self.ordersRetour[self.ordreLog[address][idd][0]]:
						if returnType == 'int':
							size = 16
							retour = conversion.binaryToInt(argumentData[index:index+size])
							arguments.append(retour)
							index += size
						elif returnType == 'float':
							size = 32
							retour = conversion.binaryToFloat(argumentData[index:index+size])
							arguments.append(retour)
							index += size
						elif returnType == 'long':
							size = 32
							retour = conversion.binaryToLong(argumentData[index:index+size])
							arguments.append(retour)
							index += size
						else:
							self.__logger.error("Parseur: le parseur a trouvé un type non supporté")
					if self.orders[self.ordreLog[address][idd][0]] != 'PINGPING_AUTO':
						returnOrders.append((self.address[address], self.orders[self.ordreLog[address][idd][0]], arguments))

					#utilisé pour afficher les retours directement dans la console quand on bypass l'ia
					if len(arguments) > 0 and self.__enable_return_display == True:
						print("Retour :", arguments)

			else:
				self.__logger.warning("l'arduino %s a accepte le paquet %s alors que les paquets a confirmer sont %s sauf si on a louppé une réponse avec arguments", self.address[address], idd, self.getAllUnknowledgeId(address))
			
		return returnOrders



	def applyProtocole(self, address, idd, order, data):
		""" on concatène les trois parametres et on retourne chaineRetour en appliquant le protocole """
		rawBinary = conversion.orderToBinary(order)
		for i,typeToGet in enumerate(self.ordersArguments[order]):
			if typeToGet == 'int':
				rawBinary += conversion.intToBinary(data[i])
			elif typeToGet == 'long':
				rawBinary += conversion.intToBinary(data[i])
			elif typeToGet == 'float':
				rawBinary += conversion.floatToBinary(data[i])
			else:
				self.__logger.error("ERREUR: Parseur: le parseur serial_defines a trouvé un type non supporté")
		
		while len(rawBinary)%7 != 0: # hack pour former correctement le dernier octet
			rawBinary += '0'
		
		chaineRetour = ""
		chaineRetour += chr(address + 128)
		chaineRetour += chr(idd)
		for i in range(0, len(rawBinary), 7):
			chaineRetour += chr(int(rawBinary[i:i+7], 2))

		#on ajoute l'octet de fin
		chaineRetour += chr(128)

		return (chaineRetour)

	def sendOrders(self):
		"""fonction qui gère l'envoi des ordres, sous le contrôle du thread de gestion"""
		
		#cas d'envoi normal
		if self.ordersToSend:
			date = int(time.time()*1000)
			remainOrdersToSend = deque()
			self.mutexOrdersToSend.acquire()
			for packet in self.ordersToSend:#packet contient(address, ordre, *argument)
				#si il n'y a pas déjà trop d'ordres en atente on envoi
				if self.nbUnconfirmedPacket[packet[0]][0] < MAX_UNCONFIRMED_PACKET:
					address = packet[0]
					order = packet[1]
					self.nbUnconfirmedPacket[address] = (self.nbUnconfirmedPacket[address][0]+1, date)
					
					idd = self.getId(address)
					chaineTemp = self.applyProtocole(address, idd, order, packet[2])

					self.ordreLog[int(address)][idd] = (order, chaineTemp)
					self.lastSendDate[address] = date
					self.lastIdSend[address] = idd
					#self.__logger.debug("Envoi normal a l'arduino %s de l'ordre %s d'id %s", self.address[address], self.orders[order], idd)
					self.sendMessage(address, chaineTemp)
				else:
					remainOrdersToSend.append(packet)

			self.ordersToSend = remainOrdersToSend
			self.mutexOrdersToSend.release()

			if len(remainOrdersToSend) == 0 and not self.empty_fifo:
				self.empty_fifo = True
				#self.__logger.debug("Fin de transmission de la file, (t = "+str(int(time.time()*1000)-self.timeStartProcessing)+"ms),nombre de paquets reçu " + str(self.nbTransmitedPaquets) + " nombre de paquets perdu " + str(self.nbTimeoutPaquets))
		







						#fonctions de verifications diverses
	def checkAddress(self, address):
		"""verifie que l'address existe et la convertie en int si nécéssaire, sinon retourne -1"""
		if address in self.address:
			if isinstance(address, (str)):
				address = self.address[address]
			if self.arduinoIdReady[address] != False:
				return address
			else:
				self.__logger.error("L'arduino " + str(self.address[address]) + " n'est pas prête.")
				return -1
		else:
			self.__logger.error("L'address: " + str(address) + " est invalide.")
			return -1

	def checkOrder(self, order):
		"""verifie l'ordre et le convertie en int si nécessaire, sinon retourne -1"""
		if order in self.orders:
			if isinstance(order, (str)):
				order = self.orders[order]
			return order
		else:
			self.__logger.error("L'ordre: " + str(order) + " est invalide.")
			return -1

	def checkParsedOrderSize(self, order):
		"""check parsed sizes"""

		if order in self.argumentSize:#verification
			sizeExpected = self.argumentSize[order]
			somme = 0
			for argumentType in self.ordersArguments[order]:
				if argumentType == 'int':
					somme += 2
				elif argumentType == 'long':
					somme += 4
				elif argumentType == 'float':
					somme += 4
				else:
					self.__logger.error("type parse inconnu")
			if somme != sizeExpected:
				self.__logger.error("la constante de taille de l'ordre " + str(order) + " ne correspond pas aux types indiqués attendu " + str(sizeExpected) + " calculee " + str(somme))
		else:
			self.__logger.error("L'ordre " + str(order) + " n'a pas été trouvé dans serial_defines.c")


	def checkOrderArgument(self, order, *arguments):
		"""check a given set of argument for an order, if all arguments type match return 0 else return -1"""

		if len(arguments) == len(self.ordersArguments[order]):
			for i, argumentType in enumerate(self.ordersArguments[order]):
				if argumentType == 'int':
					if not isinstance(arguments[i], (int)):
						self.__logger.error("L'argument " + str(i) + " de l'ordre " + str(order) + " n'est pas du bon type, attendu (int)")
						return -1
				elif argumentType == 'long':
					if not isinstance(arguments[i], (long)):
						self.__logger.error("L'argument " + str(i) + " de l'ordre " + str(order) + " n'est pas du bon type, attendu (long)")
						return -1
				elif argumentType == 'float':
					if not isinstance(arguments[i], (float)):
						self.__logger.error("L'argument " + str(i) + " de l'ordre " + str(order) + " n'est pas du bon type, attendu (float)")
						return -1
				else:
					self.__logger.error("l'argument parsé dans serial_define est de type inconnu")
					return -1
					
		else:
			self.__logger.error("l'order " + str(order) + " attend " + str(len(self.ordersArguments[order])) + " arguments, mais a recu: " + str(len(arguments)) + " arguemnts")
			return -1

		return 0





	def sendOrderAPI(self, address, order, *arguments):
		""""api d'envoie d'ordres avec verification des parametres, retourne -1 en cas d'erreur, sinon 0"""

		#print("On envoi address "+str(address)+" order "+str(order)+" arguments "+str(arguments))
		if self.empty_fifo == True and order != self.orders['PINGPING_AUTO']:
			self.empty_fifo = False 
			self.timeStartProcessing = int(time.time()*1000)

		#on verifie l'address
		address = self.checkAddress(address)
		order = self.checkOrder(order)

		if address !=-1 and order !=-1 and self.checkOrderArgument(order, *arguments) !=-1:
			self.mutexOrdersToSend.acquire()
			self.ordersToSend.append((address, order, arguments))
			self.mutexOrdersToSend.release()
			return 0
		else:
			return -1
		


	def readOrdersAPI(self, address = 'all'):
		"""Renvoi -1 si pas d'ordre en attente sinon renvoi un ordre """

		orderToReturn = None
		#Si on veut n'importe quel parquet
		if address == 'all':
			self.mutexOrdersToRead.acquire()
			if self.ordersToRead:
				orderToReturn = self.ordersToRead.popleft()
			self.mutexOrdersToRead.release()

		"""
		#Uniquement si on veut les paquets d'un objet préci
		else:
			newOrderToRead = deque()
			
			orderToReturn = -1
			self.mutexOrdersToRead.acquire()
			
			while self.ordersToRead:
				order = self.ordersToRead.popleft()
				if (order[0] == address or order[0] == self.address[address] or address == 'all') and find == False:
					find = True
					orderToReturn = order
				else:
					newOrderToRead.append(order)
			self.mutexOrdersToRead.release()
		"""
		if orderToReturn is not None:
			return (orderToReturn[0], orderToReturn[1], orderToReturn[2]) #(address, order, arguments)
		else:
			return -1
