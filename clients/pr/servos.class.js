module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.servos');
	var five = require("johnny-five");
	var board = new five.Board({
		//port: '/dev/ttyUSB0',
		repl: false
	});

board.on("ready", function() {

  var servo = new five.Servo(9);

  // Sweep from 0-180 and repeat.
  servo.sweep();
});

	function Servos() {
		this.sp = null;
		this.ready = false;
		this.orders_sent = [];

		this.connectToArduino();
	}

	// Tests
	// elev = new Elevator();
	// setTimeout(function() {
	// 	logger.info("Démarrage");
	// 	elev.move1Up();
	// 	elev.move1Down();
	// 	elev.move1Up();
	// 	elev.move1Down();
	// 	elev.release1();
	// }, 1000);

	return Servos;
})();