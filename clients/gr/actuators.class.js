module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('clientgr.acts');

	function Acts() {
		this.arduino = {};
		
		this.start(this);
	}

	Acts.prototype.start = function(){
		this.startArduino(this);
	};

	Acts.prototype.quitArduinos = function(){
		return;
	};

	Acts.prototype.quiAX12 = function(){
		return;
	};

	// Order switch
	Acts.prototype.orderHandler = function (from, name, params) {
		logger.info("Just received an order `" + name + "` from " + from + " with params :");
		logger.info(params);

		switch (name){
			// case "servo_goto":
			// 	// logger.info(!!params.servo && !!params.position);
			// 	// if(!!params.servo && !!params.position){ // /!\ problème si servo vaut 0 !!
			// 		servo_goto(params.servo, params.position);
			// 	// }
			default:
				logger.warn("Order name " + name + " " + from + " not understood");
		}
	};


	Acts.prototype.startArduino = function(all){
		var five = require("johnny-five");
		var board = new five.Board({repl: false});
		
		board.on("ready", function() {
			logger.info("Connected to board");

			all.arduino = this;
			
			// == Motors ==
			var configs = five.Motor.SHIELD_CONFIGS.RUGGED_CIRCUITS;

			var motorA = new five.Motor(configs.A);
			var motorB = new five.Motor(configs.B);


			motorA.forward(124);
			motorB.reverse(124);

			// == Accelerator ==
			var imu = new five.IMU({
				controller: "MPU6050"
			});

			var calcAngle = function (a, b){
				return Math.atan2(a, b);
			};

	        var smoother = function(damping){
	            var last = null, _damping = 1-damping;
	            return function(data){
	                if(!last) last = data;
	                else{
	                    for(var i=0; i<last.length; i++){
	                        last[i] = (last[i]*_damping + data[i]*damping) || 0;
	                    }
	                }
	                return last;
	            };
	        };

	        var accelSmoother = smoother(0.02);
	        var pos = "up";
			imu.on("change", function() {
				var smoothed = accelSmoother([this.accelerometer.y, this.accelerometer.z]);
				// console.log("  s            : ", smoothed[0], smoothed[1]);
				var angle = calcAngle(smoothed[0], smoothed[1]);
				// console.log("  a            : ", angle);
				if ((pos == "up") && (Math.abs(angle) < 0.11)){
					console.log("Toggle to unknown");
						pos = "unknown";
						setTimeout(function(){
							console.log("Toggle to down");
							pos = "down";
							motorA.forward(0);
							motorB.reverse(0);
						}, 300);
				} else {
					if ((pos == "down") && (Math.abs(angle) > 0.15)){
						console.log("Toogle to up");
						pos = "up";
						motorA.forward(120);
						motorB.reverse(120);
					}
				}
			});
		});

		board.on("error", function(e) {
			logger.error(e);
		});
	};

	return Acts;
})();