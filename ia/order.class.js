module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.order');

	function Order() {
		this.name;
		this.from;
		this.to;
		this.params;
	}

	Order.prototype.send = function () {
		// Sends an order to be executed
	};
	
	return Order;
})();