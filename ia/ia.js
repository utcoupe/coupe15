(function () {
	"use strict";

	// Modules nodejs
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.ia');
	
	// Classes
	var ia = new (require('./ia.class.js'))();
	var client = new (require('./socket_client.class.js'))();

})();