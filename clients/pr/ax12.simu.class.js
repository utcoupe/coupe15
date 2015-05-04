module.exports = (function () {
	var logger = require('log4js').getLogger('pr.ax12');

	function Ax12() {

	}

	Ax12.prototype.disconnect = function(x) {

	};

	Ax12.prototype.ouvrir = function(callback) {
		setTimeout(callback, 1000);
	};

	Ax12.prototype.fermer = function(callback) {
		setTimeout(callback, 1000);
	};
	Ax12.prototype.fermerBalle = function(callback) {
		setTimeout(callback, 800);
	};
	Ax12.prototype.fermerBalle2 = function(callback) {
		setTimeout(callback, 900);
	};

	return Ax12;
})();