module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.elevator');
	var serialPort = require("serialport");
	var SerialPort = serialPort.SerialPort

	function Detect() {
		this.searchArduinos();
	}

	Detect.prototype.searchArduinos = function() {
		var sp = [];
		// On check tous les ports disponibles
		serialPort.list(function (err, ports) {
			for(var i in ports) {
				sp[i] = new SerialPort(ports[i].comName, { baudrate: 57600 });
				sp[i].on("data", function (i, data) {
					data = data.toString();
					console.log(ports[i].comName, data);
					if(data == 'S') logger.error(data)
					// if(data == ID_ARDUINO) { // S comme Stepper
					// 	this.arduinoFound(sp[i], ports[i].comName);
					// }
							var five = require("johnny-five");
	var board = new five.Board({
		port: '/dev/ttyUSB0',
		repl: false
	});

board.on("ready", function() {

  var servo = new five.Servo(9);

  // Sweep from 0-180 and repeat.
  servo.sweep();
});
				}.bind(this, i));
				sp[i].on("error", function() {}); // Node JS Error if it doesn't exist (and if an "error" event is sent)
			}
		}.bind(this));
	}

	var d = new Detect();




	return Detect;
})();