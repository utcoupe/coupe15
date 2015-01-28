var coupe15 = coupe15 || {};
(function () {
	"use strict";

	function SocketWebclient(server_host) {
		this.server_host = server_host || (!!window.location.host?window.location.host:'localhost')+':3128';
		this.socket = null;

		if(io === undefined) {
			this.errorSocketIoNotFound();
		} else {
			this.socket = io(this.server_host);
			
			this.socket.on('connect', function(){
				this.socket.emit('type', {
					type: 'webclient',
					options: {
						name: 'Webclient',
						type: this.getDeviceType()
					}
				});
				// this.socket.emit('order', {to:'webclient',text:'Hello!'});
			}.bind(this));
			this.socket.on('disconnect', function(){
				this.errorServerTimeout();
			}.bind(this));

			this.socket.on('log', function(data){
				console.log('[Server log] '+data);
			});
			this.socket.on('order', function(data){
				console.log('[Order to '+data.to+'] '+ data.text);
			});

			setTimeout(function() {
				if(this.socket.disconnected)
					this.errorServerNotFound();
			}.bind(this), 500);
		}
	}

	SocketWebclient.prototype.getDeviceType = function () {
		if (navigator.userAgent.match(/(android|iphone|ipad|blackberry|symbian|symbianos|symbos|netfront|model-orange|javaplatform|iemobile|windows phone|samsung|htc|opera mobile|opera mobi|opera mini|presto|huawei|blazer|bolt|doris|fennec|gobrowser|iris|maemo browser|mib|cldc|minimo|semc-browser|skyfire|teashark|teleca|uzard|uzardweb|meego|nokia|bb10|playbook)/gi)) {
			if ( ((screen.width  >= 480) && (screen.height >= 800)) || ((screen.width  >= 800) && (screen.height >= 480)) || navigator.userAgent.match(/ipad/gi) ) {
				return 'tablet';
			}
			else {
				return 'smartphone'; 
			}
		}
		else {
			return 'laptop';
		}
	};

	// Error functions
	SocketWebclient.prototype.error = function (msg, reload) {
		$('#webclient').html('<p class="error" ><strong>Error</strong>: '+msg+'</p>');
	};
	SocketWebclient.prototype.errorServerNotFound = function () {
		this.error('server not found at '+this.server_host+'.<br />Please make sure the server is running.', false);
	};
	SocketWebclient.prototype.errorServerTimeout = function () {
		this.error('server timed out.<br />Please make sure the server is still running.', false);
	};
	SocketWebclient.prototype.errorSocketIoNotFound = function () {
		this.error('socket.io.js not found.<br />Please make sure you are in webclient/ folder.', false);
	};

	coupe15.SocketWebclient = SocketWebclient;
})();

var socket = new coupe15.SocketWebclient();