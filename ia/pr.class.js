module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.pr');

	function Pr() {
		this.pos;
		this.pos.x;
		this.pos.y;
		this.pos.a;
		this.size.l;
		this.size.L;
		this.size.d;
		this.current_action;
		this.path;
	}

	Pr.prototype.onColision = function () {
	};
	
	return Pr;
})();