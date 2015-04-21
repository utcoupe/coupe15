module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.data');

	function Data(ia, nb_erobots) {
		this.balle = [];
		this.chargeur = [];
		this.clap = [];
		this.cylindre = [];
		this.erobot = [];
		this.gobelet = [];

		this.importObjects();
		
		this.erobot = [{ // big robot on position 0
				name: "gr",
				pos:{
					x:0,
					y:0
				},
				speed:{ // in mm/sec
					x:0,
					y:0,
				},
				lastUpdate: 0, // time in ms from the beining of the match
				d:200, // en mm, penser à la modifier !!
				status: "lost"
			}];

		if (this.nb_erobots == 2) {
			this.erobot.push({ // small robot on position 1
				name: "pr",
				pos:{
					x:0,
					y:0
				},
				speed:{
					x:0,
					y:0
				},
				lastUpdate: 0,
				d:200, // en mm, penser à la modifier !!
				status: "lost"
			});
		}
	}

	Data.prototype.importObjects = function () {
		var ret = require('./objects.json');

		this.balle = ret.balle;
		this.chargeur = ret.chargeur;
		this.clap = ret.clap;
		this.cylindre = ret.cylindre;
		this.gobelet = ret.gobelet;
		return ret;
	};

	Data.prototype.getObjectRef = function(name) {
		// Retourne une référence vers l'objet name
		// 		name étant de la forme <type>__<nom>
		// Permet d'avoir une référence vers l'objet dans une action

		var actName = name.split("__");
		if (actName.length != 2){
			logger.warn("Le nom '"+name+"' n'est pas un nom d'objet correct.");
			return null;
		}

		if (!this[actName[0]][actName[1]]){
			logger.warn("L'objet "+actName[0]+" de type "+actName[1]+" est inconnu.");
			return null;
		}

		return this[actName[0]][actName[1]];
	};

	Data.prototype.isCloser = function (dist1, dist2){ // il y a la meme dans actions.class.js
		// Returns true if dist1 is smaller than dist2
		// i.e. object 1 is closer than object 2

		if(dist1 < dist2){
			return true;
		} else {
			return false;
		}
	};

	Data.prototype.getDistance = function (pos1, pos2){
		return sqrt((pos1.x - pos2.x)^2 + (pos1.y - pos2.y)^2);
	};

	Data.prototype.theEnnemyWentThere = function (pos, e_robot_id){
		// takes a position and the ennemy robot # to put everything in its surroundings (~ 1.2 * radius) as "lost" 

		Object.keys(this.cylindre).forEach(function(c) {
			if (getDistance(pos, this.cylindre(c).pos) < 0.6*this.cylindre(c).diametre) {
				this.cylindre(c).status = "lost";
			}
		});

		Object.keys(this.gobelet).forEach(function(g) {
			if (getDistance(pos, this.gobelet(g).pos).d < 0.6*this.gobelet(g).diametre) {
				this.gobelet(g).status = "lost";
			}
		});
	};

	Data.prototype.isOk = function () { // XXX
		return true;
	};

	var data = new Data();
	
	return Data;
})();