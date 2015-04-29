module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.actions');

	function Actions(ia, data, color) {
		this.ia = ia;
		this.color = color;

		this.done = {};
		this.todo = {};
		this.inprogress = {};
		this.killed = {};
		this.errors = []; // XXX utile ?

		this.todo = this.importActions(data);
	}

	Actions.prototype.importActions = function (data) {
		var req = require('./actions.json');
		var actions = req.actions;

		// Link "object" with exiting thing in the Data class
		Object.keys(actions).forEach(function(i) {
			actions[i].object = data.getObjectRef(actions[i].objectname);
			if (actions[i].object === null)
				this.errors.push({
					date: Date.now(),
					function: "importActions",
					mess: "getObjectRef n'a pas trouvé l'objet associé à l'action "+i});
		});

		return actions;
	};

	Actions.prototype.do = function (action_name, numero_startpoint) {
		// Call the function passing the action name + the choosen startpoint as parameter, for eg.    actions.do("empiler1.1", 2);

		// If action doesn't exist
		if (!this.exists(action_name)){
			logger.error("Trying to do an action that doesn't exist '" + action_name + "'");
			return;
		}

		// Change action to state "in progress"
		this.inprogress[action_name] = this.todo[action_name];
		delete this.todo[action_name];

		// Do action
		var act = this.inprogress[action_name];
		this.ia.client.send(act.owner, "go_to", {
			pos: act.startpoints[numero_startpoint]
		});
		act.orders.forEach(function (order, index, array){
			this.ia.client.send(act.owner, order.name, order.params);
		}.bind(this));
		this.ia.client.send(act.owner, "send_message", {
			name: "action_finished",
			action_name: action_name
		});

		// Set object to "done" ! XXX

		// Change action and its "to be killed" actions to state done
		this.done[action_name] = this.inprogress[action_name];
		delete this.inprogress[action_name];
		this.kill(this.done[action_name].kill);
		console.log(this.todo);
		console.log(this.inprogress);
		console.log(this.done);
	};

	Actions.prototype.kill = function (action_name){
		// If action doesn't exist
		if (!!action_name && this.exists(action_name)){
			this.done[action_name] = this.todo[action_name];
			delete this.todo[action_name];
		}
	};

	Actions.prototype.exists = function (action_name){
		if (!this.todo[action_name]){
			if (!this.killed[action_name] && !this.done[action_name] && !this.done[action_name])
				logger.warn("Action named '"+"' doesn't exist");
			else
				logger.warn("Action named '"+"' already killed in progress or done !");
			return false;
		} else {
			return true;
		}
	};

	Actions.prototype.isDone = function (action_name){
		// Return true if action done
		// If no action given (ie no dependency) -> that's ok return true

		if(!action_name)
			return true;

		Object.keys(this.done).forEach(function(a_n) {
			if ((action_name == a_n))
				return true;
		});

		return false;
	};

	Actions.prototype.getNearestAction = function (pos, color){
		var action_name = "";
		// Begin with first possible action
		Object.keys(this.todo).forEach(function(a_n) {
			if ((action_name === "") && 
				(this.todo[a_n].object.color == this.color || this.todo[a_n].color == "none") &&
				isDone(this.todo[a_n].dependency))
				action_name = a_n;
		});

		// Find if there's a nearer one
		if (!!action_name) {
			var action_dist = getActionDistance(pos, action_name);
			var action_priority = 1000;

			Object.keys(this.todo).forEach(function(a_n) {
				var temp_dist = getActionDistance(pos,a_n);

				if ((this.todo[a_n].object.color == this.color || this.todo[a_n].color == "none") && // suitable for us
					(this.todo[a_n].object.status != "lost") &&  // and status initial
					isDone(this.todo[a_n].dependency)){ // and dependency done (if any)

					if (this.todo[a_n].priority < action_priority){ // more important
						action_name = a_n;
						action_dist = temp_dist;
						action_priority = this.todo[a_n].priority;
					} else {
						if ((isCloser(temp_dist, action_dist)) && // closer
							(this.todo[a_n].priority == action_priority)){ // and as important
							action_name = a_n;
							action_dist = temp_dist;
						}
					}
				}
			});
		}

		return action_name;
	};

	Actions.prototype.isCloser = function (dist1, dist2){
		// Returns true if dist1 is smaller than dist2
		// i.e. object 1 is closer than object 2

		if(dist1.d < dist2.d){
			return true;
		} else {
			if (!!dist1.a && !!dist2.a && (dist1.d == dist2.d) && (dist1.a < dist2.a))
				return true;
			else
				return false;
		}
	};

	Actions.prototype.getActionDistance = function (pos, action_name){
		if (this.exists(action_name)){
			start_pts = this.todo[action_name].startpoints;

			var dist = {
					d: sqrt(3000^2 + 2000^2),
					delta_a: 181,
					start_point: -1
				};

			if (!start_pts.length) 
				logger.warn("No startpoint for object "+action_name);

			for (var i = 0; i < start_pts.length; i++) {
				var temp = {
					d: sqrt((pos.x - start_pts[i].x)^2 + (pos.y - start_pts[i].y)^2),
					a: abs(pos.a - start_pts[i].a)
				};

				if (isCloser(tempDist, dist)){
					dist.d = tempDist.d;
					dist.delta_a = tempDist.a;
					dist.start_point = i;
				}
			}

			return dist;
		} else {
			return null;
		}
	};

	Actions.prototype.isOk = function () { // XXX
		if (errors.length !== 0){
			logger.warn(this.errors);
			return false;
		} else 
			return true;
	};
	
	return Actions;
})();