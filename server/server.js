// Loading socket.io and create the server
var server = require('socket.io')();

// When a user have just connected
server.on('connection', function (client) {
	console.log("User "+client.id+" is connected!");

	client.on('disconnect', function() {
		console.log("User "+client.id+" is disconnected!");
	});

	client.on('type', function(data) {
		if(typeof(data) != 'string') {
			console.log("The client type sent isn't a string");
			return;
		}
		client.join(data);
		//console.log(client.handshake);
		client.emit('log', "Hi, est-ce que tu viens pour les vacances ? Moi je n'ai pas changé d'adresse : " + 
			client.handshake.headers.host);
	});

	// Forwarding orders
	client.on('order', function(data) {
		if(typeof(data) != 'object') {
			console.log("The client order sent isn't a object");
			return;
		}
		if(data.to == undefined) {
			console.log("The order hasn't 'to' argument (recipient)");
			return;
		}
		if(!(data.to in client.adapter.rooms)) {
			console.log("The order recipient doesn't exist.");
			return;
		}

		// Forwarding to the recipient and web clients
		server.to('web_client').to(data.to).emit('order', data);
	});
});

// Listening port 3128
server.listen(3128);