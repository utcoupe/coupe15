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
			logger.warn("Arduino others unknown: "+data);
		}
	};

	Others.prototype.sendCommand = function(callback, cmd, args, callback_delay){
		var fake = false;
		if(callback == 'fake') {
			fake = true;
			callback = function(){};
		}

		this.fifo.newOrder(function() {
			logger.fatal(cmd);
			this.callback = callback;
			if(!fake)
				this.callback_delay = callback_delay;
			else
				this.callback_delay = 0;
			this.order_sent = cmd;

			//logger.debug([cmd].concat(args).join(";"));
			this.sp.write([cmd].concat(args).join(";")+"\n");
		}.bind(this));
	};

	Others.prototype.fermerStabilisateur = function(callback) {
		this.sendCommand(callback, 'H', [136, 1], 100);
	};

	Others.prototype.ouvrirStabilisateurMoyen = function(callback) {
		this.sendCommand(callback, 'H', [126, 11], 100);
	};

	Others.prototype.ouvrirStabilisateurGrand = function(callback) {
		this.sendCommand(callback, 'H', [60, 66], 400);
	};

	Others.prototype.fermerBloqueur = function(callback) {
		this.sendCommand(callback, 'M', [75, 155], 200);
	};

	Others.prototype.ouvrirBloqueurMoyen = function(callback) {
		this.sendCommand(callback, 'M', [100, 130], 200);
	};

	Others.prototype.ouvrirBloqueurGrand = function(callback) {
		this.sendCommand(callback, 'M', [140, 90], 400);
	};

	Others.prototype.prendreGobelet = function(callback) {
		this.sendCommand(callback, 'G', [115], 200);
	};

	Others.prototype.lacherGobelet = function(callback) {
		this.sendCommand(callback, 'G', [40], 200);
	};

	Others.prototype.sortirClap = function(callback) {
		this.sendCommand(callback, 'C', [125], 200);
	};

	Others.prototype.rangerClap = function(callback) {
		this.sendCommand(callback, 'C', [40], 100);
	};

	Others.prototype.monterAscenseur = function(callback) {
		this.sendCommand(callback, 'S', [-250], 0);
	};

	Others.prototype.monterUnPeuAscenseur = function(callback) {
		this.sendCommand(callback, 'S', [-30], 0);
	};

	Others.prototype.descendreUnPeuAscenseur = function(callback) {
		this.sendCommand(callback, 'S', [30], 0);
	};

	Others.prototype.relacherAscenseur = function(callback) {
		this.sendCommand(callback, 'S', [0], 0);
	};

	Others.prototype.descendreAscenseur = function(callback) {
		this.sendCommand(function() {
		this.relacherAscenseur(callback);
		}.bind(this), 'S', [250], 0);
	};



	return Others;
})();
