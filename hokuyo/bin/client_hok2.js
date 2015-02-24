(function (){
	"use strict";

	/* JS which will connect to the server, and then
	*  will execute the C program to control the Hokuyos.
	*  It will transfer datas from/to AI and the C Hokuyo controller
	*/


	var net = require('net'); // UNIX socket
	var util = require("util"); // var_dump like functions
	var child_process = require('child_process');
	var spawn = child_process.spawn;

	var ourPositions = {};

	// var server = "192.168.0.0/client/client"; // server adress

	// on('connection') XXX

		// ask for color, # of robots... XXX

		// on('got_answer') XXX

			// Exit handlers
			//do something when app is closing
			process.on('exit', quitC);
			//catches ctrl+c event
			process.on('SIGINT', quitC);
			//catches uncaught exceptions
			process.on('uncaughtException', quitC);

			// Functions
			function parseRobots(string) {
				var dots = string.split("#");
				for (var i = dots.length - 1; i >= 0; i--) {
					dots[i] = dots[i].split(",");
					dots[i][0] = parseInt(dots[i][0]);
					dots[i][1] = parseInt(dots[i][1]);
				};
				console.log('[J-HOK] Robots');
				console.log(dots);

				// Delete our robots XXX

				// Send ennemy robots only XXX
			}

			function dataFromCHandler(input) {
				// input format (XXXX type and xxxx values) : "[XXXX]xxxxxxxxx" maybe many times, seperated with \n

				var inputAr = input.toString().split('\n');

				for (var i = inputAr.length - 1; i >= 0; i--) {
					switch (inputAr[i].substring(1,5)){
						case "DATA":
							parseRobots(inputAr[i].substring(6));
							break;
						case "HI:)":
							// XXX send "C started" to server
							console.log('C Hokuyo software says "Hi !" :)');
							break;
					}
				};
			}

			// function dataFromServerHandler(data) {
			// 	if (data.type == "ourPositions"){
			// 		ourPositions = data.content;
			// 	}else if (data.type == "stop"){
			// 		quitC();
			// 	}
			// }

			function quitC(){
				child.kill('SIGINT');
			}

			// Execute C program
			var command = "./hokuyo";
			var color = "green"; // just recieved
			var init_wizard = 'no_init_wizard'; // idem
			var nbr_hok = '4';
			var args = [color, init_wizard, nbr_hok];
			// var options = // default : { cwd: undefined, env: process.env};
			console.log('Launching : ' + command + ' ' + args);
			var child = spawn(command, args);

			// Send message "child is conected" XXX
			// console.log("Child is connected ? : " + );

			// Events
			child.stdout.on('data', function(data) {
				dataFromCHandler(data);
			});

			child.stderr.on('data', function(data) {
				console.log('stderr: ' + data);
			});
			
			child.on('close', function(code) {
				console.log('\nChild closed with code: ' + code);
				// send message XXX
			});
})();