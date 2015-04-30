module.exports = (function () {
	"use strict";
	var logger = require('log4js').getLogger('ia.pr');

	function Pr(ia, color) {
		this.ia = ia;
		this.pos = { // if we are yellow, default, left side of the table
			x: 445,
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

		if (color == "green"){
			this.pos.x = 3000 - this.pos.x;
			this.pos.a = 3.1416;
		}
	}

	Pr.prototype.loop = function () {
		logger.debug(this.ia.actions.getNearestAction(this.pos));
	};

	Pr.prototype.start = function () {
		this.loop();
	};

	Pr.prototype.sendPos = function () {
		this.ia.client.send("pr", "setpos", this.pos);
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
			default:
				logger.warn('Ordre inconnu dans ia.pr: '+name);
		}
	};

	Pr.prototype.onColision = function () {
		logger.warn("Collision du petit robot");
	};
	
	return Pr;
})();