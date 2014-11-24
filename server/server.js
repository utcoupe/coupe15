// Loading socket.io
var io = require('socket.io')();

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

// Listening port 3128
io.listen(3128);
