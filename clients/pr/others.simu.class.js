module.exports = (function () {
	var logger = require('log4js').getLogger('pr.others');

	function Others() {

	}

	Others.prototype.disconnect = function(x) {

	};


	Others.prototype.fermerStabilisateur = function(callback) {
		setTimeout(callback, 200);
	};

	Others.prototype.ouvrirStabilisateurMoyen = function(callback) {
		setTimeout(callback, 200);
	};
	
	Others.prototype.ouvrirStabilisateurGrand = function(callback) {
		setTimeout(callback, 200);
	};

	Others.prototype.fermerBloqueur = function(callback) {
		setTimeout(callback, 200);
	};

	Others.prototype.ouvrirBloqueurMoyen = function(callback) {
		setTimeout(callback, 200);
	};

	Others.prototype.ouvrirBloqueurGrand = function(callback) {
		setTimeout(callback, 200);
	};

	Others.prototype.prendreGobelet = function(callback) {
		setTimeout(callback, 200);
	};

	Others.prototype.lacherGobelet = function(callback) {
		setTimeout(callback, 200);
	};

	Others.prototype.monterAscenseur = function(callback) {
		setTimeout(callback, 1000);
	};

	Others.prototype.monterUnPeuAscenseur = function(callback) {
		setTimeout(callback, 300);
	};

	Others.prototype.descendreUnPeuAscenseur = function(callback) {
		setTimeout(callback, 300);
	};

	Others.prototype.descendreAscenseur = function(callback) {
		setTimeout(callback, 1000);
	};

	
	return Others;
})();