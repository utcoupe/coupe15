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
		this.content = {
			nb_plots: 0,
			gobelet:false
		};
		this.color = color;
	}

	Pr.prototype.loop = function () {
		logger.debug('loop');
		this.ia.actions.doNextAction(function() {
			this.loop();
		}.bind(this));
	};

	Pr.prototype.collision = function() {
		if(this.path.length === 0) { // Utile quand on clique nous même sur le bouton dans le simu
			logger.warn("Normalement impossible, collision sur un path vide ?");
			//return;
		}

		logger.info('collision');
		this.path = [];
		this.ia.client.send('pr', "collision");
		this.ia.actions.collision();
		this.loop();
	}
	Pr.prototype.stop = function() {
		this.ia.client.send('pr', 'stop');
	}

	Pr.prototype.place = function () {
		// logger.debug('place');
		this.sendInitialPos();
		this.ia.client.send('pr', 'placer');
	};

	Pr.prototype.start = function () {
		this.ia.client.send("pr", "ouvrir_ax12");
		this.loop();
	};

	Pr.prototype.sendInitialPos = function () {
		this.ia.client.send("pr", "setpos", {
			x: 142,
			y: 1000,
			a: 0,
			color: this.color
		});
	};

	function borne(x, min, max) {
		return x > max ? max : x < min ? min : x;
	}

	Pr.prototype.parseOrder = function (from, name, params) {
		switch(name) {
			case 'pr.collision':
				this.collision();
			break;
			// Asserv
			case 'pr.pos':
				params.x = borne(params.x, 0, 3000);
				params.y = borne(params.y, 0, 2000);
				this.pos = params;
			break;
			case 'pr.getpos':
				this.sendInitialPos();
			break;
			case 'pr.placer':
				this.place();
			break;
			case 'pr.plot++':
				this.content.nb_plots += 1;
			break;
			case 'pr.plot0':
				this.content.nb_plots = 0;
			break;
			case 'pr.gobelet1':
				this.content.gobelet = true;
			break;
			case 'pr.gobelet0':
				this.content.gobelet = false;
			break;
			default:
				logger.warn('Ordre inconnu dans ia.pr: '+name);
		}
	};
	
	return Pr;
})();
