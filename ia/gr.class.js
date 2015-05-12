module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.gr');

	function Gr(ia, color) {
		this.ia = ia;
		this.pos = this.orders = require('./gr.json')['pos'];
		this.size = {
			l: 290,
			L: 290,
			d: 420
		};
		if(!color) color = "yellow";
		this.orders = require('./gr.json')['script_'+color];
		// logger.debug(this.orders);
		this.path = null;

		if (color == "green"){
			this.pos.x = 3000 - this.pos.x;
			this.pos.a = 3.1416;
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

	Gr.prototype.onCollision = function () {
		logger.warn("Collision du gros robot");
		// TODO send order STOP
	};

	Gr.prototype.stop = function() {
		this.ia.client.send('gr', 'stop');
	}

	
	return Gr;
})();
