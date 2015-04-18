(function () {
	"use strict";

	// Requires
	var log4js = require('log4js');
	var logger = log4js.getLogger('clientpr');
	var acts = new (require('./actuators.class.js'))();

	var SocketClient = require('../../server/socket_client.class.js');
	var server = ""; // server adress
	var client = new SocketClient({
		server_ip: server,
		type: "pr"
	});

	logger.info("Started NodeJS client with pid " + process.pid);

	var queue = [];

	// On message
	client.order(function (from, name, params){
		// if flush the queue
		if(name == "queue_flush"){
			queue = [];
			return;
		}

		// if end of match, empty the queue and stop the current action
		if(name == "stop"){
			queue = [];
			// XXX comment stopper un action en cours ???
			return;
		}

		addOrder2Queue(from, name, params);
	});

	// Unshift the order (enfiler)
	function addOrder2Queue(f, n, p){
		var l = queue.length;

		// Adds the order to the queue
		queue.unshift({
			from: f,
			name: n,
			params: p
		});
		// logger.info("Order added to queue ! : ");
		// logger.info(queue);

		executeNextOrder();
	}

	// Execute order
	function executeNextOrder(){
		if (queue.length !== 0){
			var order = queue.shift();
			
			logger.info("Doing '" + order.name + "'...");
			acts.orderHandler(order.from, order.name, order.params);
			
			executeNextOrder();
		}
	}

	function quit () {
		logger.info("Please wait while exiting...");
		acts.quit();
	}


	// Exiting :
	//do something when app is closing
	process.on('exit', quit);
	// catches ctrl+c event
	process.on('SIGINT', quit);
	// //catches uncaught exceptions
	// process.on('uncaughtException', quit);
})();