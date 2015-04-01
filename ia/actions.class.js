module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.actions');

	function Actions(ia, data) {
		this.ia = ia;
		this.done = {};
		this.todo = {};
		this.inprogess = {};

		this.todo = this.importActions(data);
	}

	Actions.prototype.importActions = function (data) {
		var req = require('./actions.json');
		var actions = req.actions;

		// Link "object" with exiting thing in the Data class
		Object.keys(actions).forEach(function(i) {
			actions[i].object = data.getObjectRef(actions[i].objectname);
		})

		return actions;
	};

	Actions.prototype.do = function (action_name) {
		// On passe l'action en paramètre, donc : actions.do("empiler1.1");

		// Change action to state "in progress"
		this.inprogress[action_name] = this.todo[action_name];
		delete this.todo[action_name];

		// Do action
		if (this.inprogress[action_name].orders.lenght == 1)
			this.ia.client.send(this.owner, this.orders[0].name, this.orders[0].params);
		else {
			this.ia.client.send(this.owner, "orders_array", {orders: this.orders});
		}

		// Change action and its "to be killed" actions to state done
		this.done[action_name] = this.todo[action_name];
		delete this.inprogress[action_name];
	};
	
	return Actions;
})();