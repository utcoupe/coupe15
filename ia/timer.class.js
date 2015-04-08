module.exports = (function () {
	"use strict";

	function Timer() {
		this.init();
	}
	Timer.prototype.init = function() {
		this.t0 = Date.now();
		this.match_started = true; // le match commence
	};


	Timer.prototype.get = function () { // permet d'obtenir le temps écoulé en ms
		if (this.match_started)
			return Date.now() - t0;
		else
			return 0;
	};
	Timer.prototype.status = function () {
		if (this.match_started) {
			return "Match started";
		}
		else {
			return "Wainting for jack";
		}
	};

	Timer.prototype.isStarted = function() {
		this.t0 = Date.now();
		this.match_started = true; // le match commence
	};
	Timer.prototype.isFinished = function () {
		this.init();
	};
	Timer.prototype.isOk = function() {
		return true;
	};

	return Timer;
})();
