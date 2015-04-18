module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.gr');

	function Gr(ia, color) {
		this.ia = ia;
		this.pos = {
			x: 250,
			y: 1000,
			a: 0
		};
		this.size = {
			l: 0,
			L: 0,
			d: 0
		};
		this.tapis_status = null;
		this.orders = null;
		this.path = null;

		if (color == "green"){
			this.pos.x = 3000 - this.pos.x;
			this.pos.a = 180;
		}
	}

	Gr.prototype.onColision = function () {
		logger.warn("Collision du gros robot");
	};
	
	return Gr;
})();