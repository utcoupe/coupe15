module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.actions');

	function Actions(ia) {
		this.ia = ia;
		this.done = [];
		this.todo = [];
		this.inprogess = [];

		this.todo = this.importActions();
	}

	Actions.prototype.importActions = function () {
		var ret = require('./actions.json');
		// Link "object" with exiting thing in the Data class XXX
		return ret.actions;
	};

	Actions.prototype.do = function (action) { // XXX comment passer l'action en paramètres ? penser à passer l'IA
		// Change action to state "in progress"
		// Do action
		// Change action and its "to be killed" actions to state done
	};
	
	return Actions;
})();