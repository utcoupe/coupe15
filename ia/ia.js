(function () {
	"use strict";

	// Modules nodejs
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.ia');
	
	var ia = new (require('./ia.class.js'))();
	ia.start();
})();