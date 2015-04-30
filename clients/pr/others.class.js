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
		this.sendCommand(callback, 'H', [150, 150], 300);
	};

	Others.prototype.ouvrirStabilisateur = function(callback) {
		this.sendCommand(callback, 'H', [50, 50], 300);
	};
	
	Others.prototype.FermerBloqueur = function(callback) {
		this.sendCommand(callback, 'M', [50, 50], 300);
	};

	Others.prototype.OuvrirBloqueurSimple = function(callback) {
		this.sendCommand(callback, 'M', [150, 150], 300);
	};

	Others.prototype.OuvrirBloqueurAFond = function(callback) {
		this.sendCommand(callback, 'M', [150, 150], 300);
	};

	Others.prototype.PrendreGobelet = function(callback) {
		this.sendCommand(callback, 'G', [50], 300);
	};

	Others.prototype.LacherGobelet = function(callback) {
		this.sendCommand(callback, 'G', [150], 300);
	};

	Others.prototype.MonterAscenceur = function(callback) {
		this.sendCommand(callback, 'S', [250], 0);
	};

	Others.prototype.DescendreAscenceur = function(callback) {
		this.sendCommand(callback, 'S', [-250], 0);
	};



	return Others;
})();