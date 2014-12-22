// Node JS client test

// manual here : http://nodejs.org/api/net.html

var net = require('net');
var util = require("util"); // pr les var_dump like fonctions

prefix = "[JS-HK]  ",
socketUnixPath = "";
if(process.argv.length>2){
	socketUnixPath = process.argv[2];
	console.log(prefix+"Socket adress recieved by js : \""+socketUnixPath+"\"");
} else {
	console.log(prefix+ "usage : something.js socket_path");
	process.exit();
}

// Connection
var socketUnix = net.connect({path: socketUnixPath},
		function() { //'connect' listener
	console.log(prefix+'I\'m connected to the Unix Socket server :)');
	
	socketUnix.write('Hello world!\r\n');
});

// If smt is written in the socket
socketUnix.on('data', function(data) {
	console.log(prefix+'Read this message ('+data.length+' bytes long) :');
	try {
	    JSON.parse(JSON.stringify(data));
	    var mess = JSON.parse(data) ;
	    console.log(prefix+mess['patate']);
	    console.log(prefix+typeof(mess));
	    console.log(prefix+typeof(mess['patate']));
	} catch (e) {
	    console.log(prefix+ "not JSON: "+e);
		console.log(prefix+data.toString());
	}
	socketUnix.end();
});

// On error, print error and exit
socketUnix.on('error', function (e) {
	if (e.code == 'EADDRINUSE') {
		console.log(prefix+'Address in use, retrying...');
		setTimeout(function () {
			server.close();
			server.connect({path: socketUnixPath},
					function() { console.log(prefix+'Client connected'); });
		}, 1000);
	} else if (e.code == 'ECONNREFUSED') {
		console.log(prefix+'Connection refused, maybe there\'s no server/socketUnixPath is wrong...');
		console.log(prefix+'Exiting...');
	} else if (e.code == 'ECONNRESET') {
		console.log(prefix+'Connection closed, exiting...');
		console.log(prefix+'Exiting...');
	} else {
		console.log(prefix+'Fatal error : '+e);
		console.log(prefix+'Exiting...');
	}
});

// If server closes socket
socketUnix.on('end', function() {
	console.log(prefix+'Client disconnected');
});