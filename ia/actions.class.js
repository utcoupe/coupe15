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
		var req = require('./actions.json');
		var actions = req.actions;

		// Link "object" with exiting thing in the Data class XXX
		for (var i = 0; i < actions.length; i++) {
			actions[i].object = data.getObjectRef(actions[i].objectname);
		};

		// Bind do function to each object ?

		return actions;
	};

	Actions.prototype.do = function (action) { // XXX comment passer l'action en paramètres ?
		// Change action to state "in progress"
		this.inprogress.push(this.todo[action]);
		delete this.todo[action];

		// Do action
		if (this.inprogress[action].orders.lenght == 1)
			this.ia.client.send(this.owner, this.orders[0].name, this.orders[0].params);
		else {
			this.ia.client.send(this.owner, "orders_array", {orders: this.orders});
		}

		// Change action and its "to be killed" actions to state done
		this.done.push(this.todo[action]);
		delete this.inprogress[action];
	};
	
	return Actions;
})();