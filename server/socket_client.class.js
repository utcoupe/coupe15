var coupe15 = coupe15 || {};
(function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('Client');

	function SocketClient(server_ip) {
		this.server_ip = server_ip || '127.0.0.1:3128';
		this.client = require('socket.io-client')('http://'+this.server_ip);

		this.client.on('connect', function(){
			this.client.emit('type', 'client');//'webclient');
			this.client.emit('order', {to:'client2',text:'Hello!'});
		}.bind(this));
		this.client.on('disconnect', function(){
			this.errorServerTimeout();
		}.bind(this));

		this.client.on('log', function(data){
			logger.info('[Server log] '+data);
		}.bind(this));
		this.client.on('order', function(data){
			logger.info('[Order to '+data.to+'] '+data.text);
		}.bind(this));

		setTimeout(function() {
			if(this.client.disconnected)
				this.errorServerNotFound();
		}.bind(this), 500);
	}

	// Error functions
	SocketClient.prototype.throwError = function (msg) {
		logger.error(msg);
	};
	SocketClient.prototype.errorServerNotFound = function () {
		this.throwError('Server not found at '+this.server_ip+', please make sure the server is running.');
	};
	SocketClient.prototype.errorServerTimeout = function () {
		this.throwError('Server timed out, please make sure the server is still running.');
	};

	coupe15.SocketClient = SocketClient;
})();

var client = new coupe15.SocketClient();