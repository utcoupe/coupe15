var server_ip = 'http://127.0.0.1:8080';

var socket = require('socket.io-client')(server_ip);

socket.on('connect', function(){
	socket.emit('name', {
		name: 'client.js'
	});
});
socket.on('name', function(data){
	console.log('Your name is '+data.name);
});
socket.on('disconnect', function(){});