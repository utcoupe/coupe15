$(document).ready(function() {
	"use strict";

	if(io == undefined) {
		$('#web_client').html('<p>Impossible de se connecter au serveur.<br /> Vérifiez que celui-ci est lancé.</p>');
	} else {
		var socket = io.connect('http://localhost:8080');
		socket.on('connect', function(){
			socket.emit('name', {
				name: 'client_web.js'
			});
		});
		socket.on('name', function(data){
			console.log('Your name is '+data.name);
		});
		socket.on('disconnect', function(){

		});
	}
});