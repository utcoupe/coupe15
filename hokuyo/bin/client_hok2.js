(function (){
	"use strict";

	/* JS which will connect to the server, and then
	*  will execute the C program to control the Hokuyos.
	*  It will transfer datas from/to AI and the C Hokuyo controller
	*/

	var net = require('net'); // UNIX socket
	var util = require("util"); // var_dump like functions
	var spawn = require('child_process').spawn;

	// var server = "192.168.0.0/client/client"; // server adress

	// on('connection')

		// ask for color, # of robots...

		// on('got_answer')

			var color = "green"; // just recieved
			var init_wizard = 'no_init_wizard'; // idem
			var nbr_hok = '4';

			// execute C program
			var command = "./hokuyo";
			var args = [color, init_wizard, '[path_sock]', nbr_hok];
			// var options = // default : { cwd: undefined, env: process.env};
			console.log('Launching : ' + command + ' ' + args);
			var child = spawn(command, args);

			child.stdout.on('data', function(data) {
			    console.log('stdout: ' + data);
			});

			child.stderr.on('data', function(data) {
			    console.log('stderr: ' + data);
			});
			
			child.on('close', function(code) {
			    console.log('closing code: ' + code);
			});
)}