module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var gaussian = require('gaussian');
	var logger = log4js.getLogger('ia.hokuyo');

	var GR_OFFSET = 110;
	var PR_GR_COEF = 1;
	var lastUpdate = 0;

	function Hokuyo(ia, params) {
		this.params = params || {};
		this.nb_hokuyo = 0;
		this.ia = ia;
		this.lastNow = 0;
	}

	Hokuyo.prototype.getDistance = function (spot1, spot2) {
		return Math.sqrt(Math.pow(spot1.x - spot2.x, 2) + Math.pow(spot1.y - spot2.y, 2));
	};

	Hokuyo.prototype.isOnTheStairs = function (spot){
		return (spot.x>967) && (spot.x < 2033) && (spot.y < 580);
	};

	Hokuyo.prototype.getMatchingCoef = function (spot, eRobot, dt, status){
		// XXX : add a status coefficient

		var estimatedPos = {
			x: eRobot.pos.x + eRobot.speed.x*dt,
			y: eRobot.pos.y + eRobot.speed.y*dt
		};

		var distribution = gaussian(0,eRobot.d);
		return distribution.pdf(getDistance(spot, estimatedPos));
	};

	Hokuyo.prototype.deleteOurRobots = function (dots){
		var pr_dist = this.getDistance({x: 0, y:0}, {x: 3000, y:2000});
		var pr_i = -1;
		var gr_dist = this.getDistance({x: 0, y:0}, {x: 3000, y:2000});
		var gr_i = -1;

		var gr_pos_with_offset = {
			x: this.ia.gr.pos.x + GR_OFFSET*Math.cos(this.ia.gr.pos.a),
			y: this.ia.gr.pos.y + GR_OFFSET*Math.sin(this.ia.gr.pos.a)
		};

		for (var i = 0; i < dots.length; i++) {
			var pr_temp_dist = this.getDistance(dots[i], this.ia.pr.pos);
			var gr_temp_dist = this.getDistance(dots[i], gr_pos_with_offset);

			if ((pr_dist > pr_temp_dist) && (pr_temp_dist < this.ia.pr.size.d * PR_GR_COEF)){
				pr_dist = pr_temp_dist;
				pr_i = i;
			}

			if ((gr_dist > gr_temp_dist) && (gr_temp_dist < this.ia.gr.size.d * PR_GR_COEF)){
				gr_dist = gr_temp_dist;
				gr_i = i;
			}
		}
		
		if (pr_i != -1) {
			// logger.debug("Deleting PR:");
			// logger.debug(dots[pr_i]);
			// logger.debug(this.ia.pr.pos);

			dots.splice(pr_i,1);
		}

		if (gr_i != -1) {
			// logger.debug("Deleting GR:");
			// logger.debug(dots[gr_i]);
			// logger.debug(gr_pos_with_offset);
			// logger.debug(this.getDistance(dots[gr_i], gr_pos_with_offset));

			dots.splice(gr_i,1);
		}
	};

	Hokuyo.prototype.updatePos = function (dots) {
		// we have a ref of our and the ennemy robots (position + speed)
		// logger.info(dots);

		if (dots.length === 0)
			logger.warn("On a reçu un message vide (pas de spots dedans)");
		else {
			if (dots.length != ((this.params.we_have_hats?2:0) + this.params.nb_erobots)) {
				logger.info("On a pas le meme nombre de spots ("+dots.length+") que de robots à détecter ("+
					((this.params.we_have_hats?2:0) + this.params.nb_erobots) + ").");
			}

			// takes a timestamp to be able to compute speeds
			// var now = this.ia.timer.get(); // retourne le temps depuis le début du match en ms XXXXXXXX à réactiver !!!!!!!!!!!!!!!!!
			var now = lastUpdate = lastUpdate+1;

			// if we have hats, kill ourselves (virtualy, of course)
			if (this.params.we_have_hats)
				this.deleteOurRobots(dots);

			// until there are dots left to be matched with ennmies
			while (dots.length > 0){
				// if some robots aren't already matched
				var e_r2Bmatched = [];

				for (var i = 0; i < this.ia.data.erobot.length; i++) {
					if(this.ia.data.erobot[i].lastUpdate < now){
						logger.debug(this.ia.data.erobot[i].lastUpdate);
						e_r2Bmatched.push(this.ia.data.erobot[i]);
					}
				}

				if (e_r2Bmatched.length > 0) {
					var matching_coef = [];
					var best_coef = {
						value: 1,
						dot: -1,
						e_robot: -1
					};

					logger.debug("On s'occupe de :");
					logger.debug(e_r2Bmatched);


					// for each eatimated position of the robots
					for (var d = 0; d < dots.length; d++){
						// for each real point
						for (var i = 0; i < e_r2Bmatched.length; i++) {
							// we make a matching coefficient
							matching_coef[d][i] = this.getMatchingCoef(dots[d], e_r2Bmatched[i], e_r2Bmatched[i].lastUpdate - now, e_r2Bmatched[i].status);

							if (best_coef.value < matching_coef[d][i]) {
								best_coef.value = matching_coef[d][i];
								best_coef.dot = d;
								best_coef.e_robot = i;
							}
						}
					}

					// if the bigger coefficient is under the arbitrary threshold
					// XXXX

					// we take the best/bigger coefficient (well named best_coef :P )

					// if it isn't, set the new position, speed, status, call the "ennemy went there" function
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

					this.ia.data.theEnnemyWentThere(e_r2Bmatched[best_coef.e_robot].pos, best_coef.e_robot);


					// if it's climbing the stairs, set the correct status
					if (isOnTheStairs(dots[best_coef.dot]))
						e_r2Bmatched[best_coef.e_robot].status = "on_the_stairs";
					else
						e_r2Bmatched[best_coef.e_robot].status = "moving";
					
					// and delete the dot
					dots.splice(dot,1);
				} else {
					// if all the robots are tidied up, ouw, that's strange ^^
					logger.warn("Un ou plusieurs spots de plus que de robots sur la table :");
					logger.warn(dots);
					logger.warn("e_r2Bmatched");
					logger.warn(e_r2Bmatched);
					break;
				}

			}

			// XXX /!\ robots on the stairs !


			// if there's some robots to be matched (but no real point left :/), they're lost...
			// we estimate their position and tag them with "lost"
			for (var i = 0; i < this.ia.data.erobot.length; i++) {
				if ((this.ia.data.erobot[i].lastUpdate < now) && (this.ia.data.erobot[i].status == "moving")){
					this.ia.data.erobot[i].pos = {
						x: this.ia.data.erobot[i].pos.x +  this.ia.data.erobot[i].pos.speed.x*Math.abs(this.ia.data.erobot[i].lastUpdate - now),
						y: this.ia.data.erobot[i].pos.y +  this.ia.data.erobot[i].pos.speed.y*Math.abs(this.ia.data.erobot[i].lastUpdate - now)
					};
					this.ia.data.erobot[i].speed = {
						x:0,
						y:0,
					};
					this.ia.data.erobot[i].status = "lost";
					this.ia.data.erobot[i].lastUpdate = now;
				}
			}

			this.lastNow = now;
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

	Hokuyo.prototype.parseOrder = function (from, name, params) {
		var orderName = name.split('.')[1];
		switch (orderName){
			case "position_tous_robots":
				this.updatePos(params.dots);
				break;
			case "nb_hokuyo":
				this.updateNumberOfRobots(params.nb);
				break;
			default:
				logger.warn("Message name " + name + " not understood");
		}
	};

	Hokuyo.prototype.isOk = function () {
		if (this.nb_hokuyo === 0)
			return false;
		else
			return true;
	};

	return Hokuyo;
})();