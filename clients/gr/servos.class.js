module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('gr.servos');
	var five = require("johnny-five");
	var board = null;
	var servo_gauche, servo_droit;

	function Servos(sp) {
		this.connect(sp);
	}

	Servos.prototype.connect = function(sp) {
		board = new five.Board({
			port: sp,
			repl: false
		});

		board.on("ready", function() {
			logger.info("Board servos Ready");
			servo_gauche = new five.Servo(2);
			servo_droit = new five.Servo(3);
			this.acheter();
		}.bind(this));
	};

	Servos.prototype.acheter = function(callback) {
		servo_gauche.to(170);
		servo_droit.to(0);
		setTimeout(callback, 500);
	};
	Servos.prototype.vendre = function(callback) {
		servo_gauche.to(50);
		servo_droit.to(120);
		setTimeout(callback, 500);
	};

	return Servos;
})();