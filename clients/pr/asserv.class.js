module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.asserv');

	function Asserv(sp) {
		this.sp = sp;

		
	}

	Asserv.prototype.connect = function(sp) {
		// body...
	};

	return Asserv;
})();