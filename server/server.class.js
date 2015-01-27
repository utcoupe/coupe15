var coupe15 = coupe15 || {};
(function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('Server');

	function Server(server_port) {
		this.server_port = server_port || 3128;
		this.server = require('socket.io')();

		this.server.on('connection', function (client) {
			logger.info("User with id "+client.id+" is connected!");
			client.on('disconnect', function() {
				logger.info("User with id "+client.id+" is disconnected!");
			});

			client.on('type', function(data) {
				if(typeof data !== 'string') {
					logger.error("The client type sent isn't a string");
					return;
				}
				client.join(data);
				client.emit('log', "Connected to the server successfully at " + client.handshake.headers.host);
			});

			// Forwarding orders
			client.on('order', function(data) {
				if(typeof data !== 'object') {
					logger.error("The client order sent isn't a object");
					return;
				}
				if(data.to === undefined) {
					logger.error("The order hasn't 'to' argument (recipient)");
					return;
				}
				if(!(data.to in client.adapter.rooms)) {
					logger.error("The order recipient doesn't exist.");
					return;
				}

				this.server
					.to('webclient')
					.to('simulator')
					.to(data.to)
					.emit('order', data);
			});
		});

		this.server.listen(this.server_port);
		logger.info("Server started at port "+this.server_port);
	}

	coupe15.Server = Server;
})();

var server = new coupe15.Server();