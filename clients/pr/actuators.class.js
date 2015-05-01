module.exports = (function () {
	var logger = require('log4js').getLogger('pr.acts');
	var serialPort = require("serialport");
	var SerialPort = serialPort.SerialPort;

	var others = null;
	var asserv = null;
	var ax12 = null;

	function Acts(client) {
		this.client = client;
		this.start();
		this.nb_plots = 0;
	}

	Acts.prototype.start = function(){
		// this.startArduino(this);
	};

	Acts.prototype.connectTo = function(struct){
		if (!struct.others) {
			logger.fatal("Lancement de others pr en mode simu !");
			others = new (require('./others.simu.class.js'))();
		} else {
			others = new (require('./others.class.js'))(
				new SerialPort(struct.others, { baudrate: 57600 })
			);
		}

		if (!struct.asserv) {
			logger.fatal("Lancement de l'asserv pr en mode simu !");
			asserv = new (require('../shared/asserv.simu.class.js'))(this.client, 'pr');
		} else {
			asserv = new (require('../shared/asserv.class.js'))(
				new SerialPort(struct.asserv, {
					baudrate: 57600,
					parser:serialPort.parsers.readline('\n')
				}), this.client, 'pr'
			);
		}

		if (!struct.ax12) {
			logger.fatal("Lancement de l'usb2ax pr en mode simu !");
			ax12 = new (require('./ax12.simu.class.js'))();
		} else {
			ax12 = new (require('./ax12.class.js'))(struct.ax12);
		}

		// Initialisation
		setTimeout(function() {
			others.ouvrirStabilisateurGrand(function() {
			others.lacherGobelet(function() {
			others.ouvrirBloqueurGrand(function() {
			others.descendreAscenseur(function() {
			ax12.ouvrir(function() {
				logger.fatal('BAZOOKA');
			}); }); }); }); });
		}, 1000);
	};

	Acts.prototype.getStatus = function(){
		var data = {
			"status": "",
			"children": []
		};

		data.status = "everythingIsAwesome";

		if(others)
			data.children.push("Arduino others");
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
		if (others)
			others.disconnect();

		if (asserv && asserv.ready)
			asserv.disconnect();

		if (ax12 && ax12.ready)
			ax12.disconnect();
	};

	// Order switch
	Acts.prototype.orderHandler = function (from, name, params, callback) {
		// logger.info("Just received an order `" + name + "` from " + from + " with params :");
		// logger.info(params);
		var that = this;
		// TODO : add a callback parameter to all functions (and call it)
		switch (name){
			// others
			case "prendre_plot":
				if (that.nb_plots<2){
					ax12.ouvrir(function() {
					others.ouvrirStabilisateurMoyen(function(){
					// asserv.avancerPlot(function(){
					ax12.fermer(function() {
					others.monterUnPeuAscenseur(function() {
					others.ouvrirBloqueurMoyen(function() {
					others.monterAscenseur(function() {
					others.fermerBloqueur(function() {
					ax12.ouvrir(function() {
					others.descendreAscenseur(function() {
					that.nb_plots++;
					callback();
					}); }); }); }); }); }); }); }); });// });
				}
				else {
					ax12.ouvrir(function() {
					others.fermerStabilisateur(function(){
					//asserv.avancerPlot(function(){  TODO
					ax12.fermer(function() {
					others.monterUnPeuAscenseur(function() {
					others.ouvrirBloqueurMoyen(function() {
					others.monterAscenseur(function() {
					others.fermerBloqueur(function() {
					ax12.ouvrir(function() {
					others.descendreAscenseur(function() {
					that.nb_plots++;
					callback();
					}); }); }); }); }); }); }); }); }); //});					
				}
			break;

			case "prendre_balle":
				//
				callback();
			break;
			
			case "deposer_pile":
				//
				callback();
			break;
			case "prendre_gobelet":
				//asserv.avancerGobelet(function(){}); TODO
				callback();
			break;
			case "deposer_gobelet":
				//
				callback();
			break;



			// Asserv
			case "pwm":
				asserv.pwm(callback, params.left, params.right, params.ms);
			break;
			case "setvit":
				asserv.setVitesse(callback, params.v, params.r);
			break;
			case "clean":
				asserv.clean(callback);
			break;
			case "goa":
				asserv.goa(callback, params.a);
			break;
			case "goxy":
				asserv.goxy(callback, params.x, params.y);
			break;
			case "setpos":
				asserv.setPos(callback, params);
			break;
			case "setacc":
				asserv.setAcc(callback, params.acc);
			break;
			case "setpid":
				asserv.setPid(callback, params.p, params.i, params.d);
			break;
			default:
				logger.warn("Order name " + name + " " + from + " not understood");
				callback();
			// case "servo_goto":
			// 	// logger.info(!!params.servo && !!params.position);
			// 	// if(!!params.servo && !!params.position){ // /!\ problème si servo vaut 0 !!
			// 		servos.servo_goto(params.servo, params.position, callback);
			// 	// }
			// 	break;
			// case "stabs_close":
			// 	servos.fermerStabilisateur(callback);
			// 	break;
			// case "stabs_open_chouilla":
			// 	servos.ouvrirChouillaStabilisateur(callback);
			// 	break;
			// case "stabs_open":
			// 	servos.ouvrirStabilisateur(callback);
			// 	break;
			// case "arm_close":
			// 	servos.fermerBras(callback);
			// 	break;
			// case "arm_open_chouilla":
			// 	servos.ouvrirChouillaBras(callback);
			// 	break;
			// case "arm_open":
			// 	servos.ouvrirBras(callback);
			// 	break;
			// case "AX12_goto":
			// 	AX12_goto(params.position);
			// 	break;


			// case "AX12_close":
			// 	ax12.closeAx12Down(callback);
			// 	break;
			// case "AX12_open":
			// 	ax12.openAx12Down(callback);
			// 	break;
			// case "steppers_move":
			// 	stepper_do(params.move, params.direction);
			// 	break;
			// case "steppers_toogle":
			// 	stepper_toogle();
			// 	break;
			// case "steppers_set_bottom":
			// 	stepper_setBottom();
			// 	break;
			// case "send_message":
			// 	client.send("pr", params.name, {action_name: params.action_name});
			// 	break;
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