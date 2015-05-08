module.exports = (function () {
	var logger = require('log4js').getLogger('asserv');
	var COMMANDS = require('./defineParser.js')('./arduino/asserv/protocol.h');
	var DETECT_SERIAL_TIMEOUT = 100; //ms, -1 to disable

	// function Asserv(sp, client) {
	// 	this.client = client;
	// 	this.getPos();
	// 	this.sp = sp;
	// 	this.pos = {};
	// 	this.sentCommands = {};
	// 	this.currentId = 0;
	// }

	function Asserv(sp, client, who, sendStatus) {
		this.ready = false;
		this.sendStatus = sendStatus;
		this.sp = sp;
		this.client = client;
		this.pos = {};
		this.who = who;
		this.currentId = 0;

		this.sp.on("data", function(data){
			this.ready = true;
			this.sendStatus();
			this.parseCommand(data.toString());
		}.bind(this));
		this.sp.on("error", function(data){
			this.ready = false;
			this.sendStatus();
			logger.debug("error", data.toString());
		});

		setTimeout(function() {
			this.getPos();
		}.bind(this), 2000);
	}
	function convertA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
	Asserv.prototype.setA = function(a) {
		// logger.debug(a, convertA(a));
		this.pos.a = convertA(a);
	}
	Asserv.prototype.Pos = function(pos) {
		this.pos.x = pos.x;
		this.pos.y = pos.y;
		this.setA(pos.a);
	}
	Asserv.prototype.setPos = function(pos, callback) {
		this.Pos(pos);
		this.sendCommand(COMMANDS.SET_POS, [
			parseInt(this.pos.x),
			parseInt(this.pos.y),
			myWriteFloat(this.pos.a)
		], false, callback);
	}
	Asserv.prototype.getPos = function(pos) {
		this.client.send('ia', this.who+'.getpos');
	}
	Asserv.prototype.sendPos = function() {
		this.client.send('ia', this.who+'.pos', this.pos);
	}

	Asserv.prototype.avancerPlot = function(callback) {
		this.speed(200, 0, 600, function(){});
		setTimeout(callback, 400);
	}
	Asserv.prototype.calageX = function(x, a, callback) {
		this.setPos({x: x, y: this.pos.y, a: a}, callback);
	}
	Asserv.prototype.calageY = function(y, a, callback) {
		this.setPos({x: this.pos.x, y: y, a: a}, callback);
	}

	// For float
	function myWriteFloat(f){ return Math.round(f*COMMANDS.FLOAT_PRECISION); }
	function myParseFloat(f){ return parseInt(f)/COMMANDS.FLOAT_PRECISION;  }
	//////////////////
	// Arduino to JS
	//////////////////
	Asserv.prototype.parseCommand = function(data){
		// logger.debug(data);
		var datas = data.split(';');
		var cmd = datas.shift();//, id = datas.shift();
		if(cmd == COMMANDS.AUTO_SEND && datas.length >= 4) { // periodic position update
			var lastFinishedId = parseInt(datas.shift()); // TODO
			this.Pos({
				x: parseInt(datas.shift()),
				y: parseInt(datas.shift()),
				a: myParseFloat(datas.shift())
			});

			
			this.sendPos();

			// logger.debug(lastFinishedId);
			if(this.currentId != lastFinishedId) {
				// logger.fatal('finish id', lastFinishedId);
				this.currentId = lastFinishedId;
				this.callback();
			}
		} else if(cmd == this.order_sent) {
			this.order_sent = '';
			// logger.debug('finish', datas.shift());
			if(!this.wait_for_id)
				this.callback();
		} else if (cmd == COMMANDS.JACK) {
			logger.info("JACK !");
			this.client.send("ia", "ia.jack");
		} else {
			// logger.warn(datas);
			// logger.warn("Command return from Arduino to unknown cmd="+cmd);
		}
		// else {
		// 	if(this.sendCommands.hasOwnProperty(id)){
		// 		this.sentCommands[id] (); //callback
		// 		delete this.sendCommand[id];
		// 	}else{
		// 		logger.warn("Command return from Arduino to unknown id="+id);
		// 	}
		// }
	}
	//////////////////
	// JS to Arduino
	//////////////////
	Asserv.prototype.sendCommand = function(cmd, args, wait_for_id, callback){
		if(typeof callback !== "function")
			callback = function(){};
		this.callback = callback;
		args = args || [];
		// this.currentId = (this.currentId+1) % COMMANDS.MAX_ID_VAL;
		// var id = this.currentId; // saved to be sure it hasn't changed ( even after write )
		// this.sentCommands[id] = callback;
		this.order_sent = cmd;
		this.wait_for_id = wait_for_id;
		// logger.debug(this.wait_for_id);
		// logger.debug([cmd,this.currentId+1].concat(args).join(";")+"\n");
		this.sp.write([cmd,this.currentId+1].concat(args).join(";")+"\n");

		//Serial Timeout Detection
		// if(DETECT_SERIAL_TIMEOUT >= 0){
		// 	var checker = function(id){
		// 		return function(){
		// 			if(this.sentCommand[id]){
		// 				logger.warn("Serial timeout on command id="+id);
		// 			}
		// 		}
		// 	};
		// 	setTimeout(checker(id), DETECT_SERIAL_TIMEOUT);
		// }
	}

	// Asserv.prototype.setPos = function(callback, pos) {
	// 	this.pos = pos;
	// 	this.sendCommand(callback, COMMANDS.SET_POS, 0, [
	// 		pos.x,
	// 		pos.y,
	// 		writeAngle(pos.a);
	// 	]);
	// }
	Asserv.prototype.setVitesse = function(v, r, callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.SPDMAX, [
			parseInt(v),
			myWriteFloat(r)
		], false, callback);
	};

	Asserv.prototype.speed = function(l, a, ms, callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.SPD, [
			parseInt(l),
			parseInt(a),
			parseInt(ms)
		], true, callback);
	};

	Asserv.prototype.setAcc = function(acc,callback) {
		// logger.debug(myWriteFloat(r));
		this.sendCommand(COMMANDS.ACCMAX, [
			parseInt(acc)
		], false, callback);
	};

	Asserv.prototype.clean = function(callback){
		this.sendCommand(COMMANDS.CLEANG,false,callback);
	};

	Asserv.prototype.pwm = function(left, right, ms, callback) {
		this.sendCommand(COMMANDS.PWM, [
			parseInt(left),
			parseInt(right),
			parseInt(ms)
		], true,callback);
		
	};

	Asserv.prototype.goxy = function(x, y, sens, callback){
		if(sens == "avant") sens = 1;
		else if(sens == "arriere") sens = -1;
		else sens = 0;
		
		this.sendCommand(COMMANDS.GOTO, [
			parseInt(x),
			parseInt(y),
			sens
		], true,callback);
	};
	Asserv.prototype.goa = function(a, callback){
		// this.clean();
		this.sendCommand(COMMANDS.ROT, [
			myWriteFloat(a)
		], true,callback);
	};

	Asserv.prototype.setPid = function(p, i, d, callback){
		// this.clean();
		this.sendCommand(COMMANDS.PIDALL, [
			myWriteFloat(p),
			myWriteFloat(i),
			myWriteFloat(d)
		],false,callback);
	};

	// Asserv.prototype.gotoPath = function(callback, path){
	// 	this.clean();
	// 	if(instanceof path !=== "Array") path = path.path; // not sure about Path class right now
	// 	path.forEach(function(item));
	// };

	return Asserv;
})();
