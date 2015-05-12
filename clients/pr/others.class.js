module.exports = (function () {
	var logger = require('log4js').getLogger('Others');

	function Others(sp, sendStatus, fifo) {
		this.sp = sp;
		// this.client = client;
		this.ready = false;
			logger.debug(sendStatus);
		this.sendStatus = sendStatus;
		this.fifo = fifo;

		this.sp.on("data", function(data){
			this.ready = true;
			this.sendStatus();
			this.parseCommand(data.toString());
		}.bind(this));
		this.sp.on("error", function(data){
			logger.debug(data.toString());
		});
	}

	Others.prototype.parseCommand = function(data) {
		if(this.order_sent == data) {
			this.order_sent = '';
			setTimeout(function() {
				this.callback();
				this.fifo.orderFinished();
			}.bind(this), this.callback_delay);
		} else {
			logger.warn("Arduino others unknown: "+data+" (order_sent : "+this.order_sent+")");
		}
	};

	Others.prototype.sendCommand = function(callback, cmd, args, callback_delay){
		if(callback === undefined) {
			callback = function(){};
		}

		this.fifo.newOrder(function() {
			this.callback = callback;
			this.callback_delay = callback_delay;
			this.order_sent = cmd;

			// logger.debug([cmd].concat(args).join(";"));
			this.sp.write([cmd].concat(args).join(";")+"\n");
		}.bind(this));
	};

	Others.prototype.fermerStabilisateur = function(callback) {
		if (time === undefined) {
			time = 100;
		}
		this.sendCommand(callback, 'H', [136, 1], time);
	};

	Others.prototype.ouvrirStabilisateurMoyen = function(callback) {
		if (time === undefined) {
			time = 100;
		}
		this.sendCommand(callback, 'H', [126, 11], time);
	};

	Others.prototype.ouvrirStabilisateurGrand = function(callback) {
		if (time === undefined) {
			time = 400;
		}
		this.sendCommand(callback, 'H', [60, 66], time);
	};

	Others.prototype.fermerBloqueur = function(callback) {
		if (time === undefined) {
			time = 200;
		}
		this.sendCommand(callback, 'M', [75, 155], time);
	};

	Others.prototype.ouvrirBloqueurMoyen = function(callback) {
		if (time === undefined) {
			time = 200;
		}
		this.sendCommand(callback, 'M', [100, 130], time);
	};

	Others.prototype.ouvrirBloqueurGrand = function(callback) {
		if (time === undefined) {
			time = 400;
		}
		this.sendCommand(callback, 'M', [140, 90], time);
	};

	Others.prototype.prendreGobelet = function(callback) {
		if (time === undefined) {
			time = 200;
		}
		this.sendCommand(callback, 'G', [115], time);
	};

	Others.prototype.lacherGobelet = function(callback) {
		if (time === undefined) {
			time = 200;
		}
		this.sendCommand(callback, 'G', [40], time);
	};

	Others.prototype.sortirClap = function(callback) {
		if (time === undefined) {
			time = 200;
		}
		this.sendCommand(callback, 'C', [125], time);
	};

	Others.prototype.rangerClap = function(callback, time) {
		if (time === undefined) {
			time = 100;
		}
		this.sendCommand(callback, 'C', [40], time);
	};

	Others.prototype.monterAscenseur = function(callback) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(callback, 'S', [-250], time);
	};

	Others.prototype.monterUnPeuAscenseur = function(callback) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(callback, 'S', [-30], time);
	};

	Others.prototype.descendreUnPeuAscenseur = function(callback) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(callback, 'S', [30], time);
	};

	Others.prototype.monterMoyenAscenseur = function(callback) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(callback, 'S', [-60], time);
	};

	Others.prototype.descendreMoyenAscenseur = function(callback) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(callback, 'S', [60], time);
	};

	Others.prototype.relacherAscenseur = function(callback) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(callback, 'S', [0], time);
	};

	Others.prototype.descendreAscenseur = function(callback) {
		if (time === undefined) {
			time = 0;
		}
		this.sendCommand(function() {
		this.relacherAscenseur(callback);
		}.bind(this), 'S', [250], time);
	};

	return Others;
})();
