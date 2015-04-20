module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.elevator');
	var serialPort = require("serialport");
	var SerialPort = serialPort.SerialPort

	var ID_ARDUINO =			'S'; // Like Stepper

	var ORDER_ACHIEVED =		'K'; // Like Ok
	var ORDER_UNKNOWN =			'U'; // Like Unknown

	var ELEV1_MOVE_UP =			'a';
	var ELEV1_MOVE_DOWN =		'b';
	var ELEV1_RELEASE =			'c';
	var ELEV2_MOVE_UP =			'z';
	var ELEV2_MOVE_DOWN =		'y';
	var ELEV2_RELEASE =			'x';

	function Elevator(name) {
		this.sp = null;
		this.ready = false;
		this.pos1 = 'down';
		this.pos2 = 'down';
		this.orders_sent = [];

		// this.connectToArduino();
		this.arduinoFound(name);
	}

	// Fonctions for sending orders to the Arduino
	Elevator.prototype.sendOrder = function(order) {
		this.sp.write(order);
		this.orders_sent.push(order);
	}
	Elevator.prototype.parseOrder = function(order) {
		if(order == ORDER_ACHIEVED) {
			switch(this.orders_sent.shift()) {
				case ELEV1_MOVE_UP:
					this.pos1 = 'up';
					logger.info("Elevator 1 is up");
				break;
				case ELEV1_MOVE_DOWN:
					this.pos1 = 'down';
					logger.info("Elevator 1 is down");
				break;
				case ELEV2_MOVE_UP:
					this.pos2 = 'up';
					logger.info("Elevator 2 is up");
				break;
				case ELEV2_MOVE_DOWN:
					this.pos2 = 'down';
					logger.info("Elevator 2 is down");
				break;
			}
		} else if (order == ORDER_UNKNOWN) {
			oldest_order = this.orders_sent.shift();
			logger.warn("Order sent unknown: "+this.orders_sent.shift());
		} else {
			logger.warn("Order received unknown: "+order);
		}
	}
	Elevator.prototype.move1Up = function() {
		this.sendOrder(ELEV1_MOVE_UP);
	}
	Elevator.prototype.move1Down = function() {
		this.sendOrder(ELEV1_MOVE_DOWN);
		this.release1();
	}
	Elevator.prototype.release1 = function() {
		this.sendOrder(ELEV1_RELEASE);
	}
	Elevator.prototype.move2Up = function() {
		this.sendOrder(ELEV2_MOVE_UP);
	}
	Elevator.prototype.move2Down = function() {
		this.sendOrder(ELEV2_MOVE_DOWN);
		this.release2();
	}
	Elevator.prototype.release2 = function() {
		this.sendOrder(ELEV2_RELEASE);
	}

	// Fonctions for detecting the Arduino
	Elevator.prototype.connectToArduino = function() {
		var sp = [];
		// On check tous les ports disponibles
		serialPort.list(function (err, ports) {
			for(var i in ports) {
				sp[i] = new SerialPort(ports[i].comName);
				sp[i].on("data", function (i, data) {
					console.log(i, data.toString());
					if(data == ID_ARDUINO) { // S comme Stepper
						this.arduinoFound(ports[i].comName);
					}
				}.bind(this, i));
				sp[i].on("error", function() {}); // Node JS Error if it doesn't exist (and if an "error" event is sent)
			}
		}.bind(this));
		setTimeout(function() { this.arduinoNotFound(); }.bind(this), 3000);
	}
	Elevator.prototype.arduinoFound = function(name) {
		this.ready = true;
		this.sp = new SerialPort(name);
		this.sp.on("data", function(data) {
			this.parseOrder(data.toString());
		}.bind(this));

		// TODO close others serial port

		setTimeout(function() {
			this.move1Up();
			this.move1Down();
		}.bind(this), 1000);
		logger.info("Arduino Stepper found at: "+name);
	}
	Elevator.prototype.arduinoNotFound = function() {
		if(!this.ready) {
			logger.error("Arduino Stepper not found.");
			process.exit(1);
		}
	}

	// Tests
	// elev = new Elevator();
	// setTimeout(function() {
	// 	logger.info("Démarrage");
	// 	elev.move1Up();
	// 	elev.move1Down();
	// 	elev.move1Up();
	// 	elev.move1Down();
	// 	elev.release1();
	// }, 1000);

	return Elevator;
})();