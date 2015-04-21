module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.pr');

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
			this.pos.a = 180;
		}
	}

	Pr.prototype.onColision = function () {
		logger.warn("Collision du petit robot");
	};
	
	return Pr;
})();