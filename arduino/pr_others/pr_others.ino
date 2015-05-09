#include <Servo.h>
#include <stdio.h>
#include "AFMotor.h"


AF_Stepper stepper(200, 1);
Servo H_servo1; //vue de face ==> gauche 
Servo H_servo2; //vue de face ==> droite
Servo M_servo1; //vue de face ==> gauche
Servo M_servo2; //vue de face ==> droite
Servo G_servo;
Servo C_servo;


int i=0;
char maChaine[64];

void annalyse_chaine();


void setup() 
{  
  Serial.begin(57600);
  Serial.write('O');

  stepper.setSpeed(60); 
  // /!\  Pour éviter les conflits, il ne faut pas utiliser les PIN deja prisent par la shield !!!
  H_servo1.attach(2);  //2 5 6 9 10  OK
  H_servo2.attach(5);  //13=led BOF BOF
  M_servo1.attach(6);  //3 4=vibre 7 8 11 12 !OK
  M_servo2.attach(9);
  G_servo.attach(10);
  C_servo.attach(13);

  H_servo1.write(136); 
  H_servo2.write(1); 
  M_servo1.write(80);
  M_servo2.write(150);
  G_servo.write(40);
  C_servo.write(40);
} 


void loop() 
{ 
  if (Serial.available()) {
    maChaine[i]= Serial.read(); 

    if (maChaine[i]=='\n' || maChaine[i]=='\r'){
      maChaine[i]='\0';
      annalyse_chaine();
      i=0;
    }
    else{
      i = ++i % 64;
    }
  }
  delay(10);
}


void annalyse_chaine(){
  switch(maChaine[0])
  {
  case 'H':
    {
      int H_angle1, H_angle2;
      sscanf(maChaine,"H;%d;%d",&H_angle1,&H_angle2);
      H_servo1.write(H_angle1);
      H_servo2.write(H_angle2);
      delay(50); 
      Serial.print('H');
    }
    break;  

  case 'M':
    {
      int M_angle1, M_angle2;
      sscanf(maChaine,"M;%d;%d",&M_angle1,&M_angle2);
      M_servo1.write(M_angle1);
      M_servo2.write(M_angle2);
      delay(300); 
      Serial.print('M');
    }
    break;

  case 'G':
    {
      int angle_gobelet;
      sscanf(maChaine,"G;%d",&angle_gobelet);
      G_servo.write(angle_gobelet);
      delay(300); 
      Serial.print('G');  
    }
    break;
 
  case 'O':
    {
      Serial.print('O');  
    }
    break;


  case 'C':
    {
      int angle_clap;
      sscanf(maChaine,"C;%d",&angle_clap);
      C_servo.write(angle_clap);
      delay(300); 
      Serial.print('C');  
    }
    break;
 
  case 'S':
    {
      int pas;
      sscanf(maChaine,"S;%d",&pas);
      if(pas==0){
        stepper.release();
      }
      if(pas<0){
        stepper.setSpeed(60);
        stepper.step(-pas,FORWARD, DOUBLE);
      }
      else{
        stepper.setSpeed(120);
        stepper.step(pas,BACKWARD, DOUBLE);
      }
      Serial.print('S');
      //Serial.print("S:");
      //Serial.println(pas);
    }
    break;
  default:
    Serial.print('U');
  }
}







