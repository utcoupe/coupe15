module.exports = (function () {
	"use strict";
	var logger = require('log4js').getLogger('ia.pr');

	function Pr(ia, color) {
		this.ia = ia;
		this.pos = { // if we are yellow, default, left side of the table
			x: 142,
			y: 1000,
			a: 0
		};
		this.size = {
			l: 0,
			L: 0,
			d: 0
		};
		this.current_action = null;
		this.path = null;
		this.nb = 0;

		if (color == "green"){
			this.pos.x = 3000 - this.pos.x;
			this.pos.a = 3.1416;
		}
	}

	Pr.prototype.loop = function () {
		if(this.nb < 3) {
			logger.debug('loop');
			this.nb++;
			var action_name = this.ia.actions.getNearestAction(this.pos);
			this.ia.actions.doAction(action_name, function() {
				this.loop();
			}.bind(this));
		}
	};

	Pr.prototype.place = function () {
		logger.debug('place');
		this.sendPos();
		this.ia.client.send("pr", "goxy", { x: 500, y: 1060});
		this.ia.client.send("pr", "goa", { a: -0.611 });
		this.ia.client.send("pr", "fermer_tout");
	};

	Pr.prototype.start = function () {
		// this.sendPos();
		this.ia.client.send("pr", "ouvrir_ax12");
		this.loop();
	};

	Pr.prototype.sendPos = function () {
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
				this.sendPos();
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