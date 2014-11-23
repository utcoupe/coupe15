// Creating the server
var server = require('http').createServer();

// Loading socket.io
var io = require('socket.io').listen(server);

// When a user have just connected
io.on('connection', function (socket) {
	console.log('User '+socket.id+' is connected!');

	socket.on('disconnect', function() {
		console.log('User '+socket.id+' is disconnected!');
	});

	socket.on('type', function(data) {
		
		// TODO

		socket.emit('log', "Hi beautiful web client, nice to meet you!");
	});
})

server.listen(8080);
