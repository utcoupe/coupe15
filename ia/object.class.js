module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.action');

	function Action() {
		this.object_type;
		this.start_point; // x, y, a
		this.priority;
		this.duration;
		this.orders;
	}

	Action.prototype.foo = function () {
	};
	
	return Action;
})();