var socket = require('socket.io-client')('http://localhost:8080');

socket.on('connect', function(){
	socket.emit('name', {
		name: 'client.js'
	});
});
socket.on('name', function(data){
	console.log('Your name is '+data.name);
});
socket.on('disconnect', function(){});