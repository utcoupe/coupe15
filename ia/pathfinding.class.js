module.exports = (function () {
	"use strict";

	var programm = "../hokuyo/pathfinding";
	var command = {
		green :		"map-20mm-green.bmp",
		yellow :	"map-20mm-yellow.bmp"
	};


	var logger = require('log4js').getLogger('ia.pathfinding');
	var child_process = require('child_process');

	function Pathfinding(color) {
		if(!color){
			logger.error("no color, set to yellow");
			color = "yellow";
		}
		this.instance = child_process.spawn(programm, [ command[color] ]);

	}

	Pathfinding.prototype.getPath = function (start, end, callback) {
		var path = new Path([end]);

		callback(path);
	};
	
	return Pathfinding;
})();