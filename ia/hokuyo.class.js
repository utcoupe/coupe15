module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var gaussian = require('gaussian');
	var logger = log4js.getLogger('ia.hokuyo');

	function Hokuyo(ia, gr, pr, data, params) {
		params = params || {};
		this.nb_hokuyo = 0;
		this.pr = pr;
		this.gr = gr;
		this.data = data; // data class
		this.lastNow = 0;
	}

	Hokuyo.prototype.getDistance = function (spot1, spot2) {
		return sqrt((spot1.x - spot2.x)^2 + (spot1.y - spot2.y)^2);
	};

	Hokuyo.prototype.isOnTheStairs = function (spot){
		return (spot.x>967) && (spot.x < 2033) && (spot.y < 580);
	};

	Hokuyo.prototype.getMatchingCoef = function (spot, eRobot, dt){
		var estimatedPos = {
			x: eRobot.pos.x + eRobot.speed.x*dt,
			y: eRobot.pos.y + eRobot.speed.y*dt
		};

		var distribution = gaussian(0,eRobot.d);
		return distribution.pdf(getDistance(spot, estimatedPos));
	};

	Hokuyo.prototype.updatePos = function (dots) {
		// we have a ref of our and the ennemy robots (position + speed)

		if (dots.length === 0)
			logger.warn("On a reçu un message vide (pas de spots dedans)");
		else {
			if (dots.length != 2*this.params.we_have_hats + this.params.nb_erobots) {
				logger.info("On a pas le meme nombre de spots ("+dots.length+") que de robots à détecter ("+
					(2*this.params.we_have_hats + this.params.nb_erobots) + ").");
			}

			// takes a timestamp to be able to compute speeds
			now = this.ia.timer.get(); // retourne le temps depuis le début du match en ms

			// if we have hats, kill ourselves (virtualy, of course)
			if (this.params.we_have_hats) {
				var pr_dist = getDistance({x: 0, y:0}, {x: 3000, y:2000});
				var pr_i = -1;
				var gr_dist = getDistance({x: 0, y:0}, {x: 3000, y:2000});
				var gr_i = -1;

				for (var i = 0; i < dots.length; i++) {
					var pr_temp_dist = getDistance(dots[i], this.pr.pos);
					var gr_temp_dist = getDistance(dots[i], this.gr.pos);

					if ((pr_dist > pr_temp_dist) && (pr_temp_dist < this.pr.size.d)){
						pr_dist = pr_temp_dist;
						pr_i = i;
					}

					if ((gr_dist > gr_temp_dist) && (gr_temp_dist < this.gr.size.d)){
						gr_dist = gr_temp_dist;
						gr_i = i;
					}
				}
				
				if (pr_i != -1) {
					dots.splice(pr_i,1);
				}

				if (gr_i != -1) {
					dots.splice(gr_i,1);
				}
			}

			// until there are dots left to be matched with ennmies
			while (dots.length > 0){
				// if some robots aren't already matched
				var e_r2Bmatched = [];

				for (var i = 0; i < this.data.erobot.length; i++) {
					if(this.data.erobot[i].lastUpdate < now)
						e_r2Bmatched.push(this.data.erobot[i]);
				}

				if (e_r2Bmatched > 0) {
					var matching_coef = [];
					var best_coef = {
						value: 1,
						dot: -1,
						e_robot: -1
					};

					// for each eatimated position of the robots
					for (var d = 0; d < dots.length; d++){
						// for each real point
						for (var i = 0; i < e_r2Bmatched.length; i++) {
							// we make a matching coefficient
							matching_coef[d][i] = getMatchingCoef(dots[d], e_r2Bmatched[i], e_r2Bmatched[i].lastUpdate - now);

							if (best_coef.value < matching_coef[d][i]) {
								best_coef.value = matching_coef[d][i];
								best_coef.dot = d;
								best_coef.e_robot = i;
							}
						}
					}

					// we take the best/bigger coefficient (well named best_coef :P )

					// if it's climbing the stairs, set the correct status
					if (isOnTheStairs(dots[best_coef.dot])){
						e_r2Bmatched[best_coef.e_robot].status = "on_the_stairs";
						e_r2Bmatched[best_coef.e_robot].lastUpdate = now;
						e_r2Bmatched[best_coef.e_robot].speed = {
							x:0,
							y:0,
						};

					} else {
						// if it isn't, set the new position, speed, status, call the "ennemy went there" function
						e_r2Bmatched[best_coef.e_robot].status = "moving";
						e_r2Bmatched[best_coef.e_robot].lastUpdate = now;
						var deltaT = now - this.lastNow;
						if (deltaT !== 0)
							e_r2Bmatched[best_coef.e_robot].speed = {
								x: (dots[dot].x - e_r2Bmatched[best_coef.e_robot].pos.x)/deltaT,
								y: (dots[dot].y - e_r2Bmatched[best_coef.e_robot].pos.y)/deltaT,
							};
						else
							logger.warn("Tiens, deltaT = 0, c'est bizarre...");
							e_r2Bmatched[best_coef.e_robot].speed = {
								x:0,
								y:0,
							};

						e_r2Bmatched[best_coef.e_robot].pos = {
							x: dots[dot].x,
							y: dots[dot].y,
						};

						this.data.theEnnemyWentThere(e_r2Bmatched[best_coef.e_robot].pos, best_coef.e_robot);
					}
					
					// and delete the dot
					dots.splice(dot,1);
				} else {
					// if all the robots are tidied up, ouw, that's strange ^^
					logger.warn("Un ou plusieurs spots de plus que de robots sur la table :");
					logger.warn(dots);
					break;
				}

			}

			// XXX /!\ robots on the stairs !


			// if there's some robots to be matched (but no real point left :/), they're lost...
			// we estimate their position and tag them with "lost"
			for (var i = 0; i < this.data.erobot.length; i++) {
				if ((this.data.erobot[i].lastUpdate < now) && (this.data.erobot[i].status == "moving")){
					this.data.erobot[i].pos = {
						x: this.data.erobot[i].pos.x +  this.data.erobot[i].pos.speed.x*Math.abs(this.data.erobot[i].lastUpdate - now),
						y: this.data.erobot[i].pos.y +  this.data.erobot[i].pos.speed.y*Math.abs(this.data.erobot[i].lastUpdate - now)
					};
					this.data.erobot[i].speed = {
						x:0,
						y:0,
					};
					this.data.erobot[i].status = "lost";
					this.data.erobot[i].lastUpdate = now;
				}
			}

		}
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