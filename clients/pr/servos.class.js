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

	Servos.prototype.connect = function(sp) {
		board = new five.Board({
			port: sp,
			repl: false
		});

		board.on("ready", function() {
			logger.info("Servos board connected !");
			this.ready = true;

			this.servo.left_arm = new five.Servo(2);
			this.servo.right_arm = new five.Servo(3);

			this.servo.left_stab = new five.Servo(11);
			this.servo.right_stab = new five.Servo(12);
		}.bind(this));
	};

	Servos.prototype.disconnect = function() {
		this.ready = false;
	};



	// ====== General actions ======

	POS_LEFT_STAB_OPENED = ;
	POS_LEFT_STAB_CHOUILLA = ;
	POS_LEFT_STAB_CLOSED = ;
	POS_RIGHT_STAB_OPENED = ;
	POS_RIGHT_STAB_CHOUILLA = ;
	POS_RIGHT_STAB_CLOSED = ;
	POS_LEFT_ARM_OPENED = ;
	POS_LEFT_ARM_CHOUILLA = ;
	POS_LEFT_ARM_CLOSED = ;
	POS_RIGHT_ARM_OPENED = ;
	POS_RIGHT_ARM_CHOUILLA = ;
	POS_RIGHT_ARM_CLOSED = ;


	// ====== General actions ======

	Servos.prototype.ouvrirStabilisateur = function() {
		this.servo.left_stab.to(POS_LEFT_STAB_OPENED);
		this.servo.right_stab.to(POS_RIGHT_STAB_OPENED);
	};

	Servos.prototype.ouvrirChouillaStabilisateur = function() {
		this.servo.left_stab.to(POS_LEFT_STAB_CHOUILLA);
		this.servo.right_stab.to(POS_RIGHT_STAB_CHOUILLA);
	};

	Servos.prototype.fermerStabilisateur = function() {
		this.servo.left_stab.to(POS_LEFT_STAB_CLOSED);
		this.servo.right_stab.to(POS_RIGHT_STAB_CLOSED);
	};

	Servos.prototype.ouvrirBras = function() {
		this.servo.left_arm.to(POS_LEFT_ARM_OPENED);
		this.servo.right_arm.to(POS_RIGHT_ARM_OPENED);
	};

	Servos.prototype.ouvrirChouillaBras = function() {
		this.servo.left_arm.to(POS_LEFT_ARM_CHOUILLA);
		this.servo.right_arm.to(POS_RIGHT_ARM_CHOUILLA);
	};

	Servos.prototype.fermerBras = function() {
		this.servo.left_arm.to(POS_LEFT_ARM_CLOSED);
		this.servo.right_arm.to(POS_RIGHT_ARM_CLOSED);
	};

	return Servos;
})();