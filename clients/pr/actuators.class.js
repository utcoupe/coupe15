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
	function fake() {}
	// Order switch
	Acts.prototype.orderHandler = function (from, name, params, callback) {
		// logger.info("Just received an order `" + name + "` from " + from + " with params :");
		// logger.info(params);
		var that = this;
		// TODO : add a callback parameter to all functions (and call it)
		switch (name){
			// others
			case "prendre_plot":
				if (that.nb_plots==0){
					ax12.ouvrir(function() {
					others.ouvrirStabilisateurMoyen(function(){
					others.ouvrirBloqueurMoyen(function() {
					asserv.avancerPlot(function(){
					ax12.fermer(function() {
					others.monterUnPeuAscenseur(function() {
					others.monterAscenseur(function() {
					callback();
					others.fermerBloqueur(function() {
					ax12.ouvrir(function() {
					others.descendreAscenseur(function() {
					that.nb_plots++;
					}); }); }); }); }); }); }); }); }); });
				}
				else if(that.nb_plots==1){
					ax12.ouvrir(function() {
					others.ouvrirStabilisateurMoyen(function(){
					asserv.avancerPlot(function(){
					ax12.fermer(function() {
					others.monterUnPeuAscenseur(function() {
					others.ouvrirBloqueurMoyen(function() {
					others.monterAscenseur(function() {
					callback();
					others.fermerBloqueur(function() {
					ax12.ouvrir(function() {
					others.descendreAscenseur(function() {
					that.nb_plots++;
					}); }); }); }); }); }); }); }); }); });
				}
				else {
					ax12.ouvrir(function() {
					others.fermerStabilisateur(function(){
					asserv.avancerPlot(function(){
					ax12.fermer(function() {
					others.monterUnPeuAscenseur(function() {
					others.ouvrirBloqueurMoyen(function() {
					others.monterAscenseur(function() {
					callback();
					others.fermerBloqueur(function() {
					ax12.ouvrir(function() {
					others.descendreAscenseur(function() {
					that.nb_plots++;
					}); }); }); }); }); }); }); }); }); });					
				}
			break;

			case "prendre_balle":
				//
				callback();
			break;
			
			case "deposer_pile":
				setTimeout(function() {
					ax12.ouvrir(function() {
					others.ouvrirBloqueurGrand(function() {
					others.ouvrirStabilisateurGrand(function() {
					asserv.speed(callback, -200, 0, 1500);
					});});});
				}, 1000);
			break;
			case "prendre_gobelet":
				//asserv.avancerGobelet(function(){}); TODO
				callback();
			break;
			case "deposer_gobelet":
				//
				callback();
			break;
			case "fermer_pour_charger_balle":
				others.ouvrirStabilisateurGrand(fake);
				others.lacherGobelet(fake);
				others.fermerBloqueur(fake);
				ax12.fermer(fake);
				setTimeout(function() {
					others.fermerStabilisateur(callback);
				}, 5000);
			break;
			case "fermer_tout":
				others.fermerStabilisateur(function() {
				others.lacherGobelet(function() {
				others.fermerBloqueur(function() {
				others.descendreAscenseur(function() {
				ax12.fermer(function() {
					callback();
				}); }); }); }); });
			break;
			case "ouvrir_ax12":
				ax12.ouvrir(callback);
			break;
			case "monter_ascenseur":
				others.monterAscenseur(callback);
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
		}
	};

	return Acts;
})();