module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.pr');

	function Pr(ia) {
		this.ia = ia;
		this.pos = {
			x: 0,
			y: 0,
			a: 0
		};
		this.size = {
			l: 0,
			L: 0,
			d: 0
		};
		this.current_action = null;
		this.path = null;
	}

	Pr.prototype.onColision = function () {
		logger.warn("Collision du petit robot");
	};
	
	return Pr;
})();