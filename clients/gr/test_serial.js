var serialport = require("serialport");
// var SerialPort = serialport.SerialPort;

switch (process.argv[2]){
	case "ls":
		// list serial ports
		serialport.list(function (err, ports) {
			ports.forEach(function(port) {
				console.log(port.comName);
			});
		});
	break;
	case "start":
		SerialPort = serialport.SerialPort; // make a local instance of it
		// get port name from the command line:
		portName = process.argv[3];

		var myPort = new SerialPort(portName, {
			baudRate: 9600,
			// look for return and newline at the end of each data packet:
			parser: serialport.parsers.readline("\r\n")
		});

		myPort.on('open', showPortOpen);
		myPort.on('data', saveLatestData);
		myPort.on('close', showPortClose);
		myPort.on('error', showError);

		function showPortOpen() {
				console.log('port open. Data rate: ' + myPort.options.baudRate);
				setInterval(function(){
		   		console.log('Sending:' + "z:0");
			   	myPort.write("z:0");
		   }, 5000);
		}

		function saveLatestData(data) {
		   console.log(data);
		}

		function showPortClose() {
		   console.log('port closed.');
		}

		function showError(error) {
		   console.log('Serial port error: ' + error);
		}

	break;
}
