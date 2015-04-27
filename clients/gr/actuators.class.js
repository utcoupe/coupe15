module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('gr.acts');
	var serialPort = require("serialport");
	var SerialPort = serialPort.SerialPort;

	var servos = null;
	var asserv = null;

	function Acts(client) {
		this.start();
		this.client = client;
	}

	Acts.prototype.start = function(){
		// this.startArduino(this);
	};

	Acts.prototype.connectTo = function(struct){
		if (!!struct.servos) {
			servos = new (require('./servos.class.js'))(struct.servos);
		}
		if (!struct.asserv) {
			asserv = new (require('../shared/asserv.simu.class.js'))(this.client);
		} else {
			asserv = new (require('../shared/asserv.class.js'))(
				new SerialPort(struct.asserv, { baudrate: 57600 }, this.client)
			);
		}
	};

	Acts.prototype.quit = function(){
		if (!!servos)
			servos.disconnect();
		if (!!asserv)
			asserv.disconnect();
	};

	// Order switch
	Acts.prototype.orderHandler = function (from, name, params, callback) {
		// logger.info("Just received an order `" + name + "` from " + from + " with params :");
		logger.info(name, params);

		// TODO : add a callback parameter to all functions (and call it)
		switch (name){
			// Others
			case "acheter":
				servos.acheter(callback);
			break;
			case "vendre":
				servos.vendre(callback);
			break;
			// Asserv
			case "pwm":
				asserv.pwm(callback, params.left, params.right, params.ms);
			break;
			case "goa":
				asserv.goa(callback, params);
			break;
			case "setpos":
				asserv.setPos(callback, params);
			break;
			default:
				logger.warn("Order name " + name + " " + from + " not understood");
				callback();
		}
	};

	// Pas à pas
		function stepper_do(move, direction){
			// direction is given for the left motor as it sees it
			if (ia.arduinos.zero.ready) {
				if (direction == "clockwise"){
					logger.info("Moving "+move+" clockwise");
					board.stepper[0].rpm(120).cw().step(move, function(){}); // left
					// board.stepper[1].rpm(60).cw().step(600, function(){}); // right
				} else {
					logger.info("Moving "+move+" counterclockwise");
					// board.stepper[0].rpm(120).cw(); // change rien
					// board.stepper[1].rpm(120).cw();
					board.stepper[0].rpm(120).ccw().step(move, function(){}); // left
					// board.stepper[1].rpm(600).ccw().step(600, function(){}); // right
				}
			}
		}

		function stepper_setBottom(){
			board.stepper[0].is = "down";
		}

		function stepper_toogle(){
			if (ia.arduinos.zero.ready) {
				if (board.stepper[0].is == "up"){
					stepper_do(250, "clockwise");
					board.stepper[0].is = "down";
				} else {
					if (board.stepper[0].is == "down") {
						stepper_do(250, "counterclockwise");
						board.stepper[0].is = "up";
					}
				}
			}
		}
	return Acts;
})();