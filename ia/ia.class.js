module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.ia');

	function Ia(color, nb_erobots) {
		if(!color) {
			logger.fatal('Please give a color to ia');
		}
		if(!nb_erobots) {
			logger.fatal('Please give the number of ennemis robots');
		}
		this.color = color;
		this.nb_erobots = nb_erobots;

		this.client = new (require('./socket_client.class.js'))({
			type: 'ia'
		});
		this.pathfinding = new (require('./pathfinding.class.js'))();
		this.data = new (require('./data.class.js'))();
		this.gr = new (require('./gr.class.js'))();
		this.pr = new (require('./pr.class.js'))();
		this.hokuyo = new (require('./hokuyo.class.js'))({
			nb_erobots: 1, // TODO param programme
			color: this.color,
		});

	}

	Ia.prototype.start = function() {
		logger.info(this.hokuyo);
	};

	return Ia;
})();