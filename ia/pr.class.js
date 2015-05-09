module.exports = (function () {
	"use strict";
	var logger = require('log4js').getLogger('ia.pr');

	function Pr(ia, color) {
		this.ia = ia;
		this.pos = { // if we are yellow, default, left side of the table
			x: 0,
			y: 0,
			a: 0
		};
		this.size = {
			l: 170,
			L: 220,
			d: 280
		};
		this.current_action = null;
		//this.path = null;
		this.path = [];
		this.nb = 0;

		if (color == "green"){
			this.pos.x = 3000 - this.pos.x;
			this.pos.a = 3.1416;
		}
	}

	Pr.prototype.loop = function () {
		if(this.nb < 4) {
			logger.debug('loop');
			this.nb++;
			this.ia.actions.doNextAction(function() {
				this.loop();
			}.bind(this));
		}
	};

	Pr.prototype.place = function () {
		logger.debug('place');
		this.sendInitialPos();
		this.ia.client.send("pr", "setpid", { p:0.2, i:150, d:14 });
		this.ia.client.send("pr", "goxy", { x: 500, y: 940});
		this.ia.client.send("pr", "goa", { a: -0.62 });
		this.ia.client.send("pr", "fermer_tout");

		// Calage auto, fonctionne pas
		// this.ia.client.send("pr", "goxy", { x: 300, y: 1000});
		// this.ia.client.send("pr", "goa", { a: -1.5708 });
		// this.ia.client.send("pr", "monter_ascenseur");
		// this.ia.client.send("pr", "pwm", { left: 20, right: 20, ms: 1500 });
		// setTimeout(function() {
		// 	this.ia.client.send("pr", "setpos", { x: this.pos.x, y: 1200-65, a: -1.5708 });
		// 	this.ia.client.send("pr", "pwm", { left: -20, right: -20, ms: 1000 });
		// 	this.ia.client.send("pr", "goxy", { x: 250, y: 1000});
		// 	this.ia.client.send("pr", "goa", { a: 3.1416 });
		// 	this.ia.client.send("pr", "fermer_pour_charger_balle");
	};

	Pr.prototype.start = function () {
		this.ia.client.send("pr", "ouvrir_ax12");
		this.loop();
	};

	Pr.prototype.sendInitialPos = function () {
		this.ia.client.send("pr", "setpos", { // doublon !!!
			x: 142,
			y: 1000,
			a: 0
		});
	};

	Pr.prototype.parseOrder = function (from, name, params) {
		switch(name) {
			// Asserv
			case 'pr.pos':
				this.pos = params;
			break;
			case 'pr.getpos':
				this.sendInitialPos();
			break;
			case 'pr.placer':
				this.place();
			break;
			default:
				logger.warn('Ordre inconnu dans ia.pr: '+name);
		}
	};

	Pr.prototype.onColision = function () {
		logger.warn("Collision du petit robot");
	};
	
	return Pr;
})();
