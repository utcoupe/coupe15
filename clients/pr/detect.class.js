module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.detect');
	var serialPort = require("serialport");
	var SerialPort = serialPort.SerialPort;

	var sp = [];

	function Detect(callback) {
		this.devicesFound = {
			asserv: null,
			others: null,
			ax12: null
		};
		this.callback = callback;
		this.searchArduinos();
	}

	Detect.prototype.sendSP = function (){
		// Close opened ports & detect other devices
		serialPort.list(function (err, ports) {
			for(var i in ports) {
				if(sp[i].readable){
					logger.info("Closing  "+ports[i].comName);
					// this.devicesFound.ax12 = ports[i].comName;
					sp[i].close();
				}
				if(ports[i].comName.indexOf('ttyUSB') >= 0) {
					this.devicesFound.asserv = ports[i].comName;
				} else if((ports[i].comName.indexOf('ttyACM') >= 0 || ports[i].comName.indexOf('COM') >= 0) && ports[i].comName != this.devicesFound.others) {
					this.devicesFound.ax12 = ports[i].comName;
				}
			}

			// Sent to acts
			this.callback(this.devicesFound);
		}.bind(this));
	};

	Detect.prototype.searchArduinos = function() {
		// On check tous les ports disponibles
		serialPort.list(function (err, ports) {
			var nb_found = 0;
			for(var i in ports) {
				sp[i] = new SerialPort(ports[i].comName, { baudrate: 57600 });
				sp[i].write('O\n');

				sp[i].on("data", function (i, data) {
					data = data.toString();
					console.log(ports[i].comName, data);
					if (data == 'O' && !this.devicesFound.others){ // Stepper
						this.devicesFound.others = ports[i].comName;
						clearTimeout(timeout);
						this.sendSP();
					}
					sp[i].close();
				}.bind(this, i));

				sp[i].on("error", function() {}); // Node JS Error if it doesn't exist (and if an "error" event is sent)
			}
		}.bind(this));

		// On check tous les ports qui ne sont pas enregistrés
		timeout = setTimeout(function(){this.sendSP(); }.bind(this), 3000);
	};

	return Detect;
})();