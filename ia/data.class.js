module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.data');

	function Data() {
		this.claps;
		this.cylindres;
		this.erobots;
		this.gobelets;
		this.chargeurs;
	}

	Data.prototype.foo = function () {
	};
	
	return Data;
})();