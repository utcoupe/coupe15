module.exports = (function () {
	"use strict";

	var Path = require('path');

	var programm = Path.normalize("./pathfinding/bin/pathfinding");
	var image = Path.normalize("./pathfinding/img/map-20mm-yellow.bmp");
	var RATIO = 20;
	var SEPARATOR = ";";

	var logger = require('log4js').getLogger('ia.pathfinding');
	var Child_process = require('child_process');
	var Byline = require('byline');

	function Pathfinding() {
		var fifo = [];
		var instance = Child_process.spawn(programm, [ image ]);

		instance.on('error', function(err) {
			if(err.code === 'ENOENT'){
				logger.fatal("pathfinding programm executable not found! Is it compiled ? :) Was looking in \""+Path.resolve(programm)+"\"");
				process.exit();
			}
			logger.error("c++ subprocess terminated with error:", err);
			console.log(err);
		});
		instance.on('exit', function(code) {
			logger.fatal("c++ subprocess terminated with code:"+code);
		});



		process.on('exit', function(){ //ensure child process is killed
			if(instance.connected){ //and was still connected (dont kill another process)
				instance.kill();
			}
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
			fifo.push(cb || true);


			var str = ["C"].concat( vecMultiply(start, 1/RATIO) ).concat( vecMultiply(end, 1/RATIO) ).join(SEPARATOR) + "\n";
			instance.stdin.write( str );
			//logger.info("Sending:"+str);
		};

		this.sendDynamic = function(objects){
			//X0, Y0, R0, ...
			var str = ["D"].concat(objects.reduce(function(acc, obj){
				return acc.concat( vecMultiply(obj, 1/RATIO) );
			}, [])).join(SEPARATOR);
			instance.stdin.write(str);
		}

		function parse (data) {
			// X0; Y0; ... Xn; Yn
			var path = [];
			var splitted = data.split(SEPARATOR);
			while(splitted.length > 1){
				path.push( vecMultiply([splitted.shift(), splitted.shift()], RATIO) );
			}

			var ret = null;
			if(path.length > 0) ret = path;

			var callback = fifo.shift();
			if(typeof callback === "function") callback(ret);
		}

	}

	Pathfinding.prototype.getPath = function (start, end, callback) {
		this.sendQuery([start.x, start.y], [end.x, end.y], function(path){
			if(path !== null) {
				path.shift();
				path = path.map(function(val) {
					return {
						x: val[0],
						y: val[1]
					};
				});
			}
			callback(path);
		});
	};
	
	//[ [x, y, r], ... ]
	Pathfinding.prototype.updateMap = function (objects) {
		this.sendDynamic( objects.map(function(val){
				return [val.x, val.y, val.R];
		}) );
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
