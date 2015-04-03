module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.hokuyo');

	function Hokuyo(ia, gr, pr, params) {
		params = params || {};
		this.nb_hokuyo = 0;
		this.pr = pr;
		this.gr = gr;

		if (!!params.nb_erobots)
			this.nb_robots = params.nb_erobots;
		else
			logger.error("Number of ennemy robots ?");
	}

	Hokuyo.prototype.updatePos = function (dots) {
		// we must have a ref to our and the ennemy robots (position + speed (given in mm/s in a direction))

		// takes a timestamp to be able to compute speeds

		// if we have hats, kill ourselves (virtualy, of course)

		// until there are dots left to be matched with ennmies
			// if some robots aren't already matched
				// for each eatimated position of the robots
					// for each real point
						// we make a matching coefficient

				// we take the best/bigger coefficient

				// if it's climbing the stairs, set the correct status

				// if it isn't, set the new position, speed, status and call the "ennemy went there" function

			// if all the robots are titied up, ouw, that's strange ^^

		// if there's some robots to be matched (but no real point left :/), they're lost...
		// we estimate their position and tag them with "lost"
		
	};

	Hokuyo.prototype.updateNumberOfRobots = function (nb) {
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
				this.updatePos(data.params.dots);
				break;
			case "nb_hokuyo":
				this.updateNumberOfRobots(data.params.nb);
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