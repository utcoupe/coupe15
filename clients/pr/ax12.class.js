module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.ax12');
	var ffi = require('ffi');
	var libusb2ax = ffi.Library('./libs/dynamixel/lib/libusb2ax', {
		'dxl_initialize': ['int', ['int', 'int']],
		'dxl_write_word': ['void', ['int', 'int', 'int']],
		'dxl_read_word': ['int', ['int', 'int']],
		'dxl_terminate': ['void', ['void']],
		'dxl_get_result': ['int', ['void']]
	});

	// Constants
	var P_GOAL_POSITION_L = 30;
	var P_POSITION = 36;
	var P_SPEED	= 0x26;
	var P_COUPLE = 34;
	var MARGE_POS = 80;
	var MARGE_POS_MVT = 5;
	var ax12s = {
		'2':{
			id: 2,
			obj: 0, pos: 0, arrived: false
		},
		'3':{
			id: 3,
			obj: 0, pos: 0, arrived: false
		}
	};

	function Ax12(sp, sendStatus) {
		// sp is Serial Port NAME
		this.ready = false;
		this.sendStatus = sendStatus;
		this.orders_sent = [];

		this.connect(sp);
	}


	// ====== General actions ======

	POS_OPENED = 40;
	POS_CLOSED = 10;
	POS_BALL_1 = 0;
	POS_BALL_2 = 0;


	Ax12.prototype.connect = function(sp) {
		if(libusb2ax.dxl_initialize(sp[sp.length-1], 1) <= 0) {
			logger.error("Impossible de se connecter à l'USB2AX");
		} else {
			logger.info("Connecté à l'USB2AX !");
		}
		this.ready = true;
		this.sendStatus();
		this.ax12s = {};
		this.type_callback = null;

		libusb2ax.dxl_write_word(2, P_COUPLE, 800);
		libusb2ax.dxl_write_word(3, P_COUPLE, 800);

		this.ouvrir(function(){});
		this.loopAX12();
	};

	Ax12.prototype.disconnect = function(x) {
		this.sp.close();
		this.ready = false;
		this.sendStatus();
	};

	Ax12.prototype.loopAX12 = function() {
		var speed;
		for(var i in ax12s) {
			// Si il est pas à la bonne position
			if(ax12s[i].pos < ax12s[i].obj - MARGE_POS || ax12s[i].pos > ax12s[i].obj + MARGE_POS) {
				// ax12s[i].arrived = false;
				speed = libusb2ax.dxl_read_word(ax12s[i].id, P_SPEED);
				// Si il bouge pas, on renvoie l'ordre
				if(speed === 0) {
					// console.log("ordre"+i);
					libusb2ax.dxl_write_word(ax12s[i].id, P_GOAL_POSITION_L, ax12s[i].obj);
				}
				else {
					ax12s[i].pos = libusb2ax.dxl_read_word(ax12s[i].id, P_POSITION);
					// logger.debug(i, ax12s[i].pos, ax12s[i].obj);
					if(this.type_callback == 'ouvrir') {
						ax12s[i].arrived = true;
						// logger.info(new Date().getTime()+" "+ax12s[i].id+" arrivé !");
						// this.callback.call();
						// this.type_callback = null;
					}
				}
			}
			else {
				if(this.type_callback) {
					ax12s[i].arrived = true;
					// logger.info(new Date().getTime()+" "+ax12s[i].id+" arrivé !");
					// if(ax12s['2'].arrived && ax12s['3'].arrived) {
					// 	var temp = this.callback;
					// 	setTimeout(temp, 500);
					// 	this.callback = function(){};
					// }
				}
			}
		}

		if(ax12s['2'].arrived && ax12s['3'].arrived && this.type_callback) {
			this.type_callback = null;
			this.callback.call();
		}

		setTimeout(function() { this.loopAX12(); }.bind(this), 50);
	};

	Ax12.prototype.degToAx12 = function(deg) {
		return parseInt((deg+150)*1024/300);
	};

	Ax12.prototype.ouvrir = function(callback) {
		ax12s['2'].obj = this.degToAx12(0);
		ax12s['3'].obj = this.degToAx12(0);
		ax12s['2'].arrived = false;
		ax12s['3'].arrived = false;
		this.callback = callback;
		this.type_callback = 'ouvrir';
	};

	Ax12.prototype.fermer = function(callback) {
		ax12s['2'].obj = this.degToAx12(-85);
		ax12s['3'].obj = this.degToAx12(85);
		// logger.debug(ax12s['2'].obj);
		ax12s['2'].arrived = false;
		ax12s['3'].arrived = false;
		this.callback = callback;
		this.type_callback = 'fermer';
	};
	Ax12.prototype.fermerBalle = function(callback) {
		ax12s['2'].obj = this.degToAx12(-50);
		ax12s['3'].obj = this.degToAx12(50);
		// logger.debug(ax12s['2'].obj);
		ax12s['2'].arrived = false;
		ax12s['3'].arrived = false;
		this.callback = callback;
		this.type_callback = 'fermer';
	};
	Ax12.prototype.fermerBalle2 = function(callback) {
		ax12s['2'].obj = this.degToAx12(-75);
		ax12s['3'].obj = this.degToAx12(75);
		// logger.debug(ax12s['2'].obj);
		ax12s['2'].arrived = false;
		ax12s['3'].arrived = false;
		this.callback = callback;
		this.type_callback = 'fermer';
	};

	return Ax12;
})();