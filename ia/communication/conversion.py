# -*- coding: utf-8 -*-
"""
Ce fichier gère les conversion pour la communication
"""

import struct

def binaryToFloat(string):
	#convertion d'un chaine de binaire en float
	def as_float32(s):
		"""
		See: http://en.wikipedia.org/wiki/IEEE_754-2008
		"""
		return struct.unpack("f",struct.pack(">I", bits2int(s)))

	# Where the bits2int function converts bits to an integer.  
	def bits2int(bits):
		# You may want to change ::-1 if depending on which bit is assumed
		# to be most significant.
		bits = [int(x) for x in bits[::-1]]

		x = 0
		for i in range(len(bits)):
			x += bits[i]*2**i
		return x
	#TODO gérer les float négatif et tester car taille(floatArduino) != taille(floatPC)
	return as_float32(string)[0]


def binaryToInt(string):
	temp = string[8:16]
	temp += string[0:8]

	resultat = int(temp, 2)
	if resultat > 32767:
		resultat -= 65536
	return resultat

def binaryToLong(string):
	retour = string[24:32]
	retour += string[16:24]
	retour += string[8:16]
	retour += string[0:8]

	resultat = int(retour, 2)
	if resultat > 2147483647: #si le nombre est négatif
		resultat -= 4294967295
	return resultat


def floatToBinary(num):
	"""retourne une chaine de 32 bits"""
	#return ''.join(bin(ord(c)).replace('0b', '').rjust(8, '0') for c in struct.pack('<f', num))
	return ''.join(bin(c).replace('0b', '').rjust(8, '0') for c in struct.pack('<f', num))

def longToBinary(num):
	"""retourne une chaine de 32 bits"""
	if num < 0: #si l'int est négatif
		num += 4294967295

	temp = bin(num)[2:].zfill(32)

	#On inverse les 16 bits par blocks de 8, exemple AAAAAAAABBBBBBBB devient BBBBBBBBAAAAAAAA
	retour = temp[24:32]
	retour += temp[16:24]
	retour += temp[8:16]
	retour += temp[0:8]
	return retour


def intToBinary(num):
	"""retourne une chaine de 16 bits"""
	if num < 0: #si l'int est négatif
		num += 65536

	temp = bin(num)[2:].zfill(16)

	#On inverse les 16 bits par blocks de 8, exemple AAAAAAAABBBBBBBB devient BBBBBBBBAAAAAAAA
	retour = temp[8:16]
	retour += temp[0:8]
	return retour


def orderToBinary(num):
	"""retourne une chaine de 6 bits"""
	return bin(num)[2:].zfill(6)
