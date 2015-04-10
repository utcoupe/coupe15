(function (){
	"use strict";

	var log4js = require('log4js');
	var logger = log4js.getLogger('Client');
	var child_process = require('child_process');
	var child;
	var SocketClient = require('../../server/socket_client.class.js');

	var ourPositions = {};

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
				if(!!child)
					quitC();
				break;
			default:
				logger.warn("Name not understood : " + data);
		}
	});

	function start(color, nbrobots){
		// We just an order to start, with the flavour :P (color, number of robots)
		if(!!child)
			quitC();

		// Exit handlers
		//do something when app is closing
		process.on('exit', quitC);
		//catches ctrl+c event
		// process.on('SIGINT', quitC);
		//catches uncaught exceptions
		process.on('uncaughtException', quitC);

		// Functions
		function parseRobots(string) {
			var dots = "";
			if(!!string){
				dots = string.split("#");
				for (var i = 0; i <= dots.length - 1; i++) {
					dots[i] = dots[i].split(",");
					dots[i][0] = dots[i][0];
					dots[i][1] = dots[i][1];
				};
				logger.info('[J-HOK] Robots');
				logger.info(dots);
			} else {
				logger.info('[J-HOK] No robot detected !');
			}

			// Send all robots
			client.send("IA", "position_tous_robots", {dots: dots});
		}

		function parseInfo(string) {
			switch (string.substring(0,1)){
				case "0":
					// Send error : no Hokuyo working
					client.send("IA", "nb_hokuyo", {nb: 0});
					break;
				case "1":
					// Send warning : one Hokuyo is missing
					client.send("IA", "nb_hokuyo", {nb: 1});
					break;
				case "2":
					// Send message : Hokuyos are ok
					client.send("IA", "nb_hokuyo", {nb: 2});
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
							parseRobots(inputAr[i].substring(6));
							break;
						case "WARN":
							parseInfo(inputAr[i].substring(6));
							break;
						default:
							logger.info("Data "+ inputAr[i].substring(1,5) + "not understood at line " + i + " : " + inputAr[i]);
					}
				}
			};
		}

		function quitC(){
			child.kill('SIGINT');
		}

		// Execute C program
		var command = "./bin/hokuyo";
		var args = [color, 'no_init_wizard', nbrobots];
		// var options = // default : { cwd: undefined, env: process.env};
		logger.info('Launching : ' + command + ' ' + args);
		child = child_process.spawn(command, args);

		// Events
		child.stdout.on('data', function(data) {
			dataFromCHandler(data);
		});

		child.stderr.on('data', function(data) {
			logger.error(data);
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