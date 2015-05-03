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

	var __dist_startpoints_plot = 40;
	var __nb_startpoints_plot = 16;
	function convertA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
	Actions.prototype.importActions = function (data) {
		var req = require('./actions.json');
		var actions = req.actions;

		// Link "object" with exiting thing in the Data class
		Object.keys(actions).forEach(function(i) {
			actions[i].object = data.getObjectRef(actions[i].objectname);
			if (actions[i].object === null) {
				this.errors.push({
					date: Date.now(),
					function: "importActions",
					mess: "getObjectRef n'a pas trouvé l'objet associé à l'action "+i});
			}
			else if(actions[i].type == "plot" && actions[i].startpoints.length === 0) {
				var temp;
				for(var j = 0; j < __nb_startpoints_plot; j++) {
					temp = j*2*Math.PI/__nb_startpoints_plot;
					actions[i].startpoints.push({
						x: actions[i].object.pos.x + __dist_startpoints_plot * Math.cos(temp),
						y: actions[i].object.pos.y + __dist_startpoints_plot * Math.sin(temp),
						a: convertA(temp+Math.PI)
					});
				}
			}
		});

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

	Actions.prototype.doAction = function (action_name, callback) {
		// If action doesn't exist
		if (!this.exists(action_name)){
			logger.error("Trying to do an action that doesn't exist '" + action_name + "'");
			return;
		}

		this.callback = callback;
		var startpoint = this.getNearestStartpoint(this.ia.pr.pos, action_name);
		
		// // Change action to state "in progress"
		var act = this.todo[action_name];
		this.inprogress[action_name] = act;
		delete this.todo[action_name];

		logger.debug('Action en cours %s (%d;%d;%d)', action_name, startpoint.x, startpoint.y, startpoint.a);

		this.ia.client.send('pr', "goxy", {
			x: startpoint.x,
			y: startpoint.y,
			sens: act.sens
		});
		this.ia.client.send('pr', "goa", {
			a: startpoint.a
		});
		// 1 order for 1 action
		// act.orders.forEach(function (order, index, array){
		this.ia.client.send('pr', act.orders[0].name, act.orders[0].params);
		// }.bind(this));
		this.ia.client.send('pr', "send_message", {
			name: "actions.action_finished",
			action_name: action_name
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
		this.callback = function() {logger.fatal('BAZOOKA'); };
		temp.call();
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
		// Return true if action done
		// If no action given (ie no dependency) -> that's ok return true

		// if(!action_name)
		// 	return true;

		// Object.keys(this.done).forEach(function(a_n) {
		// 	if ((action_name == a_n))
		// 		return true;
		// });

		// return false;
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
	Actions.prototype.getNearestAction = function(pos) {
		var actions_todo = [];
		Object.getOwnPropertyNames(this.todo).forEach(function(an) { //an = action name
			if(this.todo[an].object.status != "lost" && this.isDone(this.todo[an].dependency)) {
				actions_todo.push(an);
			}
		}, this);

		// Tri par priorité puis par norme
		actions_todo.sort(function(a, b) {
			return (this.getPriorityAction(b) - this.getPriorityAction(a)) || (this.getNormAction(pos, a) - this.getNormAction(pos, b));
		}.bind(this));

		// for(var i in actions_todo) {
		// 	logger.debug('[%d] %s (%d)', this.todo[actions_todo[i]].priority, actions_todo[i], this.getNormAction(pos, actions_todo[i]));
		// }

		return actions_todo[0];
	}
	Actions.prototype.getNearestStartpoint = function(pos, action_name) {
		var min_dist = Infinity;
		var nearest = null;

		var startpoints = this.todo[action_name].startpoints;

		for (var i = 0; i < startpoints.length; i++) {
			var dist = norm2Points(pos, startpoints[i]);

			if (dist < min_dist){
				min_dist = dist;
				nearest = startpoints[i];
			}
		}

		return nearest;
	}

	// // <troll>
	// Actions.prototype.getFarestAction = function (pos){
	// // </troll>
	// 	var action_name = "";
	// 	// Begin with first possible action
	// 	Object.keys(this.todo).forEach(function(a_n) {
	// 		if ((action_name === "") && 
	// 			(this.todo[a_n].object.color == this.color || this.todo[a_n].color == "none") &&
	// 			this.isDone(this.todo[a_n].dependency))
	// 			action_name = a_n;
	// 	}, this);

	// 	// Find if there's a nearer one
	// 	if (!!action_name) {
	// 		var action_dist = this.getActionDistance(pos, action_name);
	// 		var action_priority = 1000;

	// 		Object.keys(this.todo).forEach(function(a_n) {
	// 			var temp_dist = this.getActionDistance(pos,a_n);

	// 			if ((this.todo[a_n].object.status != "lost") && this.isDone(this.todo[a_n].dependency)) { // and dependency done (if any)

	// 				if (this.todo[a_n].priority < action_priority){ // more important
	// 					action_name = a_n;
	// 					action_dist = temp_dist;
	// 					action_priority = this.todo[a_n].priority;
	// 				} else {
	// 					if ((this.isCloser(temp_dist, action_dist)) &&  (this.todo[a_n].priority == action_priority)){ // and as important
	// 						action_name = a_n;
	// 						action_dist = temp_dist;
	// 					}
	// 				}
	// 			}
	// 		}, this);
	// 	}

	// 	return action_name;
	// };

	// Useless c'est des flottants et si la distance est équivalente (impossible avec des flottants sans marge)
	// on va gagner que quelques centaine de milisecondes grand grand max)
	// Actions.prototype.isCloser = function (dist1, dist2){
	// 	// Returns true if dist1 is smaller than dist2
	// 	// i.e. object 1 is closer than object 2

	// 	if(dist1.d < dist2.d){
	// 		return true;
	// 	} else {
	// 		if (!!dist1.a && !!dist2.a && (dist1.d == dist2.d) && (dist1.a < dist2.a))
	// 			return true;
	// 		else
	// 			return false;
	// 	}
	// };

	// Useless de calculer pour chaque point d'entrée, autant calculer pour l'objet
	// qui est approximativement aussi proche que ses points d'entrées
	// Actions.prototype.getActionDistance = function (pos, action_name){
	// 	var start_pts;
	// 	if (this.exists(action_name)){
	// 		start_pts = this.todo[action_name].startpoints;

	// 		var min_dist = Infinity;

	// 		if (start_pts.length == 0) 
	// 			logger.warn("No startpoint for object "+action_name);

	// 		for (var i = 0; i < start_pts.length; i++) {
	// 			var dist = Math.sqrt(Math.pow(pos.x - start_pts[i].x, 2) + Math.pow(pos.y - start_pts[i].y, 2));

	// 			if (dist < min_dist){
	// 				min_dist = dist;
	// 			}
	// 		}

	// 		return min_dist;
	// 	} else {
	// 		return null;
	// 	}
	// };

	Actions.prototype.isOk = function () { // XXX
		if (errors.length !== 0){
			logger.warn(this.errors);
			return false;
		} else 
			return true;
	};
	
	return Actions;
})();