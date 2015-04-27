module.exports = (function () {
	var logger = require('log4js').getLogger('gr.asserv');
	// var COMMANDS = require('./defineParser.js')('../../arduino/asserv/protocol.h');
	var DETECT_SERIAL_TIMEOUT = 100; //ms, -1 to disable

	// For simu
	var SIMU_VITESSE = 1000*0.5; 	// Vitesse en mm/s (*0.5 pour le simu)
	var SIMU_FACTOR_A = 0.3; 	// Facteur
	// var SIMU_PWM_REF = 255; 	// à une PWM de 80
	function SIMU_DIST(pwm, dt) { return SIMU_V_REF*dt; }
	function SIMU_DIST_ROT(a) { return a*100; } // Rayon aproximatif de 10cm
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


	//Early commit, callback should be called when order is done, not when order in correctly ACK'ed

	Asserv.prototype.goxy = function(callback, pos){
		// this.clean();
		// sendCommand(callback, COMMANDS.GOTOA, [
		// 	pos.x,
		// 	pos.y,
		// 	writeAngle(pos.a)
		// ]);
		callback();
	};
	Asserv.prototype.simu_goa = function(a) {
		return function() {
			this.setA(a);
			this.sendPos();
		}.bind(this);
	}
	Asserv.prototype.goa = function(callback, a){
		a = convertA(a);
		if (a < 0) a += 2*Math.PI;
		var tf = SIMU_ROT_TIME(a)*1000;
		for(var t = 0; t < tf; t += 1000/FPS) {
			setTimeout(this.simu_goa(this.pos.a+(a-this.pos.a)*t/tf), t);
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