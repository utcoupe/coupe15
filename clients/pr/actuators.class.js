module.exports = (function () {
	var logger = require('log4js').getLogger('pr.acts');
	var serialPort = require("serialport");
	var SerialPort = serialPort.SerialPort;
	var spawn = require('child_process').spawn;

	var others = null;
	var asserv = null;
	var ax12 = null;
	var date = new Date();
	var lastSendStatus =  date.getTime();

	function Acts(client, sendChildren) {
		this.client = client;
		this.sendChildren = sendChildren;
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
				new SerialPort(struct.others, { baudrate: 57600 }),
				sendStatus
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
				}), this.client, 'pr', sendStatus
			);
		}

		if (!struct.ax12) {
			logger.fatal("Lancement de l'usb2ax pr en mode simu !");
			ax12 = new (require('./ax12.simu.class.js'))();
		} else {
			ax12 = new (require('./ax12.class.js'))(struct.ax12, sendStatus);
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

	Acts.prototype.sendStatus = function() {
		if(lastSendStatus <  date.getTime()-1000){
			this.sendChildren(this.getStatus);
			lastSendStatus =  date.getTime();
		}
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

		if(ax12 && ax12.ready)
			data.children.push("USB2AX");
		else
			data.status = "ok";

		if(asserv && asserv.ready)
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

	Acts.prototype.prendre_plot = function(callback){
		var that = this;
				if (that.nb_plots==0){
					ax12.ouvrir(function() {
					others.ouvrirStabilisateurMoyen(function(){
					others.ouvrirBloqueurMoyen(function() {
					// asserv.avancerPlot(function(){
					ax12.fermer(function() {
					others.monterUnPeuAscenseur(function() {
					others.monterAscenseur(function() {
					callback();
					others.fermerBloqueur(function() {
					ax12.ouvrir(function() {
					others.descendreAscenseur(function() {
					that.nb_plots++;
					}); }); }); }); }); }); }); }); });// });
				}
				else if(that.nb_plots==1){
					ax12.ouvrir(function() {
					others.ouvrirStabilisateurMoyen(function(){
					// asserv.avancerPlot(function(){
					ax12.fermer(function() {
					others.monterUnPeuAscenseur(function() {
					others.ouvrirBloqueurMoyen(function() {
					others.monterAscenseur(function() {
					callback();
					others.fermerBloqueur(function() {
					ax12.ouvrir(function() {
					others.descendreAscenseur(function() {
					that.nb_plots++;
					}); }); }); }); }); }); }); }); });// });
				}
				else if (that.nb_plots>=2){
					ax12.ouvrir(function() {
					others.fermerStabilisateur(function(){
					// asserv.avancerPlot(function(){
					ax12.fermer(function() {
					callback();
					others.monterUnPeuAscenseur(function() {
					others.ouvrirBloqueurMoyen(function() {
					others.fermerBloqueur(function() {
					that.nb_plots++;
					}); }); }); }); }); });// });
				}
				else {
					ax12.ouvrir(function() {
					others.fermerStabilisateur(function(){
					// asserv.avancerPlot(function(){
					ax12.fermer(function() {
					others.monterUnPeuAscenseur(function() {
					others.ouvrirBloqueurMoyen(function() {
					others.monterAscenseur(function() {
					callback();
					others.fermerBloqueur(function() {
					ax12.ouvrir(function() {
					others.descendreAscenseur(function() {
					that.nb_plots++;
					}); }); }); }); }); }); }); }); }); //});					
				}
	}

	// Order switch
	Acts.prototype.orderHandler = function (from, name, params, callback) {
		// logger.info("Just received an order `" + name + "` from " + from + " with params :");
		// logger.info(params);
		var that = this;
		// TODO : add a callback parameter to all functions (and call it)
		switch (name){
			// others
			case "prendre_plot":
				this.prendre_plot(callback);
			break;

			case "prendre_gobelet_et_2_plots_front":
				others.lacherGobelet(function(){
				asserv.goxy(250, 250, "arriere", function() {
				others.prendreGobelet(function(){
				asserv.goa(3.1416, function() {

				asserv.goxy(100, 250, "avant", function() { //100 au lieu de 90 pos plot
				that.prendre_plot(fake)

				asserv.goxy(100,250, "arriere", function(){
				asserv.goa(4.612388, function() {				
				asserv.goxy(90,160, "avant", function(){		//160 au lieu de 150
				that.prendre_plot(fake);
				callback();
				}); }); }); }); }); }); }); });
			break;

			case "prendre_balle":
				callback();
			break;



			case "prendre_balle":
				callback();
			break;
			

			case "deposer_pile_gobelet_prendre_balle_gauche":
				// setTimeout(function() {
					asserv.goa(2.3562, function() {
					others.descendreUnPeuAscenseur(function() {	
					ax12.ouvrir(function() {
					others.ouvrirBloqueurGrand(function() {
					others.ouvrirStabilisateurGrand(function() {
					asserv.goxy(650, 950, "arriere", function() {
					others.ouvrirBloqueurMoyen(function() {
					others.monterUnPeuAscenseur(function() {
					others.monterUnPeuAscenseur(function() {

					asserv.goxy(260, 1000, "osef", function() {
					asserv.goa(-3.1416/2, function() {
					asserv.pwm(50, 50, 1500,function() {
					asserv.calageY(874, -3.1416/2,function() {
					asserv.goxy(260, 1000, "arriere",function() {
					asserv.goa(3.1416, function() {

					asserv.goxy(160, 1000, "avant",function() {
					asserv.goa(3.1416,function() {
					ax12.fermerBalle(function() {
					asserv.goxy(260, 1000, "arriere",function() {
					others.descendreUnPeuAscenseur(function() {
					others.descendreUnPeuAscenseur(function() {
					ax12.ouvrir(function() {
					asserv.goxy(220, 1000, "avant", function() {
					ax12.fermerBalle2(function() {
					asserv.goxy(260, 1000, "arriere", function() {
					others.monterAscenseur(fake);
					asserv.goxy(600, 900, "avant", callback);
					});	});	});	});	}); });	}); });	});	}); });	}); }); }); });	});	});	}); }); });	}); }); }); }); });
				// }, 300);
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
				asserv.pwm(params.left, params.right, params.ms,callback);
			break;
			case "setvit":
				asserv.setVitesse(params.v, params.r,callback);
			break;
			case "clean":
				asserv.clean(callback);
			break;
			case "goa":
				asserv.goa(params.a,callback);
			break;
			case "goxy":
				asserv.goxy(params.x, params.y, params.sens,callback);
			break;
			case "setpos":
				asserv.setPos(params,callback);
			break;
			case "setacc":
				asserv.setAcc(params.acc,callback);
			break;
			case "setpid":
				asserv.setPid(params.p, params.i, params.d,callback);
			break;
			case "sync_git":
				spawn('/root/sync_git.sh', [], {
					detached: true
				});
			break;
			default:
				logger.warn("Order name " + name + " " + from + " not understood");
				callback();
		}
	};

	return Acts;
})();
