(function (){
	"use strict";

	var log4js = require('log4js');
	var logger = log4js.getLogger('Client');
	var SocketClient = require('../../server/socket_client.class.js');

	var server = ""; // server adress
	var client = new SocketClient({
		server_ip: server,
		type: "pr"
	});

	var five = require("johnny-five");
	var board = new five.Board({repl: false});
	var boardReady = false;

	board.on("ready", function() {
		boardReady = true;
		logger.info("Connected to board");
		this.servo = [];
		this.servo[0] = new five.Servo({
			pin: 10
		});
		this.servo[1] = new five.Servo({
			pin: 11,
			isInverted: true
		});
		// logger.info(this.servo);
	});

	board.on("error", function(e) {
		logger.error(e);
	});

	client.order(function(from, name, params){
		// Order handler
		// logger.info("Just received an order `" + name + "` from " + from + " with params :");
		// logger.info(params);
		switch (name){
			case "servo_goto":
				// logger.info(!!params.servo && !!params.position);
				// if(!!params.servo && !!params.position){ // /!\ problème si servo vaut 0 !!
					servo_goto(params.servo, params.position);
				// }
				break;
			default:
				logger.warn("Order name not understood : " + data);
		}
	});

	function servo_goto(servo, position){
		if (boardReady) {
			// logger.info("Servo " + servo + " moved to " + position*180 + " :)");
			board.servo[servo].to(position*180);
		}
	};
})();