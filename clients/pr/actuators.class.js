module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.acts');

	var elevator = null;
	var servos = null;
	var asserv = null;
	var ax12 = null;

	function Acts() {
		this.start();
	}

	Acts.prototype.start = function(){
		// this.startArduino(this);
	};

	Acts.prototype.connectTo = function(struct){
		if (!!struct.stepper) {
			elevator = new (require('./elevator.class.js'))(
				new SerialPort(struct.stepper, { baudrate: 57600 })
			);
		}

		if (!!struct.servos) {
			servos = new (require('./servos.class.js'))(struct.servos);
		}

		if (!!struct.asserv) {
			asserv = new (require('./asserv.class.js'))(
				new SerialPort(struct.asserv, { baudrate: 57600 })
			);
		}

		if (!!struct.ax12) {
			ax12 = new (require('./ax12.class.js'))(struct.ax12);
		}
	};

	Acts.prototype.quit = function(){
		if (elevator)
			elevator.disconnect();

		if (servos)
			servos.disconnect();

		if (asserv)
			asserv.disconnect();

		if (ax12)
			ax12.disconnect();
	};

	// Order switch
	Acts.prototype.orderHandler = function (from, name, params, callback) {
		// logger.info("Just received an order `" + name + "` from " + from + " with params :");
		// logger.info(params);

		// TODO : add a callback parameter to all functions (and call it)
		switch (name){
			case "servo_goto":
				// logger.info(!!params.servo && !!params.position);
				// if(!!params.servo && !!params.position){ // /!\ problème si servo vaut 0 !!
					servos.servo_goto(params.servo, params.position, callback);
				// }
				break;
			case "stabs_close":
				servos.fermerStabilisateur(callback);
				break;
			case "stabs_open_chouilla":
				servos.ouvrirChouillaStabilisateur(callback);
				break;
			case "stabs_open":
				servos.ouvrirStabilisateur(callback);
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

	// Prendre plot
	// 

	return Acts;
})();