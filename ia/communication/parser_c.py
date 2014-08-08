# -*- coding: utf-8 -*-

"""
Récupère les infos de defines.h et de defines_size.c, les defines communes pour tous les systèmes
Puis il le convertie en dictionnaires, comme ça pas besoin d'éditer plusieurs fichiers
"""

import os
import re
import codecs

def parseFile(path, myRe, nbGroupParse=1, seekArguments=False, bothSideAssigment=False):
	reBegin = re.compile("\s?//DEBUTPARSE\s?")
	reFin = re.compile("\s?//FINPARSE\s?")
	definesFile = codecs.open(path, 'r', 'utf-8')
	compteur = 0
	parse = False
	nbGroup = 0
	dico = {}

	for line in definesFile:
		if reFin.match(line):
			parse = True

		if parse and  nbGroup == nbGroupParse:
			result = myRe.match(line)
			if result: 
				constante = result.group('constante')
				value = result.group('value')
				if value:
					compteur = int(value)

				if seekArguments:
					argList = result.group('arg')
					if argList is None:
						argList = ""
					argTuple = ()
					for arg in argList.split():
						argTuple = argTuple + (arg[1:],)
					dico[constante] = argTuple
					dico[compteur] = argTuple
				else:
					dico[constante] = compteur
					if bothSideAssigment:
						dico[compteur] = constante

				compteur += 1

		if reBegin.match(line):
			parse = True
			nbGroup += 1

	definesFile.close()

	return dico


def parseConstante():
	relativePath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../libs/com_C/")

	reEnum = re.compile("\s*(?P<constante>\w*)(\s*=\s*(?P<value>.*))?,")
	reArguments = re.compile("\s*(?P<constante>\w*)(\s*=\s*(?P<value>.*))?,(\s*//)?(?P<arg>(@\w*\s*)*)?.*\n")
	reReturn = re.compile("\s*(?P<constante>\w*)(\s*=\s*(?P<value>.*))?,(\s*//)?((@\w*\s*)*)?(?P<arg>(#\w*\s*)*)?.*\n")
	reArrayC = re.compile("\s*ordreSize\[(?P<constante>\w*)\](\s*=\s*(?P<value>.*))?;")


	address = parseFile(relativePath + "serial_defines.h", reEnum, 1, bothSideAssigment=True)
	orders = parseFile(relativePath + "serial_defines.h", reEnum, 2, bothSideAssigment=True)
	ordersArguments = parseFile(relativePath + "serial_defines.h", reArguments, 2, seekArguments=True, bothSideAssigment=False)
	ordersRetour = parseFile(relativePath + "serial_defines.h", reReturn, 2, seekArguments=True, bothSideAssigment=False)
	ordersSize = parseFile(relativePath + "serial_defines.c", reArrayC, 1, bothSideAssigment=False)

	return (address, orders, ordersSize, ordersArguments, ordersRetour)
