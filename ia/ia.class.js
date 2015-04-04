module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.ia');

	function Ia(color, nb_erobots, we_have_hats) {
		logger.info("Launching a "+color+" AI with "+nb_erobots+" ennemies.");
		
		if(!color) {
			logger.error('Please give a color to ia');
		}
		if(!nb_erobots) {
			logger.error('Please give the number of ennemis robots');
		}
		if(!we_have_hats) {
			logger.error('Please say true if we have something on our robots detactable by the Hokuyos');
		}
		this.color = color;
		this.nb_erobots = nb_erobots;

		this.client = new (require('./socket_client.class.js'))({type: 'ia'});
		this.pathfinding = new (require('./pathfinding.class.js'))(this);
		this.data = new (require('./data.class.js'))(this);
		this.actions = new (require('./actions.class.js'))(this, this.data, this.color);
		this.gr = new (require('./gr.class.js'))(this);
		this.pr = new (require('./pr.class.js'))(this);
		this.hokuyo = new (require('./hokuyo.class.js'))(this, this.gr, this.pr, {
			color: this.color,
			nb_erobots: this.nb_erobots,
			we_have_hats: this.we_have_hats
		});



	}

	Ia.prototype.start = function() {
		logger.info(this.hokuyo);
	};

	Ia.prototype.run = function() {
		logger.info(this.actions.do("empiler1.1"));
	};

	return Ia;
})();