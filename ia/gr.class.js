module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.gr');

	function Gr() {
		this.tapis_status;
		this.orders;
		this.path;
	}

	Gr.prototype.foo = function () {
	};
	
	return Gr;
})();