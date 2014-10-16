import usb2ax
from time import sleep

class Ax12:
	def initAX12(self):
		self.ax12 = usb2ax.Controller()
		while(len(self.ax12.servo_list) < 6):
			sleep(0.05)
			self.ax12 = usb2ax.Controller()#fix_sync_read_delay=True)

	def moveAX12(self, l):
		for i in self.ax12.servo_list:
			self.ax12.write(i, "goal_position", l[i-1]*1024/300)
			sleep(0.005)

ax12 = Ax12()

def getAX12PosFor(s):
	if s == "home":
		return [150]*6
	if s == "applause_open":
		return [150,155,155,150,145,145]
	if s == "applause_close":
		return [150,170,170,150,130,130]
	if s == "vague1_l":
		return [60,120,120,60,195,195]
	if s == "vague1_r":
		return [60,195,195,60,120,120]