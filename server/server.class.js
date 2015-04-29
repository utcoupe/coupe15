module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('Server');
	var spawn = require('child_process').spawn;
	var Convert = require('ansi-to-html');
	var convert = new Convert({newLine: true});

	function Server(server_port) {
		this.server_port = server_port || 3128;
		
		// Get server IP address
		var os = require('os');
		var networkInterfaces = os.networkInterfaces();
		var currentInterface = networkInterfaces["wlan0"] || networkInterfaces["Wi-Fi"];
		if(!currentInterface){
			logger.error("No valid wireless lan interace :\n"+Arrays.toString(Object.keys(networkInterfaces)));
			process.exit();
		}
		this.ip = currentInterface[0].address;
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
			hokuyo: {},
			pr: {},
			gr: {}
		};
		this.utcoupe = {
			'ia': false,
			'pr': false,
			'gr': false,
			'hokuyo': false
		};
		this.progs = {
			'ia': null,
			'pr': null,
			'gr': null,
			'hokuyo': false
		}

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
				this.sendUTCoupe();
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
				// if(!(data.to in client.adapter.rooms)) {
				// 	logger.warn("The order recipient `"+data.to+"` doesn't exist.");
				// }
				if(data.name == 'server.launch') {
					this.launch(data.params);
				} else if(data.name == 'server.stop') {
					this.stop(data.params);
				} else if(data.name == 'server.childrenUpdate') {
					// console.log(this.network);
					this.network[client.type][client.id].status = data.params.status || "";
					this.network[client.type][client.id].children = data.params.children || "";
					// console.log(this.network);
					this.sendNetwork();
				} else if (data.name == 'server.iaColor') {
					this.network[client.type][client.id].color = data.params.color || "";
					this.sendNetwork();
				} else {
					// The order is valid
					// logger.info("Data " +data.name+ " from " +data.from+ " to " +data.to);
					this.server.to('webclient').to(data.to).emit('order', data);
				}
			}.bind(this));
		}.bind(this));

		this.server.listen(this.server_port);
		logger.info("Server started at "+this.ip_port);
		logger.info("Webclient: "+this.webclient_url);
	}

	Server.prototype.sendNetwork = function(){
		// logger.info("Message sent to webclient !");
		// logger.info(this.network);
		this.server.to('webclient').emit('order', {
			to: 'webclient',
			name: 'reseau',
			params: {
				network: this.network
			},
			from: 'server'
			});
	}

	Server.prototype.launch = function(params) {
		var prog = params.prog;
		if(!this.utcoupe[prog]) {
			switch(prog) {
				case 'ia':
					this.progs[prog] = spawn('node', ['./ia/main.js', params.color]);
				break;
				case 'pr':
					this.progs[prog] = spawn('node', ['./clients/pr/main.js']);
				break;
				case 'gr':
					this.progs[prog] = spawn('sudo', ['node', './clients/gr/main.js']);
				break;
				case 'hokuyo':
					this.progs[prog] = spawn('node', ['./hokuyo/client_hok.js']);
				break;
			}

			this.progs[prog].stdout.on('data', function (data) {
				// logger.debug(data);
				// for(var i in data) {
				// 	if(data[i] == 5)
				// 		logger.debug('LOL');
				// }
				this.server.to('webclient').emit('order', {
					to: 'webclient',
					name: 'logger',
					params: convert.toHtml(data.toString()),
					from: 'server'
				});
			}.bind(this));
			this.progs[prog].on('error', function (prog, data) {
				this.server.to('webclient').emit('order', {
					to: 'webclient',
					name: 'logger',
					params: '[ERROR]['+prog+'] '+data.toString(),
					from: 'server'
				});
			}.bind(this, prog));
			this.progs[prog].on('close', function (prog, data) {
				this.server.to('webclient').emit('order', {
					to: 'webclient',
					name: 'logger',
					params: '[CLOSE]['+prog+'] '+data.toString(),
					from: 'server'
				});
				this.stop(prog);
			}.bind(this, prog));
			 
				// logger.debug(prog);
				// logger.fatal(prog, '|stdout|', data.toString());
			this.utcoupe[prog] = true;
		}
		this.sendUTCoupe();
	}

	Server.prototype.stop = function(prog) {
		if(this.utcoupe[prog]) {
			this.progs[prog].kill();

			this.utcoupe[prog] = false;
		}
		this.sendUTCoupe();
	}
	Server.prototype.sendUTCoupe = function(prog) {
		this.server.to('webclient').emit('order', {
			to: 'webclient',
			name: 'utcoupe',
			params: this.utcoupe,
			from: 'server'
		});
	}

	return Server;
})();