module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.elevator');
	var serialPort = require("serialport");
	var SerialPort = serialPort.SerialPort;

	var ID_ARDUINO =			'S'; // Like Stepper

	var ORDER_ACHIEVED =		'K'; // Like Ok
	var ORDER_UNKNOWN =			'U'; // Like Unknown

	var ELEV1_MOVE_UP =			'a';
	var ELEV1_MOVE_DOWN =		'b';
	var ELEV1_RELEASE =			'c';
	var ELEV2_MOVE_UP =			'z';
	var ELEV2_MOVE_DOWN =		'y';
	var ELEV2_RELEASE =			'x';

	function Elevator(sp) {
		// sp is Serial Port OBJECT
		this.sp = sp;
		this.ready = true;
		this.pos1 = 'down';
		this.pos2 = 'down';
		this.orders_sent = [];

		this.sp.on("data", function(data) {
			this.parseOrder(data.toString());
		}.bind(this));
	}

	// Fonctions for sending orders to the Arduino
	Elevator.prototype.sendOrder = function(order) {
		this.sp.write(order);
		this.orders_sent.push(order);
	};

	Elevator.prototype.disconnect = function() {
		this.sp.close();
		this.ready = false;
	};

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
	};

	Elevator.prototype.move1Up = function() {
		this.sendOrder(ELEV1_MOVE_UP);
	};

	Elevator.prototype.move1Down = function() {
		this.sendOrder(ELEV1_MOVE_DOWN);
		this.release1();
	};

	Elevator.prototype.release1 = function() {
		this.sendOrder(ELEV1_RELEASE);
	};

	Elevator.prototype.move2Up = function() {
		this.sendOrder(ELEV2_MOVE_UP);
	};

	Elevator.prototype.move2Down = function() {
		this.sendOrder(ELEV2_MOVE_DOWN);
		this.release2();
	};

	Elevator.prototype.release2 = function() {
		this.sendOrder(ELEV2_RELEASE);
	};


	
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