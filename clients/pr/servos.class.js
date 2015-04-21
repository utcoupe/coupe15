module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.servos');
	var five = require("johnny-five");
	var board = null;

	function Servos(sp) {
		// sp is Serial Port NAME
		this.ready = false;
		this.orders_sent = [];

		this.connect(sp);
	}

	Servos.prototype.connect = function(sp) {
		board = new five.Board({
			port: sp,
			repl: false
		});

		board.on("ready", function() {
			this.ready = true;

			// var servo = new five.Servo(9);

			// // Sweep from 0-180 and repeat.
			// servo.sweep();
		}.bind(this));
	};

	Servos.prototype.disconnect = function() {
		this.ready = false;
	};

	return Servos;
})();