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

	Others.prototype.ouvrirHaut = function(callback) {
		this.sendCommand(callback, 'H', [100, 100], 300);
	};

	return Others;
})();