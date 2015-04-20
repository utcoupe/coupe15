module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.detect');
	var serialPort = require("serialport");
	var SerialPort = serialPort.SerialPort;

	var sp = [];

	function Detect(callback) {
		this.devicesFound = {
			asserv: null,
			stepper: null,
			servos: null,
			ax12: null
		};
		this.callback = callback;
		this.searchArduinos();
	}

	Detect.prototype.sendSP = function (){
		// Close opened ports

		// Detect other devices
		serialPort.list(function (err, ports) {
			for(var i in ports) {
				// console.log(sp[i]);
				
				if(sp[i].readable)
					sp[i].close();
				
				if((this.devicesFound.stepper != ports[i].comName) &&
					(this.devicesFound.asserv != ports[i].comName) &&
					(this.devicesFound.servos != ports[i].comName)){
					this.devicesFound.ax12 = ports[i].comName;
				}
			}
		}.bind(this));

		// Sent to acts
		this.callback(this.devicesFound);
	};

	Detect.prototype.searchArduinos = function() {
		var that = this;

		// On check tous les ports disponibles
		serialPort.list(function (err, ports) {
			for(var i in ports) {
				sp[i] = new SerialPort(ports[i].comName, { baudrate: 57600 });

				sp[i].on("data", function (i, data) {
					data = data.toString();
					console.log(ports[i].comName, data);
					if(data == 'S'){ // Stepper
						this.devicesFound.stepper = ports[i].comName;
						if (this.devicesFound.asserv && this.devicesFound.servos){
							clearTimeout(timeout);
							console.log('Ending S');
							this.sendSP();
						}
					} else if(data == 'A'){ // Asserv
						this.devicesFound.asserv = ports[i].comName;
						if (this.devicesFound.stepper && this.devicesFound.servos){
							clearTimeout(timeout);
							console.log('Ending A');
							this.sendSP();
						}
					} else { // Firmata
						this.devicesFound.servos = ports[i].comName;
						if (this.devicesFound.stepper && this.devicesFound.asserv){
							clearTimeout(timeout);
							console.log('Ending else');
							this.sendSP();
						}
					}

				}.bind(this, i));

				sp[i].on("error", function() {}); // Node JS Error if it doesn't exist (and if an "error" event is sent)
			}
		}.bind(this));

		// On check tous les ports qui ne sont pas enregistrés
		timeout = setTimeout(function(){this.sendSP(); }.bind(this), 5000);
	};

	return Detect;
})();