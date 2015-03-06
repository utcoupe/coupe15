module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.ia');

	function Ia(color, nb_erobots) {
		if(!color) {
			logger.error('Please give a color to ia');
		}
		if(!nb_erobots) {
			logger.error('Please give the number of ennemis robots');
		}
		this.color = color;
		this.nb_erobots = nb_erobots;

		this.client = new (require('./socket_client.class.js'))({type: 'ia'});
		this.pathfinding = new (require('./pathfinding.class.js'))(this);
		this.data = new (require('./data.class.js'))(this);
		this.gr = new (require('./gr.class.js'))(this);
		this.pr = new (require('./pr.class.js'))(this);
		this.hokuyo = new (require('./hokuyo.class.js'))(this, {
			color: this.color,
			nb_erobots: this.nb_erobots
		});

	}

	Ia.prototype.start = function() {
		logger.info(this.hokuyo);
	};

	return Ia;
})();