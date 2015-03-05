module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.action');

	function Action() {
		this.var = ;
	}

	Action.prototype.foo = function () {
	};
	
	return Action;
})();