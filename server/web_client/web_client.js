$(document).ready(function() {
	"use strict";

	var server_host = "http://localhost:8080";
	var reload_timeout;

	function error(msg, reload) {
		// Reload the page if needed
		if(!!reload) {
			reload_timeout = setTimeout(function(){ location.reload(true); }, 5000);
			msg += '<br /><br />This page will reload automatically every five seconds.';
		}

		// Writing error message
		$('#web_client').html('<p class="error" >'+msg+'</p>');

		return;
	}

	function error_serverNotFound() {
		error('Error: server not found.<br />Please make sure the server is running.', true);
	}
	function error_serverTimeout() {
		error('Error: server timed out.<br />Please make sure the server is running.', true);
	}

	if(io == undefined) {
		error_serverNotFound();
	} else {
		var socket = io.connect(server_host);

		socket.on('connect', function(){
			clearTimeout(reload_timeout);
			socket.emit('type', { name: 'web_client' });

			// Lunching the web client
			$('#web_client').html(' '); // Temp
		});
		socket.on('log', function(data){
			console.log('[Server log] '+data);
		});
		socket.on('disconnect', function(){
			error_serverTimeout();
		});
	}
});