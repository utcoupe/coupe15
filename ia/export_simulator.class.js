module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.export_simulator');

	function ExportSimulator(ia) {
		this.timeout = null;
		this.start();
	}

	ExportSimulator.prototype.start = function() {
		this.orderToSimu();
	}
	ExportSimulator.prototype.stop = function() {
		clearTimeout(this.timeout);
	}

	ExportSimulator.prototype.orderToSimu = function() {
		var data = {};
		

		this.timeout = setTimeout(function(){this.orderToSimu()}.bind(this), 1000);
	}

	return ExportSimulator;
})();