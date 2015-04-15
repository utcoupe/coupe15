module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.path');

	function Path(path) {
		this.path = path || [];
	}
	
	Path.prototype.getNextPoint = function () {
		if(this.path.length > 0)
			return this.path[0];
		else
			return null;
	};
	Path.prototype.getLastPoint = function () {
		if(this.path.length > 0)
			return this.path[this.path.length-1];
		else
			return null;
	};
	Path.prototype.firstPointDone = function (point) {
		return this.path.shift();
	};
	Path.prototype.addPoint = function (point) {
		return this.path.push(point);
	};

	return Path;
})();