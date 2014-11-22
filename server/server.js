// Creating the server
var server = require('http').createServer();

// Loading socket.io
var io = require('socket.io').listen(server);

// When an user have just connected
io.on('connection', function (socket) {
	console.log('User '+socket.id+' is connected!');

	socket.on('disconnect', function() {
		console.log('User '+socket.id+' is disconnected!');
	});

	socket.on('name', function(data) {
		socket.name = data.name;
		socket.emit('name', {name:socket.name});
	});
})

server.listen(8080);