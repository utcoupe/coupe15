(function () {
	"use strict";

	// Requires
	var logger = require('log4js').getLogger('pr');

	// logger.info("Started NodeJS client with pid " + process.pid);

	var SocketClient = require('../../server/socket_client.class.js');
	var server = "127.0.0.1:3128"; // server adress
	var client = new SocketClient({
		server_ip: server,
		type: "pr"
	});

	var lastStatus = {
		"status": "waiting"
	};
	sendChildren(lastStatus);

	var acts = new (require('./actuators.class.js'))(client);
	var detect = null;

	var queue = [];
	var orderInProgress = false;

	start();

	// On message
	client.order(function (from, name, params){
		// logger.info("Recieved an order "+name);
		switch (name){
			case "queue_flush":
				queue = [];
				break;
			case "start":
				queue = [];
				start();
				break;
			case "stop":
				queue = [];
				// quitC("stop");
				stop();
				break;
			default:
				addOrder2Queue(from, name, params);
		}
	});

	function start(){
		logger.info("Starting  :)");
		sendChildren({
			status: "starting", 
			children:[]
		});
		detect = new (require('./detect.class.js'))(devicesDetected);
	}

	function stop(){
		acts.quit();

		// Send struct to server
		sendChildren({
			status: "waiting", 
			children:[]
		});
	}

	function devicesDetected(struct){
		// Verify content
		if (!struct.others)
			logger.warn("Missing others Mega");

		// if (!struct.servos)
		// 	logger.warn("Missing servos Nano");

		if (!struct.asserv)
			logger.warn("Missing asserv Nano");

		if (!struct.ax12)
			logger.warn("Missing USB2AX");

		// Connect to what's detected
		acts.connectTo(struct);

		// Send struct to server
		sendChildren(acts.getStatus());
	}

	// Sends status to server
	function sendChildren(status){
		lastStatus = status;

		client.send("server", "server.childrenUpdate", lastStatus);
	}

	function isOk(){
		if(lastStatus.status != "waiting")
			lastStatus = acts.getStatus();
		
		client.send("ia", "isOkAnswer", lastStatus);
		client.send("server", "server.childrenUpdate", lastStatus);
	}


	// Push the order (enfiler)
	function addOrder2Queue(f, n, p){
		if(n == 'clean') {
			logger.info("Going to do '" + n);
			acts.orderHandler(f, n, p, actionFinished);
		} else if(queue.length < 50){
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
	}

	// Execute order
	function executeNextOrder(){
		if ((queue.length > 0) && (!orderInProgress)){
			var order = queue.shift();
			orderInProgress = order.name;
			
			logger.info("Going to do '" + orderInProgress);
			logger.debug(order.params);
			acts.orderHandler(order.from, order.name, order.params, actionFinished);
			
			executeNextOrder();
		}
	}

	function actionFinished(){
		logger.info(orderInProgress + " just finished !");

		orderInProgress = false;
		executeNextOrder();
	}
	function quit () {
		logger.info("Please wait while exiting...");
		acts.quit();
		process.exit();
	}


	// Exiting :
	//do something when app is closing
	// process.on('exit', quit);
	// catches ctrl+c event
	// process.on('SIGINT', quit);
	// //catches uncaught exceptions
	// process.on('uncaughtException', quit);
})();