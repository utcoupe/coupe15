module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.asserv');

	function Asserv(sp) {
		this.sp = sp;
		this.sp.on("data", function(){});
		this.sp.on("error", function(){});
	}

	Asserv.prototype.pwm = function(left, right, ms) {
		this.sp.write(['k', '0', left, right, ms].join(';'));
	};

	return Asserv;
})();