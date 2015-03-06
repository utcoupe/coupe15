module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.hokuyo');

	function Hokuyo(ia, params) {
		params = params || {};
		this.nb_hokuyo = 0;
		// this.PR = ??;
		// this.GR = ??;

		if (!!params.nb_erobots)
			this.nb_robots = params.nb_erobots;
		else
			logger.error("Number of ennemy robots ?");
	}

	Hokuyo.prototype.deleteOurRobots = function (dots) {
		// XXX
	};

	Hokuyo.prototype.updateNumberOfRObots = function (nb) {
		switch (nb){
			case 0:
				this.nb_hokuyo = 0;
				// XXX TODO: Fatal error ! throw stopEverything !
				break;
			case 1:
				this.nb_hokuyo = 1;
				// XXX TODO : bigger security zone ? throw startAgain ?
				break;
			case 2:
				this.nb_hokuyo = 2;
				break;
			default:
				logger.info("Invalid number of robots received :" + nb);
		}
	};

	Hokuyo.prototype.inputMessageHandler = function (data) {
		switch (data.name){
			case "position_tous_robots":
				this.deleteOurRobots(data.params.dots);
				break;
			case "nb_hokuyo":
				this.updateNumberOfRObots(data.params.nb);
				break;
			default:
				logger.warn("Message name " + data.name + " not understood");
		}
	};

	Hokuyo.prototype.isOk = function () {
		if (this.nb_hokuyo == 0)
			return false;
		else
			return true;
	};

	return Hokuyo;
})();