module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.detect');
	var serialPort = require("serialport");
	var SerialPort = serialPort.SerialPort;

	var sp = [];

	function Detect(callback) {
		this.devicesFound = {
			asserv: null,
			servos: null
		};
		this.callback = callback;
		this.searchArduinos();
	}

	Detect.prototype.sendSP = function (){
		// Sent to acts
		this.callback(this.devicesFound);
	};

	Detect.prototype.searchArduinos = function() {
		// On check tous les ports disponibles
		serialPort.list(function (err, ports) {
			var nb_found = 0;
			for(var i in ports) {
				sp[i] = new SerialPort(ports[i].comName, { baudrate: 57600 });

				sp[i].on("data", function (i, data) {
					data = data.toString();
					console.log(ports[i].comName, data);
					if (data == 'A' && !this.devicesFound.asserv){ // Asserv
						this.devicesFound.asserv = ports[i].comName;
						nb_found++;
					} else if (!this.devicesFound.servos) { // Firmata
						this.devicesFound.servos = ports[i].comName;
						nb_found++;
					}

					sp[i].close();

					if (nb_found == 2) {
						nb_found++; // UGLYYYYY !
						clearTimeout(timeout);
						this.sendSP();
					}
				}.bind(this, i));

				sp[i].on("error", function() {}); // Node JS Error if it doesn't exist (and if an "error" event is sent)
			}
		}.bind(this));

		// On check tous les ports qui ne sont pas enregistrés
		timeout = setTimeout(function(){this.sendSP(); }.bind(this), 3000);
	};

	return Detect;
})();