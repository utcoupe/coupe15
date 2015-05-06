module.exports = (function () {
	var logger = require('log4js').getLogger('Others');

	function Others(sp, client) {
		this.sp = sp;
		this.client = client;

		this.sp.on("data", function(data){
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
		this.sendCommand(callback, 'H', [137, 5], 200);
	};

	Others.prototype.ouvrirStabilisateurMoyen = function(callback) {
		this.sendCommand(callback, 'H', [127, 15], 50);
	};

	Others.prototype.ouvrirStabilisateurGrand = function(callback) {
		this.sendCommand(callback, 'H', [61, 70], 200);
	};

	Others.prototype.fermerBloqueur = function(callback) {
		this.sendCommand(callback, 'M', [50, 140], 200);
	};

	Others.prototype.ouvrirBloqueurMoyen = function(callback) {
		this.sendCommand(callback, 'M', [70, 120], 200);
	};

	Others.prototype.ouvrirBloqueurGrand = function(callback) {
		this.sendCommand(callback, 'M', [110, 80], 200);
	};

	Others.prototype.prendreGobelet = function(callback) {
		this.sendCommand(callback, 'G', [70], 200);
	};

	Others.prototype.lacherGobelet = function(callback) {
		this.sendCommand(callback, 'G', [2], 200);
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