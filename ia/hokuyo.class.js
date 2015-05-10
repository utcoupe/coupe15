module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	// var gaussian = require('gaussian');
	var logger = log4js.getLogger('ia.hokuyo');

	var GR_OFFSET = 110; // (mm) distance between our robot origin and the robot's center
	var PR_GR_COEF = 1; // security coeff to bind our robots with the dots
	var SEGMENT_DELTA_D = 30; // (mm) between 2 iterations on a segment to detect colision
	var DELTA_T = 500; // (ms) in the future : estimation of ennemy robots

	function Hokuyo(ia, params) {
		this.params = params || {};
		this.nb_hokuyo = 0;
		this.ia = ia;
		this.lastNow = 0; // dernier timestamp où on a update (changé à la fin de l'update)
		this.matchStarted = false;
	}

	Hokuyo.prototype.start = function () {
		this.matchStarted = true;
	};

	Hokuyo.prototype.getDistance = function (spot1, spot2) {
		return Math.sqrt(Math.pow(spot1.x - spot2.x, 2) + Math.pow(spot1.y - spot2.y, 2));
	};

	Hokuyo.prototype.isOnTheStairs = function (spot){
		return (spot.x>967) && (spot.x < 2033) && (spot.y > 2000-580);
	};

	Hokuyo.prototype.getMatchingCoef = function (spot, eRobot, dt, status){
		var estimatedPos = {
			x: eRobot.pos.x + eRobot.speed.x*dt,
			y: eRobot.pos.y + eRobot.speed.y*dt
		};

		// var distribution = gaussian(0,eRobot.d);
		var distance = this.getDistance(spot, estimatedPos);
		// logger.debug(distance);
		// return 10*distribution.pdf(distance/10);
		return distance;
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

		// logger.debug("Pos PR");
		// logger.debug(this.ia.pr.pos);
		// logger.debug("Pos GR");
		// logger.debug(gr_pos_with_offset);

		for (var i = 0; i < dots.length; i++) {
			var pr_temp_dist = this.getDistance(dots[i], this.ia.pr.pos);
			var gr_temp_dist = this.getDistance(dots[i], gr_pos_with_offset);
			// logger.debug("Pr le pt :");
			// logger.debug(dots[i]);
			// logger.debug(pr_temp_dist);
			// logger.debug(gr_temp_dist);


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

			if (pr_i < gr_i) {
				gr_i = gr_i -1;
			}
		} else {
			logger.warn("On a pas trouvé le PR parmis les points de l'Hokuyo");
		}

		if (gr_i != -1) {
			// logger.debug("Deleting GR:");
			// logger.debug(dots[gr_i]);
			// logger.debug(gr_pos_with_offset);
			// logger.debug(this.getDistance(dots[gr_i], gr_pos_with_offset));

			dots.splice(gr_i,1);
		} else {
			logger.warn("On a pas trouvé le GR parmis les points de l'Hokuyo");
		}
		// logger.debug(dots);
	};

	Hokuyo.prototype.getBestMatchingCoef = function(dots, robots, now) {
		// Return the couple of ennemy robot and dot that matches the best

		var matching_coef = [];
		var best_coef = {
			value: this.getDistance({x: 0, y:0}, {x: 3000, y:2000}),
			dot: -1,
			e_robot: -1
		};

		for (var d = 0; d < dots.length; d++){
			// for each real point
			matching_coef[d] = [];
			for (var i = 0; i < robots.length; i++) {
				// we make a matching coefficient

				matching_coef[d][i] = this.getMatchingCoef(dots[d], robots[i], robots[i].lastUpdate - now, robots[i].status);

				if (best_coef.value > matching_coef[d][i]) {
					best_coef.value = matching_coef[d][i];
					best_coef.dot = d;
					best_coef.e_robot = i;
				}
			}
		}

		// logger.debug("Coefficients de matching");
		// logger.debug(matching_coef);

		return best_coef;
	};

	Hokuyo.prototype.updatePos = function (dots) {
		// Invert dots if we are green
		if (this.ia.color == "green"){
			for (var i = 0; i < dots.length; i++) {
				dots[i].x = 3000 - dots[i].x;
			}
		}

		if (!this.matchStarted){
			logger.warn("Le match n'a pas commencé");
			return;
		}

		if (dots.length === 0)
			logger.warn("On a reçu un message vide (pas de spots dedans)");
		else {
			if (dots.length != ((this.params.we_have_hats?2:0) + this.params.nb_erobots)) {
				logger.info("On a pas le meme nombre de spots ("+dots.length+") que de robots à détecter ("+
					((this.params.we_have_hats?2:0) + this.params.nb_erobots) + ").");
			}

			// takes a timestamp to be able to compute speeds
			var now = this.ia.timer.get();
			// var now = this.lastNow = this.lastNow+1;

			// if we have hats, kill ourselves (virtualy, of course)
			if (this.params.we_have_hats)
				this.deleteOurRobots(dots);

			// until there are dots left to be matched with ennmies
			while (dots.length > 0){
				// if some robots aren't already matched
				var e_r2Bmatched = [];

				for (var i = 0; i < this.ia.data.erobot.length; i++) {
					if(this.ia.data.erobot[i].lastUpdate < now){
						// logger.debug(this.ia.data.erobot[i].name + " last update :");
						// logger.debug(this.ia.data.erobot[i].lastUpdate);
						e_r2Bmatched.push(this.ia.data.erobot[i]);
					}
				}

				if (e_r2Bmatched.length > 0) {
					// logger.debug("On s'occupe des robots :");
					// logger.debug(e_r2Bmatched);
					// logger.debug("Avec les points :");
					// logger.debug(dots);


					// for each eatimated position of the robots
					var best_coef = this.getBestMatchingCoef(dots, e_r2Bmatched, now);
					// logger.debug(best_coef);

					// if the bigger coefficient is under the arbitrary threshold
					// XXX

					// we take the best/bigger coefficient (well named best_coef :P )

					// if it isn't, set the new position, speed, status, call the "ennemy went there" function
					// logger.debug("On a matché le point suivant avec le "+e_r2Bmatched[best_coef.e_robot].name+" ennemi");
					// logger.debug(dots[best_coef.dot]);
					logger.debug("Le"+e_r2Bmatched[best_coef.e_robot].name+" est passé de"+e_r2Bmatched[best_coef.e_robot].pos.x+", "+e_r2Bmatched[best_coef.e_robot].pos.y+ " à "+dots[best_coef.dot].x+", "+dots[best_coef.dot].y);

					if (best_coef.e_robot == -1){
						logger.warn('Erreur de matching (il reste des robots à matcher avec des points mais ils collent pas) :');
						logger.warn(e_r2Bmatched);
						logger.warn(dots);
						break;
					}

					e_r2Bmatched[best_coef.e_robot].lastUpdate = now;
					var deltaT = now - this.lastNow;
					if (deltaT !== 0){
						e_r2Bmatched[best_coef.e_robot].speed = {
							x: (dots[best_coef.dot].x - e_r2Bmatched[best_coef.e_robot].pos.x)/deltaT,
							y: (dots[best_coef.dot].y - e_r2Bmatched[best_coef.e_robot].pos.y)/deltaT
						};
					} else {
						logger.warn("Tiens, deltaT = 0, c'est bizarre...");
						e_r2Bmatched[best_coef.e_robot].speed = {
							x:0,
							y:0
						};
					}

					e_r2Bmatched[best_coef.e_robot].pos = {
						x: dots[best_coef.dot].x,
						y: dots[best_coef.dot].y,
					};

					// logger.debug("Position et vitesse du robot :");
					logger.debug(e_r2Bmatched[best_coef.e_robot].pos);
					// logger.debug(e_r2Bmatched[best_coef.e_robot].speed);


					this.ia.data.theEnnemyWentThere(e_r2Bmatched[best_coef.e_robot].pos, best_coef.e_robot);


					// if it's climbing the stairs, set the correct status
					if (this.isOnTheStairs(dots[best_coef.dot])){
						e_r2Bmatched[best_coef.e_robot].status = "on_the_stairs";
						logger.info(e_r2Bmatched[best_coef.e_robot].status);
					} else {
						e_r2Bmatched[best_coef.e_robot].status = "moving";
						logger.debug(e_r2Bmatched[best_coef.e_robot].status);
					}
					
					// and delete the dot
					dots.splice(best_coef.dot,1);
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
						x: this.ia.data.erobot[i].pos.x +  this.ia.data.erobot[i].speed.x*Math.abs(this.ia.data.erobot[i].lastUpdate - now),
						y: this.ia.data.erobot[i].pos.y +  this.ia.data.erobot[i].speed.y*Math.abs(this.ia.data.erobot[i].lastUpdate - now)
					};
					this.ia.data.erobot[i].speed = {
						x:0,
						y:0,
					};
					this.ia.data.erobot[i].status = "lost";
					this.ia.data.erobot[i].lastUpdate = now;
				} else if ((this.ia.data.erobot[i].lastUpdate < now) && (this.ia.data.erobot[i].status == "lost")){
					// Si le robot était déjà perdu à l'itération d'avant
					this.mayday("On a perdu le "+this.ia.data.erobot[i].name + " ennemi");
				}
			}

			this.lastNow = now;


			this.detectCollision();
		}

	};

	Hokuyo.prototype.detectCollision = function() {
		var collision = false;
		var pf = this.ia.pr.path;
		var ebots = [{ // estimated positions
				x:this.ia.data.erobot[0].pos.x +  this.ia.data.erobot[0].speed.x*DELTA_T,
				y:this.ia.data.erobot[0].pos.y +  this.ia.data.erobot[0].speed.y*DELTA_T
			}];

		if (this.ia.data.nb_erobots == 2) {
			ebots.push = {
				x:this.ia.data.erobot[1].pos.x +  this.ia.data.erobot[1].speed.x*DELTA_T,
				y:this.ia.data.erobot[1].pos.y +  this.ia.data.erobot[1].speed.y*DELTA_T
			};
		}

		// for each path segment
		for (var i = 0; i < this.ia.pr.path.length-1; (i++) && !collision) {
			var segment = [this.ia.pr.path[i], this.ia.pr.path[i+1]]; // so segment[0][0] is the x value of the beginning of the segment
			var segLength = this.getDistance({x:segment[0][0] , y:segment[0][1] }, {x:segment[1][0] , y:segment[1][1] });
			var nthX = (segment[1][0]-segment[0][0])*SEGMENT_DELTA_D/segLength; // segment X axis length nth 
			var nthY = (segment[1][1]-segment[0][1])*SEGMENT_DELTA_D/segLength;

			// for each X cm of the segment
			for (var j = 0; (j*SEGMENT_DELTA_D) < segLength; (j++) && !collision) {

				var segPoint = {
					x: segment[0][0] + nthX*k,
					y: segment[0][1] + nthY*k
				};

				// distance to each estimated position of the ennemi robots
				var minDist = getDistance(ebots[0], segPoint);

				if (ebots.length == 2) {
					var tmp = getDistance(ebots[0], segPoint);
					if (tmp < minDist) {
						minDist = tmp;
					}
				}

				// if one of the dist < security diameter, there will be a collision
				if (minDist < SECURITY_COEF) {
					collision = true;
				}
				
			}
		}

		if (collision) {
			this.ia.pr.onColision();
		}
	};

	Hokuyo.prototype.updateNumberOfRobots = function (nb) {
		switch (nb){
			case 0:
				this.nb_hokuyo = 0;
				// Fatal error
				this.mayday("On plus d'hokuyo");
				break;
			case 1:
				this.nb_hokuyo = 1;
				// bigger security zone ? throw startAgain ?
				break;
			case 2:
				this.nb_hokuyo = 2;
				break;
			default:
				logger.info("Invalid number of robots received :" + nb);
		}
	};

	Hokuyo.prototype.mayday = function(reason) {
		logger.error("Mayday called, the given reason is :");
		logger.error(reason);

		// XXX ? -> en fait on bloque peut-être pas ! : si le robot s'est vautré, c'est son soucis
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