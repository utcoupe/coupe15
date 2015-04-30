module.exports = (function () {
	var logger = require('log4js').getLogger('pr.others');

	function Others() {

	}

	Others.prototype.disconnect = function(x) {

	};

	Others.prototype.fermerStabilisateur = function(callback) {
		setTimeout(callback, 300);
	};

	Others.prototype.ouvrirStabilisateurMoyen = function(callback) {
		setTimeout(callback, 300);
	};
	
	Others.prototype.ouvrirStabilisateurGrand = function(callback) {
		setTimeout(callback, 300);
	};

	Others.prototype.fermerBloqueur = function(callback) {
		setTimeout(callback, 300);
	};

	Others.prototype.ouvrirBloqueurMoyen = function(callback) {
		setTimeout(callback, 300);
	};

	Others.prototype.ouvrirBloqueurGrand = function(callback) {
		setTimeout(callback, 300);
	};

	Others.prototype.prendreGobelet = function(callback) {
		setTimeout(callback, 300);
	};

	Others.prototype.lacherGobelet = function(callback) {
		setTimeout(callback, 300);
	};

	Others.prototype.monterAscenceur = function(callback) {
	setTimeout(callback, 1000);
	};

	Others.prototype.descendreAscenceur = function(callback) {
	setTimeout(callback, 1000);
	};

	
	return Others;
})();