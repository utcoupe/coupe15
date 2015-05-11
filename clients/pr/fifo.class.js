module.exports = (function () {
	var logger = require('log4js').getLogger('Fifo');

	function Fifo() {
		this.fifo = [];
		this.order_in_progress = false;
	}

	Fifo.prototype.orderFinished = function() {
		this.order_in_progress = false;
		this.nextOrder();
	}

	Fifo.prototype.newOrder = function(callback) {
		this.fifo.push(callback);
		this.nextOrder();
	}

	Fifo.prototype.nextOrder = function() {
		if(!this.order_in_progress && this.fifo.length > 0) {
			// logger.debug(this.fifo.length);
			this.order_in_progress = true;
			(this.fifo.shift())();
		}
	}

	return Fifo;
})();
