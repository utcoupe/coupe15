module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.actions');
	function Actions(ia) {
		this.ia = ia;
		this.color = ia.color;

		this.done = {};
		this.todo = {};
		this.inprogress = {};
		this.killed = {};
		this.errors = []; // XXX utile ?

		this.todo = this.importActions(ia.data);
	}

	var __dist_startpoints_plot = 20;
	var __nb_startpoints_plot = 128;
	function convertA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
	Actions.prototype.importActions = function (data) {
		var req = require('./actions.json');
		var actions = req.actions;

		// Link "object" with exiting thing in the Data class
		Object.keys(actions).forEach(function(i) {
			actions[i].object = data.getObjectRef(actions[i].objectname);
			actions[i].name = i;

			if (actions[i].object === null) {
				this.errors.push({
					date: Date.now(),
					function: "importActions",
					mess: "getObjectRef n'a pas trouvé l'objet associé à l'action "+i});
			}
			else if(actions[i].type == "plot" && actions[i].startpoints.length === 0) {
				// var temp;
				// for(var j = 0; j < __nb_startpoints_plot; j++) {
				// 	temp = j*2*Math.PI/__nb_startpoints_plot;
				// 	actions[i].startpoints.push({
				// 		x: actions[i].object.pos.x + __dist_startpoints_plot * Math.cos(temp),
				// 		y: actions[i].object.pos.y + __dist_startpoints_plot * Math.sin(temp),
				// 		a: convertA(temp+Math.PI)
				// 	});
				// }
				actions[i].startpoints.push({
					x: actions[i].object.pos.x,
					y: actions[i].object.pos.y
				});
			}
		}.bind(this));

		return actions;
	};

	Actions.prototype.parseOrder = function (from, name, params) {
		switch(name) {
			case 'actions.action_finished':
				this.actionFinished(params.action_name);
			break;
			default:
				logger.warn('Ordre inconnu dans ia.gr: '+name);
		}
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
		return !action_name || this.done.hasOwnProperty(action_name);
	};

	function norm2Points(A, B) {
		return Math.sqrt(Math.pow(A.x-B.x, 2) + Math.pow(A.y-B.y, 2));
	}
	Actions.prototype.getNormAction = function(pos, an) {
		return norm2Points(pos, this.todo[an].object.pos);
	}
	Actions.prototype.getPriorityAction = function(an) {
		return this.todo[an].priority;
	}
	Actions.prototype.doNextAction = function(callback) {
		var actions_todo = [];
		Object.getOwnPropertyNames(this.todo).forEach(function(an) { //an = action name
			if(this.todo[an].object.status != "lost" && this.isDone(this.todo[an].dependency)) {
				actions_todo.push(an);
			}
		}, this);

		// Tri par priorité puis par norme
		var pos = this.ia.pr.pos;
		actions_todo.sort(function(a, b) {
			return (this.getPriorityAction(b) - this.getPriorityAction(a)) || (this.getNormAction(pos, a) - this.getNormAction(pos, b));
		}.bind(this));

		// for(var i in actions_todo) {
		// 	logger.debug('[%d] %s (%d)', this.todo[actions_todo[i]].priority, actions_todo[i], this.getNormAction(pos, actions_todo[i]));
		// }

		this.pathDoAction(callback, actions_todo);
	}
	Actions.prototype.getNearestStartpoint = function(pos, startpoints) {
		var min_dist = Infinity;
		var nearest = null;

		for (var i = 0; i < startpoints.length; i++) {
			var dist = norm2Points(pos, startpoints[i]);

			if (dist < min_dist){
				min_dist = dist;
				nearest = startpoints[i];
			}
		}

		return nearest;
	}
	Actions.prototype.pathDoAction = function(callback, actions) {
		if(actions.length > 0) {
			var action = this.todo[actions.shift()];
			var startpoint = this.getNearestStartpoint(this.ia.pr.pos, action.startpoints);
			this.ia.pathfinding.getPath(this.ia.pr.pos, startpoint, function(path) {
				if(path !== null) {
					this.ia.pr.path = path;
					this.doAction(callback, action, startpoint);
				} else {
					this.pathDoAction(callback, actions);
				}
			}.bind(this));
		} else {
			this.doNextAction();
		}
	}
	Actions.prototype.doAction = function (callback, action, startpoint) {
		this.callback = callback;
		
		// // Change action to state "in progress"
		this.inprogress[action.name] = action;
		delete this.todo[action.name];

		logger.debug('Action en cours %s (%d;%d;%d)', action.name, startpoint.x, startpoint.y, startpoint.a);
		// logger.debug(this.ia.pr.path);
		this.ia.pr.path.map(function(checkpoint) {
			this.ia.client.send('pr', "goxy", {
				x: checkpoint.x,
				y: checkpoint.y,
				sens: action.sens
			});
		}, this);
		if(!!startpoint.a) {
			this.ia.client.send('pr', "goa", {
				a: startpoint.a
			});
		}
		// 1 order for 1 action
		// action.orders.forEach(function (order, index, array){
		this.ia.client.send('pr', action.orders[0].name, action.orders[0].params);
		// }.bind(this));
		this.ia.client.send('pr', "send_message", {
			name: "actions.action_finished",
			action_name: action.name
		});

		// // Set object to "done" ! XXX

		// // Change action and its "to be killed" actions to state done

		// console.log(this.todo);
		// console.log(this.inprogress);
		// console.log(this.done);
	};
	Actions.prototype.actionFinished = function (action_name) {
		this.done[action_name] = this.inprogress[action_name];
		delete this.inprogress[action_name];
		logger.info('Action %s est finie !', action_name);
		var temp = this.callback;
		this.callback = function() {logger.warn('callback vide'); };
		temp.call();
	};
	
	return Actions;
})();