module.exports = (function () {
	"use strict";
	var log4js = require('log4js');
	var logger = log4js.getLogger('ia.pathfinding');

	function Pathfinding() {

	}

	Pathfinding.prototype.getPath = function (start, end) {
		var new_path = new Path([end]);
	};
	
	return Pathfinding;
})();