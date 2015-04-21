module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.asserv');

	function Asserv(sp) {
		this.sp = sp;
		this.sp.on("data", function(data){
			logger.debug("data", data.toString())
		});
		this.sp.on("error", function(data){
			logger.debug("error", data.toString())
		});
	}

	Asserv.prototype.pwm = function(callback, left, right, ms) {
		this.sp.write(['k', '0', left, right, ms].join(';')+'\n');
		setTimeout(callback, ms);
	};

	return Asserv;
})();