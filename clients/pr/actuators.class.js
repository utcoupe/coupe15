module.exports = (function () {
	var logger = require('log4js').getLogger('pr.acts');
	var serialPort = require("serialport");
	var SerialPort = serialPort.SerialPort;
	var spawn = require('child_process').spawn;
	var fifo = new (require('../shared/fifo.class.js'))();

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
		
	};

	Acts.prototype.clean = function(){
		fifo.clean();  // A priori déjà vide
		asserv.clean();
		ax12.ouvrir();
		others.ouvrirStabilisateurGrand();
		others.ouvrirBloqueurGrand();
	};

	Acts.prototype.connectTo = function(struct){
		if (!struct.others) {
			logger.fatal("Lancement de others pr en mode simu !");
			others = new (require('./others.simu.class.js'))(fifo);
		} else {
			others = new (require('./others.class.js'))(
				new SerialPort(struct.others, { baudrate: 57600 }),
				this.sendStatus,
				fifo
			);
		}

		if (!struct.asserv) {
			logger.fatal("Lancement de l'asserv pr en mode simu !");
			asserv = new (require('../shared/asserv.simu.class.js'))(this.client, 'pr', fifo);
		} else {
			asserv = new (require('../shared/asserv.class.js'))(
				new SerialPort(struct.asserv, {
					baudrate: 57600,
					parser:serialPort.parsers.readline('\n')
				}), this.client, 'pr', this.sendStatus, fifo
			);
		}

		if (!struct.ax12) {
			logger.fatal("Lancement de l'usb2ax pr en mode simu !");
			ax12 = new (require('./ax12.simu.class.js'))(fifo);
		} else {
			ax12 = new (require('./ax12.class.js'))(struct.ax12, this.sendStatus, fifo);
		}

		// Initialisation
		setTimeout(function() {
			others.ouvrirStabilisateurGrand();
			others.lacherGobelet();
			others.ouvrirBloqueurGrand();
			others.descendreAscenseur();
			ax12.ouvrir(function() {
				logger.fatal('BAZOOKA');
			});
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

		if(others && !!others.ready)
			data.children.push("Arduino others");
		else
			data.status = "ok";

		if(ax12 && !!ax12.ready)
			data.children.push("USB2AX");
		else
			data.status = "ok";

		if(asserv && !!asserv.ready)
			data.children.push("Arduino asserv");
		else
			data.status = "error";

		return data;
	};

	Acts.prototype.quit = function(){
		if (ax12 && ax12.ready)
			ax12.disconnect();
	};

	function fake() {}
	Acts.prototype.delay = function(ms, callback){
		fifo.newOrder(function() {
			setTimeout(function() {
				if(callback !== undefined)
					callback();
				fifo.orderFinished();
			}, ms);
		}, 'delay');
	}

	Acts.prototype.prendre_plot = function(callback){
		if(callback === undefined) {
			callback = function() {};
		}
		var that = this;
		if (that.new_has_ball) {
			that.new_has_ball = false;
			others.descendreUnPeuAscenseur();
			ax12.ouvrir();
			others.descendreAscenseur();
			that.prendre_plot(callback);
		}
		else if (that.nb_plots==0) {
			ax12.ouvrir();
			others.ouvrirBloqueurMoyen();
			ax12.fermer();
			others.monterAscenseur(function() {
				that.client.send('ia', 'pr.plot++');
				setTimeout(callback, 200);
			});
			others.fermerBloqueur();
			ax12.ouvrir();
			others.ouvrirStabilisateurMoyen(function() {}, 0);
			others.descendreAscenseur();
		}
		else if(that.nb_plots==1){
			ax12.ouvrir();
			others.ouvrirStabilisateurMoyen();
			ax12.fermer();
			others.ouvrirBloqueurMoyen();
			others.monterAscenseur(function() {
				that.client.send('ia', 'pr.plot++');
				setTimeout(callback, 200);
			});
			others.fermerBloqueur();
			ax12.ouvrir(function() {});
			others.descendreAscenseur();
		}
		else if (that.nb_plots>=4){
			ax12.ouvrir();
			others.fermerStabilisateur();
			ax12.fermer();
			others.monterUnPeuAscenseur(function() {
				that.client.send('ia', 'pr.plot++');
				callback();
			});
			others.ouvrirBloqueurMoyen();
			others.fermerBloqueur();
		}
		else {
			ax12.ouvrir();
			others.ouvrirStabilisateurMoyen();
			ax12.fermer();
			others.ouvrirBloqueurMoyen();
			others.monterAscenseur(function() {
				that.client.send('ia', 'pr.plot++');
				setTimeout(callback, 200);
			});
			others.fermerStabilisateur(fake,0);
			others.fermerBloqueur();
			ax12.ouvrir(function() {});
			others.descendreAscenseur();
		}
		that.nb_plots++;
	}

	Acts.prototype.prendre_plot2 = function(callback){
		if(callback === undefined) {
			callback = function() {};
		}
		var that = this;
		asserv.speed(300, 0, 750);
		if (that.new_has_ball) {
			that.new_has_ball = false;
			others.descendreUnPeuAscenseur();
			ax12.ouvrir();
			others.descendreAscenseur();
			that.prendre_plot(callback);
		}
		else {

			ax12.ouvrir();
			ax12.fermer();
			others.monterUnPeuAscenseur(function() {
				that.client.send('ia', 'pr.plot++');
				callback();
			});
		}
		
		that.nb_plots++;
	}

	Acts.prototype.monter_plot2 = function(callback){
		if(callback === undefined) {
			callback = function() {};
		}
		var that = this;

		callback();
		if (that.nb_plots == 1) {
			others.ouvrirBloqueurMoyen();
			others.monterAscenseur();
			others.fermerBloqueur();
			others.fermerStabilisateur();
			ax12.ouvrir();
			others.descendreAscenseur();
		} else {
			others.ouvrirStabilisateurMoyen();
			others.ouvrirBloqueurMoyen();
			others.monterAscenseur();
			others.fermerBloqueur();
			others.fermerStabilisateur();
			ax12.ouvrir();
			others.descendreAscenseur();
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
			case "placer":
				asserv.setPid(0.25, 130, 13);
				asserv.goxy(500, 940);
				asserv.goa(-0.62);
				this.orderHandler('ia','fermer_tout', {}, callback);
			break;
			case "prendre_plot":
				this.prendre_plot(callback);
			break;
			case "prendre_plot2":
				this.prendre_plot2(callback);
			break;
			case "monter_plot2":
				this.monter_plot2(callback);
			break;
			case "reset_nb_plots":
				this.nb_plots = 0;
				callback();
			break;	
			case "prendre_plot_rear_left":
				asserv.goxy(140, 1800, "avant");
				that.prendre_plot();
				asserv.goxy(270, 1800, "arriere", callback);
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
				asserv.pwm(50, 50, pwm_time);
				asserv.calageX(x, 3.1416);
				asserv.goxy(300, 1600, "arriere");
				asserv.goxy(300, 1800, "osef");
				asserv.goxy(160, 1800, "avant");
				that.prendre_plot();
				asserv.goa(1.5708);
				asserv.pwm(50, 50, 1500);
				asserv.calageY(1860, 1.5708);
				asserv.speed(-300, 0, 750, callback);
			break;
			case "prendre_gobelet_et_2_plots_front":
				others.lacherGobelet(fake,0);
				asserv.goxy(275, 240, "arriere");
				others.prendreGobelet(function() {
					that.has_gobelet = true;
					that.client.send('ia', 'pr.gobelet1');
				});
				asserv.speed(500, 0, 500); 
				asserv.goxy(175, 250, "avant"); //100 au lieu de 90 pos plot
				that.prendre_plot();
				asserv.speed(-300, 0, 700); 
				asserv.goxy(185, 160, "avant");
				that.prendre_plot(callback);
			break;

			case "prendre_2_plots_stairs":
				asserv.goxy(803, 1745, "avant");
				that.prendre_plot();
				that.delay(1000);
				asserv.goxy(825, 1860, "avant");
				that.prendre_plot();
				asserv.speed(-300, -100, 1000, callback);
			break;

			case "prendre_gobelet":
				others.lacherGobelet(fake,0);
				asserv.speed(-300, 0, 500);
				others.prendreGobelet(function() {
					that.client.send('ia', 'pr.gobelet1');
					that.has_gobelet = true;
					callback();
				});
			break;

			case "deposer_pile_gobelet_prendre_balle_gauche":
				asserv.goxy(300, 1000, "avant");
				//asserv.goa(-2.3562);
				others.descendreUnPeuAscenseur();
				ax12.ouvrir();
				others.ouvrirBloqueurGrand(fake,0);
				others.ouvrirStabilisateurGrand();
				others.lacherGobelet();
				/*asserv.goxy(700, 1300, "arriere", function() {
					that.client.send('ia', 'data.add_dynamic', {pos:{x:450, y:880}, d:8});
				});
				others.ouvrirBloqueurMoyen(fake,0);
				others.ouvrirStabilisateurMoyen(fake,0);
				others.monterMoyenAscenseur();

				asserv.goxy(260, 1050, "osef");
				asserv.goa(3.1416/2);
				asserv.pwm(50, 50, 1500);
				asserv.calageY(1126, 3.1416/2);
				asserv.goxy(260, 1000, "arriere");
				asserv.goa(3.1416);

				asserv.goxy(200, 1000, "avant");
				asserv.goa(3.1416);
				asserv.pwm(50, 50, 1500);
				asserv.calageX(145, 3.1416);
				ax12.fermerBalle();
				asserv.goxy(260, 1000, "arriere");
				others.descendreMoyenAscenseur();
				ax12.fermerBalle2();
				asserv.goxy(260, 1000, "arriere");
				others.monterAscenseur();
				asserv.goxy(330, 1000, "avant");
				asserv.goa(0.1863);
				others.lacherGobelet();
				that.delay(100);
				that.new_has_ball = true;
				that.client.send('ia', 'pr.plot0');
				that.client.send('ia', 'pr.gobelet0');
				that.nb_plots = 0;
				that.has_gobelet = false;
				asserv.goxy(600, 1050, "avant", callback);*/
			break;

			case "deposer_pile_gobelet":
				asserv.goxy(170, 1000, "avant");
				others.descendreUnPeuAscenseur();
				ax12.ouvrir();
				others.ouvrirBloqueurMoyen(fake,0);
				others.ouvrirStabilisateurGrand();
				that.delay(100);
				others.ouvrirBloqueurGrand(fake,0);

				asserv.goxy(300, 1000, "arriere");
				asserv.goa(0);
				others.lacherGobelet();
				that.delay(100, callback);
			break;

			case "deposer_pile":
				asserv.goxy(450, 1000, "avant");
				others.descendreUnPeuAscenseur();
				ax12.ouvrir();
				others.ouvrirBloqueurMoyen(fake,0);
				others.ouvrirStabilisateurGrand();
				that.delay(100);
				others.ouvrirBloqueurGrand();
			break;

			case "deposer_pile_front_calage":
				ax12.ouvrir(fake);
				others.monterMoyenAscenseur();
				asserv.pwm(80, 80, 1000);
				asserv.calageY(240, -1.5708);
				asserv.speed(-200, 0, 1000);
				others.ouvrirStabilisateurMoyen(fake,0);
				others.descendreMoyenAscenseur();
				others.ouvrirBloqueurGrand(fake,0);
				ax12.ouvrir();
				others.ouvrirStabilisateurGrand();
				asserv.speed(-300, 0, 750, function() {
					callback();
					that.client.send('ia', 'data.add_dynamic', {pos:{x:asserv.pos.x, y:180}, d:8});
				});
				that.nb_plots = 0;
				that.client.send('ia', 'pr.plot0');
			break;

			case "deposer_pile_front":
				ax12.ouvrir();
				others.ouvrirBloqueurMoyen();
				asserv.speed(200, 0, 500);
				others.ouvrirStabilisateurMoyen(fake,0);
				others.descendreMoyenAscenseur();
				others.ouvrirBloqueurGrand(fake,0);
				others.ouvrirStabilisateurGrand();
				asserv.speed(-300, 0, 750, function() {
					callback();
					that.client.send('ia', 'data.add_dynamic', {pos:{x:asserv.pos.x, y:180}, d:8});
				});
				that.nb_plots = 0;
				that.client.send('ia', 'pr.plot0');
			break;

			case "deposer_gobelet":
				asserv.goa(3.1416);
				that.delay(100);
				others.lacherGobelet();
				that.client.send('ia', 'pr.gobelet0');
				asserv.speed(500, 0, 800, callback);
			break;

			case "deposer_gobelet_front_right_calage":
				asserv.goxy(2840, 600, "avant");
				asserv.goa(0);
				asserv.goa(0);
				asserv.pwm(80, 80, 1500);
				asserv.calageX(2863, 0);
				asserv.goxy(2800, 600, "arriere");
				asserv.goa(1.5708);
				others.monterMoyenAscenseur();
				asserv.pwm(80, 80, 1500);
				asserv.calageY(704, 1.5708);
				asserv.speed(-200, 0, 500);
				asserv.goa(3.1416);
				that.delay(100);
				others.lacherGobelet();
				that.client.send('ia', 'pr.gobelet0');
				asserv.speed(500, 0, 800, callback);
				others.descendreMoyenAscenseur();
			break;
			case "fermer_tout":
				others.lacherGobelet();
				others.fermerBloqueur();
				others.descendreAscenseur();
				others.rangerClap();
				others.fermerStabilisateur();
				ax12.fermer(callback);
			break;
			case "ouvrir_ax12":
				ax12.ouvrir(callback);
			break;
			case "monter_ascenseur":
				others.monterAscenseur(callback);
			break;
			case "clap_1":
				others.sortirClap();
				asserv.goxy(400, 140, "osef", function() {
					callback();
					others.rangerClap();
				});
			break;
			case "clap_3":
				others.sortirClap();
				asserv.goxy(1000, 140, "osef", function() {
					callback();
					others.rangerClap();
				});
			break;
			case "clap_5":
				others.sortirClap();
				asserv.goxy(2300, 140, "osef", function() {
					callback();
					others.rangerClap();
				});
			break;

			// Asserv
			case "pwm":
				asserv.pwm(params.left, params.right, params.ms, callback);
			break;
			case "setvit":
				asserv.setVitesse(params.v, params.r, callback);
			break;
			case "clean":
				asserv.clean(callback);
			break;
			case "goa":
				asserv.goa(params.a, callback, true);
			break;
			case "goxy":
				asserv.goxy(params.x, params.y, params.sens, callback, true);
			break;
			case "setpos":
				asserv.setPos(params, callback);
			break;
			case "setacc":
				asserv.setAcc(params.acc, callback);
			break;
			case "setpid":
				asserv.setPid(params.p, params.i, params.d, callback);
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
