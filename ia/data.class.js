module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.data');

	function Data() {
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
	
	return Data;
})();