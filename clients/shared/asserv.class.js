




module.exports = (function () {
	var logger = require('log4js').getLogger('gr.asserv');
	var COMMANDS = require('./defineParser.js')('../../arduino/asserv/protocol.h');
	var DETECT_SERIAL_TIMEOUT = 100; //ms, -1 to disable

	function Asserv(sp, client) {
		this.client = client;
		this.getPos();
		this.sp = sp;
		ths.pos = {};
		this.sentCommands = {};
		this.currentId = 0;

		this.sp.on("data", function(data){ //already split by \n ?
			logger.debug("data", data.toString());
			parseCommand(data);
		});
		this.sp.on("error", function(data){
			logger.debug("error", data.toString());
		});

		this.client.send('ia', 'gr.getpos');
	}


	//////////////////
	// Arduino to Wifi
	//////////////////
	function parseCommand(data){

		function parseAngle(str){  return parseInt(str)*360/(Math.PI*COMMANDS.FLOAT_PRECISION);  }

		var datas = data.split(";");
		var cmd = data.shift(), id = data.shift();
		if(cmd == COMMANDS.AUTO_SEND) { // periodic position update
			var lastFinishedId = parseInt(data.shift()); // TODO
			sendPos({
				x: parseInt(data.shift()),
				y: parseInt(data.shift()),
				a: parseAngle(data.shift())
			});
		}else{
			if(this.sendCommands.hasOwnProperty(id)){
				this.sentCommands[id] (); //callback
				delete this.sendCommand[id];
			}else{
				logger.warn("Command return from Arduino to unknown id="+id);
			}
		}
	}

	function sendPos(pos) {
		this.client.send('ia', 'gr.pos', pos);
	}

	//////////////////
	// Wifi to Arduino
	//////////////////

	function sendCommand(callback, cmd, args){
		if(typeof callback !== "function") callback = function(){};
		args = args || [];
		this.currentId = (this.currentId+1) % COMMANDS.MAX_ID_VAL;
		var id = this.currentId; // saved to be sure it hasn't changed ( even after write )
		this.sentCommands[id] = callback;
		this.sp.write([cmd,id].concat(args).join(";")+"\n");


		//Serial Timeout Detection
		if(DETECT_SERIAL_TIMEOUT >= 0){
			var checker = function(id){
				return function(){
					if(this.sentCommand[id]){
						logger.warn("Serial timeout on command id="+id);
					}
				}
			};
			setTimeout(checker(id), DETECT_SERIAL_TIMEOUT);
		}
	}

	function writeAngle(a){  return Math.round(a*Math.PI*COMMANDS.FLOAT_PRECISION/360);  }

	Asserv.prototype.setPos = function(callback, pos) {
		this.pos = pos;
		sendCommand(callback, COMMANDS.SET_POS, 0, [
			pos.x,
			pos.y,
			writeAngle(pos.a);
		]);
	}

	Asserv.prototype.clean = function(callback){
		sendCommand(null, COMMANDS.CLEANG);
	};

	Asserv.prototype.pwm = function(callback, left, right, ms) {
		sendCommand(null, COMMANDS.PWM, [
			left,
			right,
			ms
		]);
		setTimeout(callback, ms);
	};


	//Early commit, callback should be called when order is done, not when order in correctly ACK'ed

	Asserv.prototype.gotoa = function(callback, pos){
		this.clean();
		sendCommand(callback, COMMANDS.GOTOA, [
			pos.x,
			pos.y,
			writeAngle(pos.a)
		]);
	};

	Asserv.prototype.gotoPath = function(callback, path){
		this.clean();
		if(instanceof path !=== "Array") path = path.path; // not sure about Path class right now
		path.forEach(function(item));
	};

	return Asserv;
})();