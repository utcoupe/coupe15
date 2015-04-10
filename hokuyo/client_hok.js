// TODO :
// 		  message/objet erreur ou pas ?
// 		  changer command

(function (){
	"use strict";

	/* JS which will connect to the server, and then
	*  will execute the C program to control the Hokuyos.
	*  It will transfer datas from the C Hokuyo controller to AI
	*/

	var log4js = require('log4js');
	var logger = log4js.getLogger('Client');
	var child_process = require('child_process');
	var child;
	var SocketClient = require('../server/socket_client.class.js');

	var server = ""; // server adress
	var client = new SocketClient({
		server_ip: server,
		type: "hokuyo"
	});


	client.order(function(from, name, params){
		logger.info("Just received an order `" + name + "` from " + from + " with params :");
		logger.info(params);
		switch (name){
			case "start":
				if(!!params.color && !!params.nbrobots)
					start(params.color, params.nbrobots);
				break;
			case "stop":
				quitC();
				break;
			default:
				logger.warn("Name not understood : " + data);
		}
	});

	function quitC(){
		if(!!child){
			logger.info("Closing child "+child.pid);
			child.kill('SIGINT');
			child = null;
		} else 
			logger.info("Can't close child : never born :P");
	}

	function start(color, nbrobots){
		// We just an order to start, with the flavour :P (color, number of robots)

		// If there's a child, kill it
		quitC();

		// Exit handlers
		//do something when app is closing
		process.on('exit', quitC);
		// catches ctrl+c event
		process.on('SIGINT', quitC);
		//catches uncaught exceptions
		process.on('uncaughtException', quitC);

		// Functions
		function parseRobots(string) {
			var dots = [];
			if(!!string){
				var temp = string.split("#");
				for (var i = 0; i <= temp.length - 1; i++) {
					temp[i] = temp[i].split(",");
					dots[i].x = parseInt(temp[i][0]);
					dots[i].y = 2000-parseInt(temp[i][1]); // Conversion repère math en repère bitmap
				}
				logger.info('[J-HOK] Robots');
				logger.info(dots);
			} else {
				logger.info('[J-HOK] No robot detected !');
			}

			// Send all robots
			client.send("ia", "position_tous_robots", {dots: dots});
		}

		function parseInfo(string) {
			switch (string.substring(0,1)){
				case "0":
					// Send error : no Hokuyo working
					client.send("ia", "nb_hokuyo", {nb: 0});
					break;
				case "1":
					// Send warning : one Hokuyo is missing
					client.send("ia", "nb_hokuyo", {nb: 1});
					break;
				case "2":
					// Send message : Hokuyos are ok
					client.send("ia", "nb_hokuyo", {nb: 2});
					break;
				default:
					logger.info("Error not understood : " + string);
			}
		}

		function dataFromCHandler(input) {
			// input format (XXXX type and xxxx values) : "[XXXX]xxxxxxxxx" maybe many times, seperated with \n

			var inputAr = input.toString().split('\n');
			
			for (var i = 0; i <= inputAr.length - 1; i++) {
				if (!!inputAr[i]){
					switch (inputAr[i].substring(1,5)){
						case "HI:)":
							// XXX send "C started" to server
							logger.info('C Hokuyo software says "Hi !" :)');
							// client.send("IA", "nb_hokuyo", {nb: 2});
							break;
						case "DATA":
							logger.info('C Hokuyo software sends datas');
							parseRobots(inputAr[i].substring(6));
							break;
						case "INFO":
							logger.info('C Hokuyo software sends a info');
							parseInfo(inputAr[i].substring(6));
							break;
						case "WARN":
							logger.info('C Hokuyo software sends a warning');
							parseInfo(inputAr[i].substring(6));
							break;
						default:
							logger.info("Data "+ inputAr[i].substring(1,5) + " not understood at line " + i + " : " + inputAr[i]);
					}
				}
			};
		}

		// Execute C program
		var command = "/home/mewen/Bureau/UTCoupe/coupe15/hokuyo/bin/hokuyo";
		var args = [color, 'no_init_wizard', nbrobots];
		// var options = // default : { cwd: undefined, env: process.env};
		logger.info('Launching : ' + command + ' ' + args);
		child = child_process.spawn(command, args);

		// Events
		child.stdout.on('data', function(data) {
			dataFromCHandler(data);
		});

		child.stderr.on('data', function(data) {
			logger.error(data.toString());
		});
		
		child.on('close', function(code) {
			if (code == 1)
				logger.info('Child closed correctly');
			else
				logger.info('Child closed with code: ' + code);
			// Send message XXX
		});
	};
})();