(function () {
	var Server = require('../server/server.class.js');

	// Create the server with default port
	var server = new Server();

	// Display server info
	$('#server_ip').html(server.ip_port);
	$('#link_webclient').html(server.webclient_url);
})();
