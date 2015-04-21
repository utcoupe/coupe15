(function () {
	"use strict";

	// Modules nodejs
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.ia');

	var color = process.argv[2];
	if(!color) color = null;
	var nb_erobots = process.argv[3];
	if(!nb_erobots) nb_erobots = null;
	var we_have_hats = process.argv[2];
	if(!we_have_hats) we_have_hats = null;

	var ia = new (require('./ia.class.js'))(color, nb_erobots, we_have_hats);
	ia.start();
	ia.run();
})();