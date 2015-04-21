module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('clientpr.acts');

	var elevator = null;
	var servos = null;
	var asserv = null;
	var ax12 = null;

	function Acts() {
		this.arduinos = {};
		this.ax12 = {};
		this.servos = {};
		
		this.start();
	}

	Acts.prototype.start = function(){
		// this.startArduino(this);
	};

	Acts.prototype.connectTo = function(struct){
		if (!!struct.stepper) {
			elevator = new (require('./elevator.class.js'))(
				new SerialPort(struct.stepper, { baudrate: 57600 });
			);
		}

		if (!!struct.servos) {
			servos = new (require('./servos.class.js'))(struct.servos);
		}

		if (!!struct.asserv) {
			asserv = new (require('./asserv.class.js'))(
				new SerialPort(struct.asserv, { baudrate: 57600 });
			);
		}

		if (!!struct.ax12) {
			ax12 = new (require('./ax12.class.js'))(struct.ax12);
		}
	};

	Acts.prototype.quit = function(){
		if (this.elevator)
			this.elevator.disconnect();

		if (this.servos)
			this.servos.disconnect();

		if (this.asserv)
			this.asserv.disconnect();

		if (this.ax12)
			this.ax12.disconnect();
	};

	// Order switch
	Acts.prototype.orderHandler = function (from, name, params, callback) {
		logger.info("Just received an order `" + name + "` from " + from + " with params :");
		logger.info(params);

		// TODO : add a callback parameter to all functions (and call it)
		switch (name){
			case "servo_goto":
				// logger.info(!!params.servo && !!params.position);
				// if(!!params.servo && !!params.position){ // /!\ problème si servo vaut 0 !!
					servo_goto(params.servo, params.position);
				// }
				break;
			case "servo_close":
				servo_close();
				break;
			case "servo_open":
				servo_open();
				break;
			case "AX12_goto":
				AX12_goto(params.position);
				break;
			case "AX12_close":
				AX12_close();
				break;
			case "AX12_open":
				AX12_open();
				break;
			case "steppers_move":
				stepper_do(params.move, params.direction);
				break;
			case "steppers_toogle":
				stepper_toogle();
				break;
			case "steppers_set_bottom":
				stepper_setBottom();
				break;
			// case "orders_array":
			// 	ordersArrayHandler(params.orders);
			// 	break;
			case "send_message":
				client.send("pr", params.name, {action_name: params.action_name});
				break;
			default:
				logger.warn("Order name " + name + " " + from + " not understood");
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