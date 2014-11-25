// Loading socket.io
var io = require('socket.io')();

// When a user have just connected
io.on('connection', function (socket) {
	console.log("User "+socket.id+" is connected!");

	socket.on('disconnect', function() {
		console.log("User "+socket.id+" is disconnected!");
	});

	socket.on('type', function(data) {
		if(typeof(data) != 'string') {
			console.log("The client type sent isn't a string");
			return;
		}
		socket.join(data);
		//console.log(socket.handshake);
		socket.emit('log', "Hi, est-ce que tu viens pour les vacances ? Moi je n'ai pas changé d'adresse : " + 
			socket.handshake.headers.host);
	});

	// Forwarding orders
	socket.on('order', function(data) {
		if(typeof(data) != 'object') {
			console.log("The client order sent isn't a object");
			return;
		}
		if(data.to == undefined) {
			console.log("The order hasn't 'to' argument (recipient)");
			return;
		}
		if(!(data.to in socket.adapter.rooms)) {
			console.log("The order recipient doesn't exist.");
			return;
		}

		// Forwarding to the recipient and web clients
		io.to('web_client').to(data.to).emit('order', data);
	});
});

// Listening port 3128
io.listen(3128);