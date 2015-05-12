module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.ia');

	function Ia(color, nb_erobots, we_have_hats) {
		if(!color) {
			logger.error('Please give a color to ia');
		}
		if(!nb_erobots) {
			logger.error('Please give the number of ennemis robots');
		}
		if(!we_have_hats) {
			logger.error('Please say true if we have something on our robots detectable by the Hokuyos');
		}
		this.color = color || "yellow";
		this.nb_erobots = nb_erobots || 2;
		logger.info("Launching a "+this.color+" AI with "+this.nb_erobots+" ennemies.");
		
		// this.client = new (require('../server/socket_client.class.js'))({type: 'ia', server_ip:"127.0.0.1:3128"});
		this.client = new (require('../server/socket_client.class.js'))({type: 'ia', server_ip:"192.168.0.100:3128"});
		this.timer = new (require('./timer.class.js'))(this);
		this.pathfinding = new (require('./pathfinding.class.js'))(this.color);
		this.data = new (require('./data.class.js'))(this, this.nb_erobots);
		this.actions = new (require('./actions.class.js'))(this);
		this.gr = new (require('./gr.class.js'))(this, this.color);
		this.pr = new (require('./pr.class.js'))(this, this.color);
		this.hokuyo = new (require('./hokuyo.class.js'))(this, {
			color: this.color,
			nb_erobots: parseInt(this.nb_erobots),
			we_have_hats: (we_have_hats === "true")
		});
		this.export_simulator = new (require('./export_simulator.class.js'))(this);

		this.client.send("server", "server.iaColor", {color: this.color});

		this.client.order(function(from, name, params) {
			var classe = name.split('.')[0];
				// logger.debug(this[classe]);
			if(classe == 'ia') {
				switch(name) {
					case 'ia.jack':
						this.jack();
					break;
					case 'ia.stop':
						this.stop();
					break;
					default:
						logger.warn("Ordre pour l'ia inconnu : "+name);
				}
			} else if(!!this[classe]) {
				// logger.debug("Order to class: "+classe);
				if(!this[classe].parseOrder) {
					logger.warn("Attention, pas de fonction parseOrder dans ia."+classe);
				} else {
					this[classe].parseOrder(from, name, params);
				}
			} else {
				logger.warn("Sous client inconnu: "+classe);
			}
		}.bind(this));

		// temp //
		// this.gr.start();
		// this.jack();
		//////////
	}

	Ia.prototype.jack = function() {
		if(!this.timer.match_started) {
			logger.info("Démarrage du match");
			this.timer.start();
			setTimeout(function() {
				this.gr.start();
			}.bind(this), 3000);
			this.pr.start();
			this.hokuyo.start();
		} else {
			logger.warn("Match déjà lancé");
		}
	};

	Ia.prototype.stop = function() {
		logger.fatal('Stop IA');
		this.pr.stop();
		process.exit();
	};

	return Ia;
})();
