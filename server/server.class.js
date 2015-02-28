module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('Server');

	function Server(server_port) {
		this.server_port = server_port || 3128;
		
		// Get server IP address
		var os = require('os');
		var networkInterfaces = os.networkInterfaces();
		this.ip = networkInterfaces.wlan0[0].address;
		this.ip_port = this.ip+':'+this.server_port;
		this.webclient_url = this.ip+'/webclient/webclient.html';

		// Create the server
		this.server = require('socket.io')();

		// Create the network default object
		this.network = {
			server: {
				name: "Server",
				ip: this.ip_port
			},
			webclient: {},
			ia: {},
			simulator: {},
			client: {}
		};

		// When the client is connected
		this.server.on('connection', function (client) {
			// When the client is disconnected
			client.on('disconnect', function() {
				if(this.network[client.type][client.id] !== undefined) {
					delete this.network[client.type][client.id];
					this.sendNetwork();
				}
				logger.info(client.type+" is disconnected!");
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
				logger.info(client.type+" is connected!");
				data.options.ip = client.handshake.address;
				this.network[client.type][client.id] = data.options;
				// console.log(this.network);
				client.join(client.type);
				client.emit('log', "Connected to the server successfully at " + client.handshake.headers.host);
				this.sendNetwork();
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
		logger.info("Server started at "+this.ip_port);
		logger.info("Webclient: "+this.webclient_url);
	}

	Server.prototype.sendNetwork = function(){
		// logger.info("Message sent to webclient !");
		this.server.to('webclient').emit('order', {
			to: 'webclient',
			name: 'reseau',
			params: {
				network: this.network
			},
			from: 'server'
			});
	}

	return Server;
})();