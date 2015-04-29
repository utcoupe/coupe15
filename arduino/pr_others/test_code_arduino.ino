#include <Servo.h> 
#include <String.h>
#include <stdio.h>
#include "AFMotor.h"


AF_Stepper stepper(200, 1);
Servo H_servo1;  
Servo H_servo2;
Servo M_servo1;
Servo M_servo2;
Servo G_servo;
int i=0;
char maChaine[64];

void annalyse_chaine();


void setup() 
{  
  Serial.begin(57600);
  stepper.setSpeed(60); 
  
  // /!\  Pour éviter les conflits, il ne faut pas utiliser les PIN deja prisent par la shield !!!
  H_servo1.attach(24);  
  H_servo2.attach(25);
  M_servo1.attach(26);
  M_servo2.attach(27);
  G_servo.attach(28);
} 


void loop() 
{ 
  if (Serial.available()) {
    maChaine[i]= Serial.read(); 

    if (maChaine[i]=='\n'){
      maChaine[i]='\0';
      annalyse_chaine();
      i=0;
    }
    else{
      i++;
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
      Serial.print('H');
    }
    break;  

  case 'M':
    {
      int M_angle1, M_angle2;
      sscanf(maChaine,"M;%d;%d",&M_angle1,&M_angle2);
      M_servo1.write(M_angle1);
      M_servo2.write(M_angle2);  
      Serial.print('M');
    }
    break;

  case 'G':
    {
      int angle_gobelet;
      sscanf(maChaine,"G;%d",&angle_gobelet);
      G_servo.write(angle_gobelet);
      Serial.print('G');  
  }
    break;


  case 'S':
    {
      int pas;
      sscanf(maChaine,"S;%d",&pas);
      if(pas=0){
        stepper.release();
        Serial.print('S');
      }
      if(pas<0){
        pas=-pas;
        stepper.step(pas,FORWARD, DOUBLE);
        Serial.print('S');
      }
      else{
        stepper.step(pas,BACKWARD, DOUBLE);
        Serial.print('S');
      }
    }
    break;


  default:
    Serial.print('U');
  }
}





