module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.asserv');

	function Asserv(sp) {
		// sp is Serial Port OBJECT
		this.sp = sp;
		this.ready = true;

		this.sp.on("data", function(data) {
			this.parseOrder(data.toString());
		}.bind(this));

		this.sp.on("error", function(data){
			logger.debug("error", data.toString());
 		});
	}

	Asserv.prototype.pwm = function(left, right, ms) {
		this.sp.write(['k', '0', left, right, ms].join(';'));
	};

	Asserv.prototype.parseOrder = function(data) {
		// TODO
	};

	Asserv.prototype.disconnect = function() {
		this.sp.close();
		this.ready = false;
	};

	Asserv.prototype.goTo = function(pos) { // pos = {x, y, a}
	};

	return Asserv;
})();