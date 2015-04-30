module.exports = (function () {
	var logger = require('log4js').getLogger('Others');

	function Others(sp, client) {
		this.sp = sp;
		this.client = client;

		this.sp.on("data", function(data){
			this.parseCommand(data.toString());
		}.bind(this));
		this.sp.on("error", function(data){
			logger.debug("error", data.toString());
		});

		setTimeout(function() {
			this.getPos();
		}.bind(this), 2000);
	}

	Others.prototype.parseCommand = function(data) {
		if(this.order_sent == data) {
			this.order_sent = '';
			setTimeout(function() {
				this.callback();
			}.bind(this), this.callback_delay);
		} else {
			logger.warn("Arduino others unknown: "+data);
		}
	}

	Others.prototype.sendCommand = function(callback, cmd, args, callback_delay){
		if(typeof callback !== "function")
			callback = function(){};
		this.callback = callback;
		this.callback_delay = callback_delay;
		this.order_sent = cmd;

		// logger.debug([cmd,this.currentId+1].concat(args).join(";")+"\n");
		this.sp.write([cmd].concat(args).join(";")+"\n");
	}

	Others.prototype.fermerStabilisateur = function(callback) {
		this.sendCommand(callback, 'H', [150, 150], 1000);
	};

	Others.prototype.ouvrirStabilisateurMoyen = function(callback) {
		this.sendCommand(callback, 'H', [50, 50], 1000);
	};

	Others.prototype.ouvrirStabilisateurGrand = function(callback) {
		this.sendCommand(callback, 'H', [50, 50], 1000);
	};

	Others.prototype.fermerBloqueur = function(callback) {
		this.sendCommand(callback, 'M', [50, 50], 1000);
	};

	Others.prototype.ouvrirBloqueurMoyen = function(callback) {
		this.sendCommand(callback, 'M', [150, 150], 1000);
	};

	Others.prototype.ouvrirBloqueurGrand = function(callback) {
		this.sendCommand(callback, 'M', [150, 150], 1000);
	};

	Others.prototype.prendreGobelet = function(callback) {
		this.sendCommand(callback, 'G', [50], 1000);
	};

	Others.prototype.lacherGobelet = function(callback) {
		this.sendCommand(callback, 'G', [150], 1000);
	};

	Others.prototype.monterAscenceur = function(callback) {
		this.sendCommand(callback, 'S', [250], 0);
	};

	Others.prototype.monterUnPeuAscenceur = function(callback) {
		this.sendCommand(callback, 'S', [50], 0);
	};

	Others.prototype.descendreAscenceur = function(callback) {
		this.sendCommand(callback, 'S', [-250], 0);
	};



	return Others;
})();