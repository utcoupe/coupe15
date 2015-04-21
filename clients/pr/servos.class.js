module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('pr.servos');
	var five = require("johnny-five");
	var board = null;

	function Servos(sp) {
		// sp is Serial Port NAME
		this.ready = false;
		this.servos = {};

		this.connect(sp);
	}


	// ====== General actions ======

	POS_LEFT_STAB_OPENED = 40;
	POS_LEFT_STAB_CHOUILLA = 10;
	POS_LEFT_STAB_CLOSED = 2;
	POS_RIGHT_STAB_OPENED = 100;
	POS_RIGHT_STAB_CHOUILLA = 133;
	POS_RIGHT_STAB_CLOSED = 140;
	// POS_LEFT_ARM_OPENED = ;
	// POS_LEFT_ARM_CHOUILLA = ;
	// POS_LEFT_ARM_CLOSED = ;
	// POS_RIGHT_ARM_OPENED = ;
	// POS_RIGHT_ARM_CHOUILLA = ;
	// POS_RIGHT_ARM_CLOSED = ;


	Servos.prototype.connect = function(sp) {
		var that = this;

		board = new five.Board({
			port: sp,
			repl: false
		});

		board.on("ready", function() {
			logger.info("Servos board connected !");
			this.ready = true;

			console.log(this);
			this.servos.left_arm = new five.Servo(2);
			this.servos.right_arm = new five.Servo(3);

			this.servos.left_stab = new five.Servo(11);
			this.servos.right_stab = new five.Servo(12);

			this.servos.left_arm.to(90);
			this.servos.right_arm.to(90);
			this.servos.left_stab.to(POS_LEFT_STAB_OPENED);
			this.servos.right_stab.to(POS_RIGHT_STAB_OPENED);
		}.bind(this));
	};

	Servos.prototype.disconnect = function() {
		this.ready = false;
	};


	// ====== General actions ======

	Servos.prototype.ouvrirStabilisateur = function(callback) {
		this.servos.left_stab.to(POS_LEFT_STAB_OPENED);
		this.servos.right_stab.to(POS_RIGHT_STAB_OPENED);
		callback.call();
	};

	Servos.prototype.ouvrirChouillaStabilisateur = function(callback) {
		this.servos.left_stab.to(POS_LEFT_STAB_CHOUILLA);
		this.servos.right_stab.to(POS_RIGHT_STAB_CHOUILLA);
		callback.call();
	};

	Servos.prototype.fermerStabilisateur = function(callback) {
		this.servos.left_stab.to(POS_LEFT_STAB_CLOSED);
		this.servos.right_stab.to(POS_RIGHT_STAB_CLOSED);
		callback.call();
	};

	Servos.prototype.ouvrirBras = function() {
		this.servos.left_arm.to(POS_LEFT_ARM_OPENED);
		this.servos.right_arm.to(POS_RIGHT_ARM_OPENED);
	};

	Servos.prototype.ouvrirChouillaBras = function() {
		this.servos.left_arm.to(POS_LEFT_ARM_CHOUILLA);
		this.servos.right_arm.to(POS_RIGHT_ARM_CHOUILLA);
	};

	Servos.prototype.fermerBras = function() {
		this.servos.left_arm.to(POS_LEFT_ARM_CLOSED);
		this.servos.right_arm.to(POS_RIGHT_ARM_CLOSED);
	};

	Servos.prototype.servo_goto = function(servo, pos, callback) {
		logger.info(servo + " going to "+pos);
		this.servos[servo].to(pos);
		callback.call();
	};

	return Servos;
})();