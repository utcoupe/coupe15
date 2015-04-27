module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('gr.servos');

	function Servos(sp) {
		this.client = "rien"; // j'ai mis ça pour différencier cette classe de la vraie classe servos (pr Webclient > Réseau)

	}

	Servos.prototype.acheter = function(callback) {
		setTimeout(callback, 500);
	};
	Servos.prototype.vendre = function(callback) {
		setTimeout(callback, 500);
	};

	return Servos;
})();