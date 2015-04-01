module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.actions');

	function Actions(ia, data) {
		this.ia = ia;
		this.done = {};
		this.todo = {};
		this.inprogess = {};
		this.errors = []

		this.todo = this.importActions(data);
	}

	Actions.prototype.importActions = function (data) {
		var req = require('./actions.json');
		var actions = req.actions;

		// Link "object" with exiting thing in the Data class
		Object.keys(actions).forEach(function(i) {
			actions[i].object = data.getObjectRef(actions[i].objectname);
			if (actions[i].object == null)
				this.errors.push({
					date:,
					function: "importActions",
					mess: "getObjectRef n'a pas trouvé l'objet associé à l'action "+i});
		})

		return actions;
	};

	Actions.prototype.do = function (action_name) {
		// On passe l'action en paramètre, donc : actions.do("empiler1.1");

		// Change action to state "in progress"
		this.inprogress[action_name] = this.todo[action_name];
		delete this.todo[action_name];

		// Do action
		act = this.inprogress[action_name];
		if (act.orders.lenght == 1)
			this.ia.client.send(act.owner, act.orders[0].name, act.orders[0].params);
		else {
			this.ia.client.send(act.owner, "orders_array", {orders: act.orders});
		}

		// Change action and its "to be killed" actions to state done
		this.done[action_name] = this.todo[action_name];
		delete this.inprogress[action_name];
	};

	Actions.prototype.isOk = function () { // XXX
		if (errors.length != 0)
			logger.warn(this.errors);
			return false;
		else
			return true;
	};
	
	return Actions;
})();