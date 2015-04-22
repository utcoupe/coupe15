#!/usr/bin/python3

import sys
from socket import *
from tkinter import *
import threading
import com
import time

class GUI:
    def __init__(self, path, baud):
        #defines
        self.widthfen = 800
        self.heightfen = 600
        self.areax = 3000
        self.areay = 2000
        self.robotsize = 50
        self.robot_pos = [0, 0, 0]

        try:
            self.com = com.Communication(path, baud)
        except:
            print("WARNING : Socket non ouvert, mode visualisation")

        #init GUI
        self.fen = Tk()
        self.fen.title("GUI")

        self.chaine = Label(self.fen)

        self.cadre = Canvas(self.fen, width=self.widthfen, height =self.heightfen, bg="light yellow")
        self.cadre.bind("<Button-1>", self.clic_goto)
        self.robot_rect = self.cadre.create_oval(0, 0, self.robotsize, self.robotsize, offset='center', fill='red')
        self.robot_txt = self.cadre.create_text(0, 0, text='Pos')
        self.move_robot(*self.robot_pos)

        #speeds

        #reset
        self.reset_pos_button = Button(self.fen, text='Reset position', command=self.reset_pos)
        self.reset_goals_button = Button(self.fen, text='Reset objectifs', command=self.reset_goals)

        #fifo
        self.fifo_switch = Scale(self.fen, from_=0, to=1, label='Fifo', orient='horizontal')

        #goto manue
        self.goto_text = Label(self.fen, text= "Goto")
        self.gotox_e = Entry(self.fen)
        self.gotoy_e = Entry(self.fen)
        self.gotoang = Entry(self.fen)
        self.goto_frame = Frame()
        self.send_goto = Button(self.goto_frame, text="Goto", command=self.goto_handler).pack(side='left')
        self.send_gotoa = Button(self.goto_frame, text="Gotoa", command=self.gotoa_handler).pack(side='right')


        #pwm menu
        self.pwm_text = Label(self.fen, text= "PWM")
        self.pwm_g = Entry(self.fen)
        self.pwm_d = Entry(self.fen)
        self.pwm_duration = Entry(self.fen)
        self.pwm_frame = Frame()
        self.send_pwm = Button(self.pwm_frame, text="Send pwm", command=self.pwm_handler).pack(side='left')

        #reglages
        self.pidl_text = Label(self.fen, text="PID left")
        self.pidl_p = Entry(self.fen)
        self.pidl_p.insert(0, '180')
        self.pidl_i = Entry(self.fen)
        self.pidl_i.insert(0, '0')
        self.pidl_d = Entry(self.fen)
        self.pidl_d.insert(0, '40')

        self.pidr_text = Label(self.fen, text="PID right")
        self.pidr_p = Entry(self.fen)
        self.pidr_p.insert(0, '2')
        self.pidr_i = Entry(self.fen)
        self.pidr_i.insert(0, '0')
        self.pidr_d = Entry(self.fen)
        self.pidr_d.insert(0, '0.5')

        self.acc_max_text = Label(self.fen, text="Acc max")
        self.acc_max = Entry(self.fen)
        self.acc_max.insert(0, '2')

        self.spd_max_text = Label(self.fen, text="Spd max")
        self.spd_max = Entry(self.fen)
        self.spd_max.insert(0, '1')


        self.send_reg = Button(self.fen, text="Send", command=self.val_reg)

        self.chaine.pack(side='bottom')
        self.cadre.pack(side='right', padx=10, pady=10)
        self.fifo_switch.pack()
        self.reset_goals_button.pack(pady=10)
        self.reset_pos_button.pack(pady=10)

        self.goto_text.pack()
        self.gotox_e.pack()
        self.gotoy_e.pack()
        self.gotoang.pack()
        self.goto_frame.pack()

        self.pwm_text.pack()
        self.pwm_g.pack()
        self.pwm_d.pack()
        self.pwm_duration.pack()
        self.pwm_frame.pack()

        self.send_reg.pack(side='bottom')
        self.pidl_d.pack(side='bottom')
        self.pidl_i.pack(side='bottom')
        self.pidl_p.pack(side='bottom')
        self.pidl_text.pack(side='bottom')
        self.pidr_d.pack(side='bottom')
        self.pidr_i.pack(side='bottom')
        self.pidr_p.pack(side='bottom')
        self.pidr_text.pack(side='bottom')
        self.acc_max.pack(side='bottom')
        self.acc_max_text.pack(side='bottom')
        self.spd_max.pack(side='bottom')
        self.spd_max_text.pack(side='bottom')

        self.thread_pos = threading.Thread(target=self.pos_update);
        self.thread_pos.daemon = True
        self.thread_pos.start()

        self.fen.after(100, self.pos_loop)
        self.fen.mainloop()

    def move_robot(self, x, y, a):
        x = int(x)
        y = int(y)
        self.cadre.coords(self.robot_rect, ((x / self.areax) * self.widthfen) - self.robotsize / 2, self.heightfen - ((y / self.areay) * self.heightfen) - self.robotsize / 2, ((x / self.areax) * self.widthfen) + self.robotsize / 2, self.heightfen - ((y / self.areay) * self.heightfen) + self.robotsize / 2)
        self.cadre.coords(self.robot_txt, ((x / self.areax) * self.widthfen), self.heightfen - ((y / self.areay) * self.heightfen) + self.robotsize / 1.5)
        self.cadre.itemconfig(self.robot_txt, text=str(x) + ";" + str(y) + ";" + "{:.2f}".format(a))

    def pos_update(self):
        while 1:
            self.robot_pos = self.com.getPos()
            time.sleep(0.01)

    def pos_loop(self):
        self.move_robot(*self.robot_pos)
        self.fen.after(100, self.pos_loop)

    def reset_pos(self):
        self.chaine.configure(text = "reset_pos : "+str(0)+" ; "+str(0)+" ; "+str(0))
        arguments = [0, 0, 0]
        self.com.sendOrderSafe('SET_POS', args=arguments)
    
    def reset_goals(self):
        self.com.sendOrderSafe('CLEANG')

    def val_reg(self):
        arguments = [str(float(self.acc_max.get())*1000)]
        self.com.sendOrderSafe('ACCMAX', args=arguments)
        arguments = [str(1000*float(self.pidl_p.get())),
                str(1000*float(self.pidl_i.get())),
                str(1000*float(self.pidl_d.get()))]
        self.com.sendOrderSafe('PIDL', args=arguments)
        arguments = [str(1000*float(self.pidr_p.get())),
                str(1000*float(self.pidr_i.get())),
                str(1000*float(self.pidr_d.get()))]
        self.com.sendOrderSafe('PIDR', args=arguments)

    def goto(self, gotox, gotoy):
        self.chaine.configure(text = "Goto : "+str(gotox)+" ; "+str(gotoy))
        #ENVOYER DATA PROTOCOLE 
        if self.fifo_switch.get() == 0: 
            #on clean la file a chaque nouvel ordre
            self.com.sendOrderSafe('CLEANG')

        arguments = [str(gotox), str(gotoy)]
        self.com.sendOrderSafe('GOTO', args=arguments)
    
    def gotoa(self, gotox, gotoy, gotoa):
        self.chaine.configure(text = "Gotoa : "+str(gotox)+" ; "+str(gotoy)+" ; "+str(gotoa))
        #ENVOYER DATA PROTOCOLE
        if self.fifo_switch.get() == 0:#on clean la file a chaque nouvel ordre
            self.com.sendOrderSafe('CLEANG')

        arguments = [str(gotox), str(gotoy), str(float(gotoa)*1000)]
        self.com.sendOrderSafe('GOTOA', args=arguments)

    def sendPwm(self, g, d, duration):
        self.chaine.configure(text = "pwm : "+str(g)+" ; "+str(d)+" ; "+str(duration))
        #ENVOYER DATA PROTOCOLE
        if self.fifo_switch.get() == 0:#on clean la file a chaque nouvel ordre
            self.com.sendOrderSafe('CLEANG')

        arguments = [str(g), str(d), str(duration)]
        self.com.sendOrderSafe('PWM', args=arguments)

    def pwm_handler(self):
        self.sendPwm(self.pwm_g.get(), self.pwm_d.get(), self.pwm_duration.get())

    def goto_handler(self):
        self.goto(self.gotox_e.get(), self.gotoy_e.get())

    def gotoa_handler(self):
        self.gotoa(self.gotox_e.get(), self.gotoy_e.get(), self.gotoang.get())

    def clic_goto(self, event):
        gotox = int((event.x/self.widthfen)*self.areax)
        gotoy = int(self.areay - (event.y/self.heightfen)*self.areay)
        self.goto(gotox, gotoy)

if __name__ == '__main__':
    if len(sys.argv) > 2:
        baud = sys.argv[2]
    elif len(sys.argv) == 2:
        baud = 57600
    else:
        print("$0 serial_path [baudrate]")
        exit(1)
    a = GUI(sys.argv[1], baud)    
