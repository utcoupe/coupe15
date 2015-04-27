module.exports = (function () {
	var logger = require('log4js').getLogger('gr.asserv');
	// var COMMANDS = require('./defineParser.js')('../../arduino/asserv/protocol.h');
	var DETECT_SERIAL_TIMEOUT = 100; //ms, -1 to disable

	// For simu
	var SIMU_VITESSE = 800*0.5; 	// Vitesse en mm/s *0.5 pour le simu
	var SIMU_FACTOR_A = 0.3; 	// Facteur
	// var SIMU_PWM_REF = 255; 	// à une PWM de 80
	function SIMU_DIST(pwm, dt) { return SIMU_V_REF*dt; }
	function SIMU_DIST_ROT(a) { return Math.abs(a)*100; } // Rayon aproximatif de 10cm
	function SIMU_ROT_TIME(a) { return SIMU_DIST_ROT(a)/(SIMU_VITESSE*SIMU_FACTOR_A); }
	var FPS = 30;

	function Asserv(client) {
		logger.fatal("Lancement de l'asserv en mode simu !");
		this.client = client;
		this.pos = {};

		this.getPos();
	}
	function convertA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
	Asserv.prototype.setA = function(a) {
		// logger.debug(a, convertA(a));
		this.pos.a = convertA(a);
	}

	Asserv.prototype.setPos = function(callback, pos) {
		this.pos.x = pos.x;
		this.pos.y = pos.y;
		this.setA(pos.a);
		this.sendPos();
		callback();
	}
	Asserv.prototype.getPos = function(pos) {
		this.client.send('ia', 'gr.getpos');
	}
	Asserv.prototype.sendPos = function() {
		this.client.send('ia', 'gr.pos', this.pos);
	}

	Asserv.prototype.clean = function(callback){
		// sendCommand(null, COMMANDS.CLEANG);
		callback();
	};

	Asserv.prototype.simu_pwm = function(pwm, x, y, a, dt) {
		return function() {
			this.pos = {
				x: x + Math.cos(a) * SIMU_DIST(pwm, dt),
				y: y + Math.sin(a) * SIMU_DIST(pwm, dt),
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
		var tf = (dist / SIMU_VITESSE)*1000; // *1000 s->ms
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
		da = convertA(a-this.pos.a);

		var tf = SIMU_ROT_TIME(da)*1000; // *1000 s->ms
		for(var t = 0; t < tf; t += 1000/FPS) {
			// logger.debug(this.pos.a+da*t/tf);
			setTimeout(this.simu_goa(this.pos.a+da*t/tf), t);
		}
		setTimeout(this.simu_goa(a), tf);
		setTimeout(callback, tf);
	};

	Asserv.prototype.gotoPath = function(callback, path){
		// this.clean();
		// if(instanceof path !=== "Array") path = path.path; // not sure about Path class right now
		// path.forEach(function(item));
		callback();
	};

	return Asserv;
})();