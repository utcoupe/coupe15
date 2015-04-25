


module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('gr.asserv');
	var simu = false;

	var SIMU_V_REF = 1500/4000; // Vitesse = 1500mm/4000ms
	var SIMU_PWM_REF = 80; 		// à une PWM de 80
	function SIMU_DIST(pwm, dt) { return SIMU_V_REF*dt*pwm/SIMU_PWM_REF; }

	function Asserv(sp, client) {
		this.client = client;
		this.getPos();

		if(!sp) {
			logger.fatal("Asserv en mode SIMU")
			simu = true;
		} else {
			this.sp = sp;
			this.sp.on("data", function(data){
				logger.debug("data", data.toString())
			});
			this.sp.on("error", function(data){
				logger.debug("error", data.toString())
			});
		}
	}
	Asserv.prototype.getPos = function(pos) {
		this.client.send('ia', 'gr.getpos');
	}
	Asserv.prototype.setPos = function(callback, pos) {
		this.pos = pos;
		callback();
	}
	Asserv.prototype.sendPos = function(pos) {
		this.client.send('ia', 'gr.pos', pos);
	}

	Asserv.prototype.simu_pwm = function(pwm, x, y, a, dt) {
		return function() {
			this.pos = {
				x: x + Math.cos(a) * SIMU_DIST(pwm, dt),
				y: y + Math.sin(a) * SIMU_DIST(pwm, dt),
				a: a
			}
			this.sendPos(this.pos);
		}.bind(this);
	}
	Asserv.prototype.pwm = function(callback, left, right, ms) {
		if(!simu) {
			this.sp.write(['k', '0', left, right, ms].join(';')+'\n');
		} else {
			var pwm = (left+right)/2;
			for(var t = 0; t < ms; t += 200) { // On actualise toutes les 200ms
				setTimeout(this.simu_pwm(pwm, this.pos.x, this.pos.y, this.pos.a, t), t);
			}
			setTimeout(this.simu_pwm(pwm, this.pos.x, this.pos.y, this.pos.a, ms), ms);
		}
		setTimeout(callback, ms);
	};

	return Asserv;
})();