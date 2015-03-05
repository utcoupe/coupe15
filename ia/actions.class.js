module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.actions');

	function Actions(ia) {
		this.ia = ia;
		this.done = [];
		this.todo = [];
		this.inprogess = [];
	}

	Actions.prototype.import = function () {
	};

	Actions.prototype.do = function (action) { // XXX comment passer l'action en paramètres ? penser à passer l'IA
		// Change action to state "in progress"
		// Do action
		// Change action and its "to be killed" actions to state done
	};

	Actions.prototype.init = function () {
	};
	
	return Actions;
})();