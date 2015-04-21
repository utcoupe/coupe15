(function () {
	"use strict";

	logger.info("Started NodeJS client with pid " + process.pid);


	// Requires
	var log4js = require('log4js');
	var logger = log4js.getLogger('clientpr');

	var SocketClient = require('../../server/socket_client.class.js');
	var server = ""; // server adress
	var client = new SocketClient({
		server_ip: server,
		type: "pr"
	});

	var acts = new (require('./actuators.class.js'))();
	var detect = new (require('./detect.class.js'))(devicesDetected);

	var queue = [];
	var orderInProgress = null;

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
			// TODO : stopper les actions dans toutes les classes !
			this.emit('stopAll');
			return;
		}

		addOrder2Queue(from, name, params);
	});

	function devicesDetected(struct){
		// Verify content
		if (!struct.stepper)
			logger.error("Missing stepper Mega !");

		if (!struc.servos)
			logger.error("Missing servos Nano !");

		if (!struc.asserv)
			logger.warn("Missing asserv Nano");

		if (!struc.ax12)
			logger.warn("Missing USB2AX");

		// Connect to what's detected
		acts.connectTo(struct);

		// Send struc to server
	}

	// Push the order (enfiler)
	function addOrder2Queue(f, n, p){
		var l = queue.length;

		// Adds the order to the queue
		queue.push({
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
		if ((queue.length > 0) && (!orderInProgress)){
			var order = queue.shift();
			orderInProgress = order.name;
			
			logger.info("Going to do '" + orderInProgress + "'...");
			acts.orderHandler(order.from, order.name, order.params, actionFinished);
			
			executeNextOrder();
		}
	}

	function actionFinished(){
		logger.info(orderInProgress + " just finished !");

		orderInProgress = null;
		executeNextOrder();
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