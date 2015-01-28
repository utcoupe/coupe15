var coupe15 = coupe15 || {};
(function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('Server');

	function Server(server_port) {
		this.server_port = server_port || 3128;
		this.server = require('socket.io')();

		// Getting server IP address
		var os = require('os');
		var networkInterfaces = os.networkInterfaces();
		this.server_ip = networkInterfaces.wlan0[0].address+':'+this.server_port;

		this.network = {
			server: {
				name: "Server",
				ip: this.server_ip
			},
			webclient: {},
			ia: {},
			simulator: {},
			client: {}
		};

		// When the client is connected
		this.server.on('connection', function (client) {
			logger.info("User with id "+client.id+" is connected!");
			// When the client is disconnected
			client.on('disconnect', function() {
				if(this.network[client.type][client.id] !== undefined) {
					delete this.network[client.type][client.id];
				}
				logger.info("User with id "+client.id+" is disconnected!");
			}.bind(this));

			// When the client send his type
			client.on('type', function(data) {
				if(typeof data.type !== 'string') {
					logger.error("The client type sent isn't a string");
					return;
				}
				if(!(data.type in this.network)) {
					logger.error("The client type `"+data.type+"` isn't valid");
					return;
				}
				// The type is valid
				client.type = data.type;
				this.network[client.type][client.id] = data.options;
				client.join(client.type);
				client.emit('log', "Connected to the server successfully at " + client.handshake.headers.host);
				console.log(this.network);
			}.bind(this));

			// When the client send an order
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
					logger.warn("The order recipient `"+data.to+"` doesn't exist.");
				}
				// The order is valid
				this.server
					.to('webclient')
					.to('simulator')
					.to(data.to)
					.emit('order', data);
			});
		}.bind(this));

		this.server.listen(this.server_port);
		logger.info("Server started at "+this.server_ip);
	}

	coupe15.Server = Server;
})();

var server = new coupe15.Server();