module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.gr');

	function Gr(ia) {
		this.ia = ia;
		this.tapis_status = null;
		this.orders = null;
		this.path = null;
	}

	Gr.prototype.onColision = function () {
		logger.warn("Collision du gros robot");
	};
	
	return Gr;
})();