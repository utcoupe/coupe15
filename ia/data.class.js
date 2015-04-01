module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.data');

	function Data(ia) {
		this.balle = [];
		this.chargeur = [];
		this.clap = [];
		this.cylindre = [];
		this.erobot = [];
		this.gobelet = [];

		this.importObjects();
		
		this.erobot = {
			epr: {
				pos:{
					x:0,
					y:0,
				},
				d:20, // XXX quelle unité, comment la modifier ?
				status: "lost"
			},
			egr: {
				pos:{
					x:0,
					y:0,
				},
				d:20, // XXX quelle unité, comment la modifier ?
				status: "lost"
			}
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

	Data.prototype.isOk = function () { // XXX
		return true;
	};
	
	return Data;
})();