#!/bin/sh
# echo "Launching Hokuyo Node.JS app..."
sudo LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH node /home/pi/coupe15/hokuyo/client_hok.js &
