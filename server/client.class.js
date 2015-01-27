var coupe15 = coupe15 || {};
(function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('Client');

	function Client(server_ip) {
		this.server_ip = server_ip;
		this.client = require('socket.io-client')('http://'+this.server_ip);

		this.client.on('connect', function(){
			this.client.emit('type', 'client');//'webclient');
			this.client.emit('order', {to:'client2',text:'Hello!'});

			console.log('Hello, you\'re actually connected to the server!'); // Temp
		}.bind(this));
		this.client.on('log', function(data){
			console.log('[Server log] '+data);
		}.bind(this));
		this.client.on('disconnect', function(){
			errorServerTimeout();
		}.bind(this));
		this.client.on('order', function(data){
			console.log('[Order to '+data.to+'] '+ data.text);
		}.bind(this));

		setTimeout(function(socket) {
			if(this.client.disconnected)
				this.errorServerNotFound();
		}.bind(this), 500);
	}

	// Error functions
	Client.prototype.throwError = function (msg) {
		logger.error(msg);
	}
	Client.prototype.errorServerNotFound = function () {
		this.throwError('server not found at '+this.server_ip+', please make sure the server is running.');
	}
	Client.prototype.errorServerTimeout = function () {
		this.throwError('server timed out, please make sure the server is running.');
	}

	coupe15.Client = Client;
})();

var client = new coupe15.Client('127.0.0.1:3128');