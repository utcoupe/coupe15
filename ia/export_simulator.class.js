module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.export_simulator');

	var __timeout = null;
	var FPS = 30;

	function convertX(x) { return (x-1500)/1000; }
	function convertY(y) { return (1000-y)/1000; }
	function convertA(a) { return a; }

	function ExportSimulator(ia) {
		this.ia = ia;
		this.start();
	}

	ExportSimulator.prototype.start = function() {
		this.orderToSimu();
	}
	ExportSimulator.prototype.stop = function() {
		clearTimeout(__timeout);
	}

	ExportSimulator.prototype.orderToSimu = function() {
		var data = {};
		data.robots = {
			gr: {
				x: convertX(this.ia.gr.pos.x),
				y: convertY(this.ia.gr.pos.y),
				a: convertA(this.ia.gr.pos.a)
			},
			pr: {
				x: convertX(this.ia.pr.pos.x),
				y: convertY(this.ia.pr.pos.y),
				a: convertA(this.ia.pr.pos.a)
			}
		}
		// logger.debug(data);
		this.ia.client.send("webclient", "simulateur", data);

		__timeout = setTimeout(function(){this.orderToSimu()}.bind(this), 1000/FPS);
	}

	return ExportSimulator;
})();