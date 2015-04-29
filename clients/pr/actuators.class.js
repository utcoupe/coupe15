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

	Acts.prototype.getStatus = function(){
		var data = {
			"status": "",
			"children": []
		};

		data.status = "everythingIsAwesome";


		if(elevator && elevator.ready)
			data.children.push("Arduino steppers");
		else
			data.status = "ok";

		if(servos && servos.ready)
			data.children.push("Arduino servos");
		else
			data.status = "ok";

		if(ax12 && asserv.ready)
			data.children.push("USB2AX");
		else
			data.status = "ok";

		if(asserv && ax12.ready)
			data.children.push("Arduino asserv");
		else
			data.status = "error";

		return data;
	};

	Acts.prototype.quit = function(){
		if (elevator && elevator.ready)
			elevator.disconnect();

		if (servos && servos.ready)
			servos.disconnect();

		if (asserv && asserv.ready)
			asserv.disconnect();

		if (ax12 && ax12.ready)
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
			case "arm_close":
				servos.fermerBras(callback);
				break;
			case "arm_open_chouilla":
				servos.ouvrirChouillaBras(callback);
				break;
			case "arm_open":
				servos.ouvrirBras(callback);
				break;
			// case "AX12_goto":
			// 	AX12_goto(params.position);
			// 	break;
			case "AX12_close":
				ax12.closeAx12Down(callback);
				break;
			case "AX12_open":
				ax12.openAx12Down(callback);
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
			case "send_message":
				client.send("pr", params.name, {action_name: params.action_name});
				break;
			default:
				logger.warn("Order name " + name + " " + from + " not understood");
		}
	};

	// prendre_balle (avancer + prendre)

	// ouvrir_baton_droit
	// avancer_clap
	// fermer_baton_droit
	// ouvrir_baton_gauche
	// fermer_baton_gauche

	// prendre_gobelet

	// prendre_plot
		// ouvrir pieds
		// avancer
		// fermer pieds
		// monter...

	return Acts;
})();