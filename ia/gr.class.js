module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.gr');

	function Gr(ia, color) {
		this.ia = ia;
		this.pos = {
			x: 210,
			y: 1000,
			a: 0
		};
		this.size = {
			l: 0,
			L: 0,
			d: 0
		};
		if(!color) color = "yellow";
		this.orders = require('./gr.json')[color];
		// logger.debug(this.orders);
		this.path = null;

		if (color == "green"){
			this.pos.x = 3000 - this.pos.x;
			this.pos.a = 180;
		}
	}

	Gr.prototype.start = function () {
		this.sendOrders();
	};

	Gr.prototype.sendPos = function () {
		this.ia.client.send("gr", "setpos", this.pos);
	};

	Gr.prototype.parseOrder = function (from, name, params) {
		switch(name) {
			case 'gr.pos':
				this.pos = params;
			break;
			case 'gr.getpos':
				this.sendPos();
			break;
			default:
				logger.warn('Ordre inconnu dans ia.gr: '+name);
		}
	};

	Gr.prototype.sendOrders = function () {
		for(var i in this.orders) {
			this.ia.client.send("gr", this.orders[i].name, this.orders[i].data);
		}
	};

	Gr.prototype.onColision = function () {
		logger.warn("Collision du gros robot");
		// TODO send order STOP
	};
	
	return Gr;
})();