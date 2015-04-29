module.exports = (function () {
	var logger = require('log4js').getLogger('pr.others');

	function Others() {

	}

	Others.prototype.disconnect = function(x) {

	};

	Others.prototype.ouvrirH = function(callback) {
		setTimeout(callback, 500);
	};

	Others.prototype.fermerH = function(callback) {
		setTimeout(callback, 500);
	};
	
	return Others;
})();