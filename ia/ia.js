(function () {
	"use strict";

	// Modules nodejs
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.ia');


	var ia = new (require('./ia.class.js'))(process.argv[2] || null, process.argv[3] || null);
	ia.start();
	ia.run();
})();