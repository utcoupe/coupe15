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
		this.new_has_ball = false;
		this.has_gobelet = false;
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
				this.sendStatus
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
				}), this.client, 'pr', this.sendStatus
			);
		}

		if (!struct.ax12) {
			logger.fatal("Lancement de l'usb2ax pr en mode simu !");
			ax12 = new (require('./ax12.simu.class.js'))();
		} else {
			ax12 = new (require('./ax12.class.js'))(struct.ax12, this.sendStatus);
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
	Acts.prototype.delay = function(ms, callback){
		setTimeout(callback, ms);
	}

	Acts.prototype.prendre_plot = function(callback){
		var that = this;
				if (that.new_has_ball) {
					others.descendreUnPeuAscenseur(function() {
					ax12.ouvrir(function() {
					others.descendreAscenseur(function() {
					that.prendre_plot(callback);
					}); }); });
				}
				if (that.nb_plots==0) {
					ax12.ouvrir(function() {
					others.ouvrirBloqueurMoyen(function() {
					// asserv.avancerPlot(function(){
					ax12.fermer(function() {
					others.monterUnPeuAscenseur(function() {
					others.monterAscenseur(function() {
					callback();
					others.fermerBloqueur(function() {
					ax12.ouvrir(function() {
					others.ouvrirStabilisateurMoyen(function(){
					others.descendreAscenseur(function() {
					that.client.send('ia', 'pr.plot++');
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
					that.client.send('ia', 'pr.plot++');
					that.nb_plots++;
					}); }); }); }); }); }); }); }); });// });
				}
				else if (that.nb_plots>=4){
					ax12.ouvrir(function() {
					others.fermerStabilisateur(function(){
					// asserv.avancerPlot(function(){
					ax12.fermer(function() {
					callback();
					others.monterUnPeuAscenseur(function() {
					others.ouvrirBloqueurMoyen(function() {
					others.fermerBloqueur(function() {
					that.client.send('ia', 'pr.plot++');
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
					that.client.send('ia', 'pr.plot++');
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
			case "prendre_plot_rear_left":
				asserv.goxy(160, 1800, "avant", function() {
				that.prendre_plot(function() {
				callback();
				asserv.goxy(270, 1800, "arriere", fake);
				}); });
			break;
			case "prendre_plot_rear_left_calage":
				var x, time;
				if (that.new_has_ball) {
					pwm_time = 2000;
					x = 75;
				} else {
					pwm_time = 1500;
					x = 140;
				}
				asserv.pwm(50, 50, pwm_time, function() {
				asserv.calageX(x, 3.1416, function() {
				asserv.goxy(300, 1600, "arriere", function() {
				asserv.goxy(300, 1800, "osef", function() {
				asserv.goxy(160, 1800, "avant", function() {
				that.prendre_plot(function() {
				asserv.goa(1.5708, function() {
				asserv.pwm(50, 50, 1500, function() {
				asserv.calageY(1860, 1.5708, function() {
				asserv.speed(-300, 0, 750, function() {
				callback();
				}); }); }); }); }); }); }); }); }); });
			break;
			case "prendre_gobelet_et_2_plots_front":
				others.lacherGobelet(function(){
				asserv.goxy(275, 240, "arriere", function() {
				others.prendreGobelet(function(){
				that.has_gobelet = true;
				that.client.send('ia', 'pr.gobelet1');
				asserv.speed(500, 0, 500, function() { 
				asserv.goxy(175, 250, "avant", function() { //100 au lieu de 90 pos plot
				that.prendre_plot(function() {
				asserv.speed(-300, 0, 700, function() { 
				asserv.goxy(180,160, "avant", function(){		//160 au lieu de 150
				that.prendre_plot(function() {
				callback();
				}); }); }); }); }); }); }); }); });
			break;

			case "prendre_2_plots_stairs":
				asserv.goxy(810, 1740, "avant", function() {
				that.prendre_plot(function(){
				that.delay(1000, function() {
				asserv.goxy(830, 1855, "avant", function() {
				that.prendre_plot(function() {
				asserv.speed(-300, -100, 1000, function() {
				callback();
				}); }); }); }); }); });
			break;

			case "prendre_gobelet":
				others.lacherGobelet(function(){
				asserv.speed(-300, 0, 500,function() {
				others.prendreGobelet(function(){
				that.client.send('ia', 'pr.gobelet1');
				that.has_gobelet = true;
				callback();
				}); }); });
			break;

			case "deposer_pile_gobelet_prendre_balle_gauche":
				asserv.goa(2.3562, function() {
				others.descendreUnPeuAscenseur(function() {	
				ax12.ouvrir(function() {
				others.ouvrirBloqueurGrand(function() {
				others.ouvrirStabilisateurMoyen(function() {
				others.ouvrirStabilisateurGrand(function() {
				asserv.goxy(650, 950, "arriere", function() {
				others.ouvrirBloqueurMoyen(function() {
				others.ouvrirStabilisateurMoyen(function() {
				others.monterUnPeuAscenseur(function() {
				others.monterUnPeuAscenseur(function() {

				asserv.goxy(260, 1000, "osef", function() {
				asserv.goa(-3.1416/2, function() {
				asserv.pwm(50, 50, 1000,function() {
				asserv.calageY(874, -3.1416/2,function() {
				asserv.goxy(260, 1000, "arriere",function() {
				asserv.goa(3.1416, function() {

				asserv.goxy(200, 1000, "avant",function() {
				asserv.goa(3.1416,function() {
				asserv.pwm(50, 50, 1000,function() {
				asserv.calageX(142, 3.1416, function() {
				ax12.fermerBalle(function() {
				asserv.goxy(260, 1000, "arriere",function() {
				others.descendreUnPeuAscenseur(function() {
				others.descendreUnPeuAscenseur(function() {
				ax12.fermerBalle2(function() {
				asserv.goxy(260, 1000, "arriere", function() {
				others.monterAscenseur(fake);
				asserv.goxy(330, 1000, "avant", function() {
				asserv.goa(-0.1863, function() {
				others.lacherGobelet(function() {
				that.new_has_ball = true;
				that.client.send('ia', 'pr.plot0');
				that.client.send('ia', 'pr.gobelet0');
				that.nb_plots = 0;
				that.has_gobelet = false;
				asserv.goxy(600, 950, "avant", callback);
				});	});	});	});	}); });	}); });	});	}); });	}); }); }); });
				}); }); });	}); });	}); }); });	}); }); }); }); }); }); });
			break;

			case "deposer_pile_front":
				ax12.ouvrir(fake);
				others.monterUnPeuAscenseur(function() {
				others.monterUnPeuAscenseur(function() {
				asserv.pwm(80, 80, 1000, function() {
				asserv.calageY(240, -1.5708, function() {
				asserv.speed(-200, 0, 1000, function() {
				others.ouvrirBloqueurGrand(function() {
				others.ouvrirStabilisateurMoyen(function() {
				others.descendreUnPeuAscenseur(function() {
				others.descendreUnPeuAscenseur(function() {
				others.ouvrirStabilisateurGrand(fake);
				ax12.ouvrir(function() {
				asserv.speed(-300, 0, 750, callback);
				}); }); }); }); }); }); }); }); }); });
			break;

			case "deposer_gobelet_front_right":
				asserv.goxy(2840, 600, "avant", function() {
				asserv.goa(0, function() {
				asserv.goa(0, function() {
				asserv.pwm(80, 80, 1500, function() {
				asserv.calageX(2863, 0, function() {
				asserv.goxy(2800, 600, "arriere", function() {
				asserv.goa(1.5708, function() {
				others.monterUnPeuAscenseur(function() {
				others.monterUnPeuAscenseur(function() {
				asserv.pwm(80, 80, 1500, function() {
				asserv.calageY(704, 1.5708, function() {
				asserv.speed(-200, 0, 500, function() {
				asserv.goa(3.1416, function() {
				others.lacherGobelet(function() {
				that.client.send('ia', 'pr.gobelet0');
				asserv.speed(500, 0, 800, callback);
				});	});	});	});	}); });	}); });	});	}); }); }); }); });
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
				others.rangerClap(function() {
				ax12.fermer(function() {
					callback();
				}); }); }); }); }); });
			break;
			case "ouvrir_ax12":
				ax12.ouvrir(callback);
			break;
			case "monter_ascenseur":
				others.monterAscenseur(callback);
			break;
			case "clap_1":
				asserv.goa(3.1416, function() {
				others.sortirClap(function() {
				asserv.goxy(400, 140, "osef", function() {
				others.rangerClap(callback);
				}); }); });
			break;
			case "clap_3":
				asserv.goa(3.1416, function() {
				others.sortirClap(function() {
				asserv.goxy(1000, 140, "osef", function() {
				callback();
				others.rangerClap();
				}); }); });
			break;
			case "clap_5":
				asserv.goa(3.1416, function() {
				others.sortirClap(function() {
				asserv.goxy(2300, 140, "osef", function() {
				callback();
				others.rangerClap();
				}); }); });
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
				asserv.setPos(params, callback);
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


			// Debug
			case "AX12_close":
				ax12.fermer(callback);
			break;
			case "AX12_open":
				ax12.ouvrir(callback);
			break;
			default:
				logger.warn("Order name " + name + " " + from + " not understood");
				callback();
		}
	};

	return Acts;
})();
