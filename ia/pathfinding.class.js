module.exports = (function () {
	"use strict";

	var Path = require('path');

	var programm = Path.normalize("../pathfinding/bin/pathfinding");
	var command = {
		green :		Path.normalize("../pathfinding/img/map-20mm-green.bmp"),
		yellow :	Path.normalize("../pathfinding/img/map-20mm-yellow.bmp")
	};
	var RATIO = 20;
	var SEPARATOR = ";";

	var logger = require('log4js').getLogger('ia.pathfinding');
	var Path = require('./path.class.js');
	var Child_process = require('child_process');
	var Byline = require('byline');

	function Pathfinding(color) {
		if(!color){
			logger.error("no color, set to yellow");
			color = "yellow";
		}

		var fifo = [];
		var instance = Child_process.spawn(programm, [ command[color] ]);

		instance.on('error', function(data) {
			logger.error("Error on childProcess", data);
		});
		instance.on('exit', function(data) {
			logger.error("childProcess exited with code", data);
		});

		var stdout = Byline.createStream(instance.stdout);
		stdout.setEncoding('utf8')
		stdout.on('data', function(data) {
			logger.debug(data);
			parse(data);
		});

		instance.stderr.on('data', function(data) {
			logger.info(data.toString());
		});

		function vecMultiply(arr, ratio){
			return arr.map(function(val){
				return Math.round(val*ratio);
			});
		}

		this.sendQuery = function(start, end, cb){
			fifo.push(cb || "");


			var str = ["C"].concat( vecMultiply(start, 1/RATIO) ).concat( vecMultiply(end, 1/RATIO) ).join(SEPARATOR) + "\n";
			instance.stdin.write( str );
			//logger.info("Sending:"+str);
		};

		this.sendDynamic = function(objects){
			//X0, Y0, R0, ...
			var str = ["D"].concat(objects.reduce(function(acc, obj){
				return acc.concat( vecMultiply(obj, 1/RATIO) );
			}, [])).join(SEPARATOR);
			instance.stdin.wrtie( str );
		}

		function parse (data) {
			// X0; Y0; ... Xn; Yn
			var path = [];
			var splitted = data.split(SEPARATOR);
			while(splitted.length > 1){
				path.push( vecMultiply([splitted.shift(), splitted.shift()], RATIO) );
			}

			var ret = null;
			if(path.length > 0) ret = new Path(path);

			var callback = fifo.shift();
			if(typeof callback === "function") callback(ret);
		}

	}

	Pathfinding.prototype.getPath = function (start, end, callback) {
		this.sendQuery(start, end, callback);
	};
	
	//[ [x, y, r], ... ]
	Pathfinding.prototype.updateMap = function (objects) {
		this.sendDynamic(objects);
	};

	return Pathfinding;
})();

/*
(function(){
	var pathfinding = new module.exports();
	function log(result){
		console.log("RESULT", result);
		process.exit();
	}

	setTimeout(function(){
		pathfinding.getPath([500,1000], [1500, 200], log);
	}, 10);
})();
//*/