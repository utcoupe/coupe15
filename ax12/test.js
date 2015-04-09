var ffi = require('ffi');
var log4js = require('log4js');
var logger = log4js.getLogger('Test AX12');

var libusb2ax = ffi.Library('../libs/dynamixel/src_lib/libusb2ax', {
  'dxl_initialize': ['int', ['int', 'int']],
  'dxl_write_word': ['void', ['int', 'int', 'int']],
  'dxl_read_word': ['int', ['int', 'int']],
  'dxl_terminate': ['void', ['void']]
})

if(libusb2ax.dxl_initialize(0, 1) <= 0) {
	logger.error("Impossible de se connecter à l'USB2AX");
	process.exit(1);
}

var P_GOAL_POSITION_L = 30;
var P_POSITION = 36;
var P_SPEED	= 0x26;
var P_COUPLE = 34;
var MARGE_POS = 20;
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

function loopAX12() {
	var speed;
	for(var i in ax12s) {
		// Si il est pas à la bonne position
		if(ax12s[i].pos < ax12s[i].obj - MARGE_POS || ax12s[i].pos > ax12s[i].obj + MARGE_POS) {
			ax12s[i].arrived = false;
			speed = libusb2ax.dxl_read_word(ax12s[i].id, P_SPEED);
			// Si il bouge pas, on renvoie l'ordre
			if(speed == 0) {
				console.log("ordre"+i);
				libusb2ax.dxl_write_word(ax12s[i].id, P_GOAL_POSITION_L, ax12s[i].obj);
			}
			else {
				ax12s[i].pos = libusb2ax.dxl_read_word(ax12s[i].id, P_POSITION);
			}
		}
		else {
			if(!ax12s[i].arrived) {
				ax12s[i].arrived = true;
				logger.info(ax12s[i].id+" arrivé !");
			}
		}
	}
}

// libusb2ax.dxl_write_word(3, P_COUPLE, 800);
// libusb2ax.dxl_write_word(2, P_COUPLE, 800);
// libusb2ax.dxl_write_word(3, P_GOAL_POSITION_L, 150*1024/300);
// libusb2ax.dxl_write_word(2, P_GOAL_POSITION_L, 150*1024/300);
// setTimeout(function() {
// 	libusb2ax.dxl_write_word(3, P_GOAL_POSITION_L, parseInt(220*1024/300));
// 	libusb2ax.dxl_write_word(2, P_GOAL_POSITION_L, parseInt(80*1024/300));
// }, 500);

var ite = 0;

function loop() {
	loopAX12();
	ite++;

	if(ite > 20) {
		if(ax12s['3'].obj == parseInt(240*1024/300)) {
			ax12s['3'].obj = parseInt(150*1024/300);
			ax12s['2'].obj = parseInt(150*1024/300);
		}
		else {
			ax12s['3'].obj = parseInt(240*1024/300);
			ax12s['2'].obj = parseInt(60*1024/300);
		}
		ite = 0;
		// printf("change pos_AX12_3 = %d\n", pos_AX12_3);
		// console.log(ax12s);
	}

	setTimeout(loop, 50);
}
loop();

// libusb2ax.dxl_terminate();