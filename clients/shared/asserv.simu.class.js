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
	Asserv.prototype.setPos = function(pos, callback) {
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
		callback();
	};
	Asserv.prototype.avancerPlot = function(callback) {
		setTimeout(callback, 1200);
	}

	Asserv.prototype.setVitesse = function(v, r, callback) {
		this.vitesse = parseInt(v);
		callback();
	};
	Asserv.prototype.calageX = function(x, a, callback) {
		this.setPos({x: x, y: this.pos.y, a: a}, callback);
	}
	Asserv.prototype.calageY = function(y, a, callback) {
		this.setPos({x: this.pos.x, y: y, a: a}, callback);
	}

	Asserv.prototype.simu_speed = function(vit, x, y, a, dt) {
		return function() {
			this.pos = {
				x: x + Math.cos(a) * vit*dt/1000,
				y: y + Math.sin(a) * vit*dt/1000,
				a: a
			}
			this.sendPos();
		}.bind(this);
	}
	Asserv.prototype.speed = function(l, a, ms,callback) {
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
				y: y + Math.sin(a) * SIMU_DIST(pwm, dt/1000, this.vitesse),
				a: a
			}
			this.sendPos();
		}.bind(this);
	}
	Asserv.prototype.pwm = function(left, right, ms, callback) {
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
	Asserv.prototype.goxy = function(x, y, sens, callback){

		var dx = x-this.pos.x;
		var dy = y-this.pos.y;
		var dist = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
		var tf = (dist / (this.vitesse*SIMU_FACTOR_VIT))*1000; // *1000 s->ms

		if(sens == "avant") angle_depart = Math.atan2(dy,dx);
		else if(sens == "arriere") angle_depart = convertA(Math.atan2(dy,dx)+Math.PI);
		else if (Math.abs(Math.atan2(dy,dx)) < Math.abs(convertA(Math.atan2(dy,dx)+Math.PI))) angle_depart = Math.atan2(dy,dx);
		else angle_depart = convertA(Math.atan2(dy,dx)+Math.PI);


		this.goa(angle_depart, function() {
			for(var t = 0; t < tf; t += 1000/FPS) {
				setTimeout(this.simu_goxy(this.pos.x+dx*t/tf, this.pos.y+dy*t/tf), t);
			}
			setTimeout(this.simu_goxy(x, y), tf);
			setTimeout(callback, tf);
		}.bind(this));
	};
	Asserv.prototype.simu_goa = function(a) {
		return function() {
			this.setA(a);
			this.sendPos();
		}.bind(this);
	}
	Asserv.prototype.goa = function(a,callback){
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

	Asserv.prototype.setPid = function(p, i, d, callback){
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