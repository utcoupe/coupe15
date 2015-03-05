module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.erobot');

	function Erobot() {
		this.pos;
		this.pos.x;
		this.pos.y;
		this.diametre;
	}

	Erobot.prototype.foo = function () {
	};
	
	return Erobot;
})();