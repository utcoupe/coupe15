module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.actions');

	function Actions() {
		this.done = [];
		this.todo = [];
		this.inprogess = [];
	}

	Actions.prototype.createAction = function () {
	};

	Actions.prototype.init = function () {
	};
	
	return Actions;
})();