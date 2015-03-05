module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('IA');

	function Hokuyo(params) {
		this.nb_hokuyo = 0;
		// this.PR = ??;
		// this.GR = ??;

		if (!!params.nb_robots)
			this.nb_robots = params.nb_robots;
		else
			logger.error("How many robots is there ?");
	}

	Hokuyo.prototype.deleteOurRobots = function (dots) {
		// XXX
	};

	Hokuyo.prototype.updateNumberOfRObots = function (nb) {
		switch (nb){
			case 0:
				Hokuyo.nb_hokuyo = 0;
				// XXX TODO: Fatal error ! throw stopEverything !
				break;
			case 1:
				Hokuyo.nb_hokuyo = 1;
				// XXX TODO : bigger security zone ? throw startAgain ?
				break;
			case 2:
				Hokuyo.nb_hokuyo = 2;
				break;
			default:
				logger.info("Invalid number of robots received :" + nb);
		}
	};

	Hokuyo.prototype.inputMessageHandler = function (data) {
		switch (data.name){
			case "position_tous_robots":
				Hokuyo.deleteOurRobots(data.params.dots);
				break;
			case "nb_hokuyo":
				Hokuyo.updateNumberOfRObots(data.params.nb);
				break;
			default:
				logger.warn("Message name " + data.name + " not understood");
		}
	};

	return Hokuyo;
})();