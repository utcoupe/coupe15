# -*- coding: utf-8 -*-

"""
    Class for communicating with a XBee radio in transparent mode

    author(s)
        - Alexis Schad : schadoc_alex@hotmail.fr

    TODO :
        - Comments
        - Try serial port before validating one (maybe it's an USB key)
        - Open xml file to get configuration values (so introduce XBee
            name like "master" and "arduino" passed to the constructor)
        - Use a logger in place of print() function
"""

from serial import Serial
from sys import exit
from time import sleep
import os

class XBee:
    def __init__(self, baudrate, port='/dev/ttyUSB0'):

        # Check baudrate validity
        if self.__convertBaudsToNumber(baudrate) == -1:
            print("Error : baudrate "+ str(baudrate) +" is invalid")
            exit()
        self.baudrate = baudrate

        # Choose existing port
        if not os.path.exists(port):
            # Try /dev/ttyUSB*
            for i in range(0,6):
                port = '/dev/ttyUSB'+str(i)
                if os.path.exists(port):
                    break
            if i >= 6:
                print("Error : can't open any /dev/ttyUSB* port (range 0-5)"+str(i))
                exit()

        # Open serial communication
        self.link = Serial(port, self.baudrate, timeout=0.02)

        if not self.link.readable():
            print("Error : can't open "+ port +" port")
            exit()

        print('Port opened : ' + self.link.name)

        if not self.enterCommandMode():
            # Try with all others baudrates to reconfigure with baudrate variable value
            for i in [3,6,7,0,1,2,4,5]: # Most probably baudrate first (optimization)
                new_baudrate = self.__convertNumberToBauds(i)
                self.link.baudrate = new_baudrate
                if self.enterCommandMode():
                    break
                else:
                    pass #print("Failed with "+ str(self.__convertNumberToBauds(i)) +" bauds")

        self.AT('RE')
        self.AT('BD', self.__convertBaudsToNumber(self.baudrate))
        self.AT('MY', '0042')
        self.AT('CH', '0013')
        self.AT('ID', '0666')
        self.AT('RR', '6')

        self.address = self.AT('MY')
        self.channel = self.AT('CH')
        self.pan_id = self.AT('ID')

        self.saveCommands()
        self.closeCommandMode()

        print('Channel : \t' + self.channel)
        print('PAN ID : \t' + self.pan_id)
        print('Address : \t' + self.address)
        print('Baudrate : \t' + str(self.baudrate))

    def send(self, string):
        self.link.write(string.encode())

    def read(self, length=100):
        return self.link.read(length).decode()

    def close(self):
        self.link.close()

    ####
    ## Functions dedicated to COMMAND MODE
    ####

    def enterCommandMode(self):
        self.send('+++')
        return self.waitForOK()

    def closeCommandMode(self):
        self.AT('CN')

    def reboot(self):
        self.AT('FR')

    def saveCommands(self):
        self.AT('WR')
        return self.waitForOK()

    def AT(self, command, parameter=''):
        self.send('AT'+command+str(parameter)+'\r')
        if parameter == '':
            return self.read()
        else:
            return self.waitForOK()

    def waitForOK(self, nb_step=100):
        for i in range(1,nb_step):
            if self.read(3) == 'OK\r':
                return True
        return False

    ####
    ## Functions dedicated to baudrate
    ####

    def __convertNumberToBauds(self, n):
        n = int(n)
        if n < 0 or n > 7:
            print("Number "+ str(n) +" can't be converted to a baudrate")
            return -1
        else:
            return {0:1200,1:2400,2:4800,3:9600,4:19200,5:38400,6:57600,7:115200}[n]

    def __convertBaudsToNumber(self, baudrate):
        baudrate = int(baudrate)
        tab_baudrate = [1200,2400,4800,9600,19200,38400,57600,115200]

        if baudrate in tab_baudrate:
            return tab_baudrate.index(baudrate)
        else:
            print("Baudrate "+ str(baudrate) +" can't be converted to a number")
            return -1

try:
    xbee = XBee(57600)
    xbee.close()
except KeyboardInterrupt:
    pass