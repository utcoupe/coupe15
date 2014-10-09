import pygame
from pygame.locals import *

from time import sleep, clock

pygame.init()

fenetre = pygame.display.set_mode((100,100))
musique = pygame.mixer.Sound("Milky Chance - Stolen Dance.ogg")

musique.play();

last_c = 0
tempo = 0.51959
t = True
#sleep(tempo/2)
loop = True
while loop:
	c = clock()
	for event in pygame.event.get():
		if event.type == KEYDOWN:
			if event.key == K_ESCAPE:
				loop = False
			if event.key == K_KP5:
				last_c = c
				#print(clock())
	if c - last_c > tempo:
		last_c = c
		if t:
			print("TIC")
		else:
			print("TAC")
		t = not t

