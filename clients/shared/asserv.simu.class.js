module.exports = (function () {
	var logger = require('log4js').getLogger('asserv');

	// For simu
	var SIMU_FACTOR_VIT = 0.5;
	var SIMU_FACTOR_A = 0.3; 	// Facteur
	// var SIMU_PWM_REF = 255; 	// à une PWM de 80
	function SIMU_DIST(pwm, dt, vitesse) { return (vitesse*SIMU_FACTOR_VIT)*dt; }
	function SIMU_DIST_ROT(a) { return Math.abs(a)*100; } // Rayon aproximatif de 10cm
	function SIMU_ROT_TIME(a, vitesse) { return SIMU_DIST_ROT(a)/(vitesse*SIMU_FACTOR_VIT*SIMU_FACTOR_A); }
	var FPS = 30;

	function Asserv(client, who) {
		this.client = client;
		this.who = who;
		this.pos = {
			x:0,y:0,a:0
		};
		this.vitesse = 800;
		this.getPos();
	}
	function convertA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
	Asserv.prototype.setA = function(a) {
		// logger.debug(a, convertA(a));
		this.pos.a = convertA(a);
	}
	Asserv.prototype.Pos = function(pos) {
		this.pos.x = pos.x;
		this.pos.y = pos.y;
		this.setA(pos.a);
	}
	Asserv.prototype.setPos = function(callback, pos) {
		this.Pos(pos);
		this.sendPos();
		callback();
	}
	Asserv.prototype.getPos = function(pos) {
		this.client.send('ia', this.who+'.getpos');
	}
	Asserv.prototype.sendPos = function() {
		this.client.send('ia', this.who+'.pos', this.pos);
	}

	Asserv.prototype.clean = function(callback){
		// sendCommand(null, COMMANDS.CLEANG);
		callback();
	};
	Asserv.prototype.avancerPlot = function(callback) {
		setTimeout(callback, 1200);
	}

	Asserv.prototype.setVitesse = function(callback, v) {
		this.vitesse = parseInt(v);
		callback();
	};

	Asserv.prototype.simu_speed = function(vit, x, y, a, dt) {
		return function() {
			this.pos = {
				x: x + Math.cos(a) * vit*dt/1000,
				y: y - Math.sin(a) * vit*dt/1000,
				a: a
			}
			this.sendPos();
		}.bind(this);
	}
	Asserv.prototype.speed = function(callback, l, a, ms) {
		// this.simu.pwm(callback, l/3, l/3, ms);
		for(var t = 0; t < ms; t += 1000/FPS) {
			setTimeout(this.simu_speed(l, this.pos.x, this.pos.y, this.pos.a, t), t);
		}
		setTimeout(this.simu_speed(l, this.pos.x, this.pos.y, this.pos.a, ms), ms);
		setTimeout(callback, ms);
	};

	Asserv.prototype.simu_pwm = function(pwm, x, y, a, dt) {
		return function() {
			this.pos = {
				x: x + Math.cos(a) * SIMU_DIST(pwm, dt/1000, this.vitesse),
				y: y - Math.sin(a) * SIMU_DIST(pwm, dt/1000, this.vitesse),
				a: a
			}
			this.sendPos();
		}.bind(this);
	}
	Asserv.prototype.pwm = function(callback, left, right, ms) {
		var pwm = (left+right)/2;
		for(var t = 0; t < ms; t += 1000/FPS) {
			setTimeout(this.simu_pwm(pwm, this.pos.x, this.pos.y, this.pos.a, t), t);
		}
		setTimeout(this.simu_pwm(pwm, this.pos.x, this.pos.y, this.pos.a, ms), ms);
		setTimeout(callback, ms);
	};

	Asserv.prototype.simu_goxy = function(x, y) {
		return function() {
			this.pos.x = x;
			this.pos.y = y;
			this.sendPos();
		}.bind(this);
	}
	Asserv.prototype.goxy = function(callback, x, y){
		var dx = x-this.pos.x;
		var dy = y-this.pos.y;
		var dist = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
		var tf = (dist / (this.vitesse*SIMU_FACTOR_VIT))*1000; // *1000 s->ms
		this.goa(function() {
			for(var t = 0; t < tf; t += 1000/FPS) {
				setTimeout(this.simu_goxy(this.pos.x+dx*t/tf, this.pos.y+dy*t/tf), t);
			}
			setTimeout(this.simu_goxy(x, y), tf);
			setTimeout(callback, tf);
		}.bind(this), -Math.atan2(dy,dx));
	};
	Asserv.prototype.simu_goa = function(a) {
		return function() {
			this.setA(a);
			this.sendPos();
		}.bind(this);
	}
	Asserv.prototype.goa = function(callback, a){
		a = convertA(a);
		da = convertA(a-this.pos.a);

		var tf = SIMU_ROT_TIME(da, this.vitesse)*1000; // *1000 s->ms
		for(var t = 0; t < tf; t += 1000/FPS) {
			// logger.debug(this.pos.a+da*t/tf);
			setTimeout(this.simu_goa(this.pos.a+da*t/tf), t);
		}
		setTimeout(this.simu_goa(a), tf);
		setTimeout(callback, tf);
	};

	Asserv.prototype.setPid = function(callback, p, i, d){
		callback();
	};

	// Asserv.prototype.gotoPath = function(callback, path){
	// 	// this.clean();
	// 	// if(instanceof path !=== "Array") path = path.path; // not sure about Path class right now
	// 	// path.forEach(function(item));
	// 	callback();
	// };

	return Asserv;
})();