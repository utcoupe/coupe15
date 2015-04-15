module.exports = (function () {
	var log4js = require('log4js');
	var logger = log4js.getLogger('clientpr.acts');

	function Acts() {
		this.arduinos = {};
		this.ax12 = {};
		this.servos = {};
		
		this.start();
	}

	Acts.prototype.start = function(){
		// this.startArduino(this);
	};

	Acts.prototype.quit = function(){
		if (this.arduinos)
			this.quitArduinos();

		if (this.ax12)
			this.quiAX12();

		return;
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
			case "servo_goto":
				// logger.info(!!params.servo && !!params.position);
				// if(!!params.servo && !!params.position){ // /!\ problème si servo vaut 0 !!
					servo_goto(params.servo, params.position);
				// }
				break;
			case "servo_close":
				servo_close();
				break;
			case "servo_open":
				servo_open();
				break;
			case "AX12_goto":
				AX12_goto(params.position);
				break;
			case "AX12_close":
				AX12_close();
				break;
			case "AX12_open":
				AX12_open();
				break;
			case "steppers_move":
				stepper_do(params.move, params.direction);
				break;
			case "steppers_toogle":
				stepper_toogle();
				break;
			case "steppers_set_bottom":
				stepper_setBottom();
				break;
			// case "orders_array":
			// 	ordersArrayHandler(params.orders);
			// 	break;
			case "send_message":
				client.send("pr", params.name, {action_name: params.action_name});
				break;
			default:
				logger.warn("Order name " + name + " " + from + " not understood");
		}
	};


	Acts.prototype.startArduino = function(ia){
		var five = require("johnny-five");
		var board = new five.Board({repl: false});
		
		board.on("ready", function() {
			logger.info("Connected to board");

			ia.arduinos.zero.ready = this;
			this.servo = [];
			this.stepper = [];
			
			// == Connections ==
			// Pas à pas
				this.stepper[0] = new five.Stepper({
					type: five.Stepper.TYPE.FOUR_WIRE,
					stepsPerRev: 200,
					pins: [ 8, 9, 10, 11 ]
				});
				this.stepper[0].is = "nowhere";

				this.stepper[1] = new five.Stepper({
					type: five.Stepper.TYPE.DRIVER,
					stepsPerRev: 200,
					pins: [9, 10]
				});

				this.stepper[0].rpm(120).cw(); // change rien
				// this.stepper[1].rpm(120).ccw();

			// Servo
				// this.servo[0] = new five.Servo({
				// 	pin: 10
				// });
				// this.servo[1] = new five.Servo({
				// 	pin: 11,
				// 	isInverted: true
				// });
				// logger.info(this.servo);


		});

		board.on("error", function(e) {
			logger.error(e);
		});
	};

	Acts.prototype.startAX12 = function(){
		
	};

	// Servo
		function servo_goto(servo, position){
			// if (ia.arduinos.zero.ready) {
			// 	// logger.info("Servo " + servo + " moved to " + position*180 + " :)");
			// 	board.servo[servo].to(position*180);
			// }
		}

		function servo_close(){
			// if (ia.arduinos.zero.ready) {
			// 	board.servo[0].to(65);
			// 	board.servo[1].to(86);
			// }
		}

		function servo_open(){
			// if (ia.arduinos.zero.ready) {
			// 	board.servo[0].to(112);
			// 	board.servo[1].to(135);
			// }
		}

	// Pas à pas
		function stepper_do(move, direction){
			// direction is given for the left motor as it sees it
			if (ia.arduinos.zero.ready) {
				if (direction == "clockwise"){
					logger.info("Moving "+move+" clockwise");
					board.stepper[0].rpm(120).cw().step(move, function(){}); // left
					// board.stepper[1].rpm(60).cw().step(600, function(){}); // right
				} else {
					logger.info("Moving "+move+" counterclockwise");
					// board.stepper[0].rpm(120).cw(); // change rien
					// board.stepper[1].rpm(120).cw();
					board.stepper[0].rpm(120).ccw().step(move, function(){}); // left
					// board.stepper[1].rpm(600).ccw().step(600, function(){}); // right
				}
			}
		}

		function stepper_setBottom(){
			board.stepper[0].is = "down";
		}

		function stepper_toogle(){
			if (ia.arduinos.zero.ready) {
				if (board.stepper[0].is == "up"){
					stepper_do(250, "clockwise");
					board.stepper[0].is = "down";
				} else {
					if (board.stepper[0].is == "down") {
						stepper_do(250, "counterclockwise");
						board.stepper[0].is = "up";
					}
				}
			}
		}


	// AX-12
		// var MotorSystem = require("dynanode");
		// var ms = new MotorSystem(1000000);
		// var motors = [ false, false, false, false];
		// var movingSpeed = 1023;
		// var compliance = 32;
		// // ms.addToBlackList("/dev/tty.Bluetooth-PDA-Sync");
		// // ms.addToBlackList("/dev/tty.Bluetooth-Modem");

		// // setInterval(callback, delay, [arg], [...])

		// ms.on("motorAdded",function(d) {
		// 	// d.motor.setRegisterValue("torqueEnable",1);
		// 	d.motor.setRegisterValue("movingSpeed", movingSpeed);
		// 	d.motor.setRegisterValue("goalPosition",512);
		// 	d.motor.setRegisterValue("torqueLimit",800);
		// 	// d.motor.setRegisterValue("returnDelayTime", 12*d.motor.getID());
		// 	motors[d.motor.getID()] = d.motor;

		// 	// d.motor.on("valueUpdated",function(m){
		// 	// 	logger.info("value updated: "+d.motor.getID()+" "+m.name+":"+m.value);
		// 	// });
		// });

		// ms.on("motorRemoved",function(d) {
		// 	motors[d.id] = false;
		// 	logger.info("Motor " + d.id + " disconnected.");

		// 	// d.motor.on("valueUpdated",function(m){
		// 	// 	logger.info("value updated: "+d.motor.getID()+" "+m.name+":"+m.value);
		// 	// });
		// });
		
		// // d.motor.setRegisterValue("goalPosition",movingSpeed);

		// process.on('SIGINT', function() {
		// 	logger.info("Shutdown command, pid " + process.pid);
		// 	ms.terminate();
		// 	setTimeout(process.kill, 500, process.pid);
		// });

		// ms.init();


		// function AX12_set2Goals(motor, side, position, motor2, side2, position2){
		// 	AX12_setGoal(motor2, side2, position2);
		// 	setTimeout(function (){
		// 		AX12_setGoal(motor, side, position);
		// 	}, 10);
		// };

		// function AX12_setGoal(motor, side, position){
		// 	logger.info("Moving motor " + motor + " to position " + position);
		// 	if (!!motors[motor]) {
		// 		if (side == "right") {
		// 			// logger.info("verifdroit");
		// 			motors[motor].setRegisterValue("torqueLimit",800);
		// 			motors[motor].setRegisterValue("movingSpeed", movingSpeed);
		// 			motors[motor].setRegisterValue("goalPosition",1024-position);
		// 			// var i=0;
		// 			// var intervalId = setInterval(function (){
		// 			// 	if((motors[motor].getRegister("presentPosition").decodedValue > 1024-position + compliance) || motors[motor].getRegister("presentPosition").decodedValue < 1024-position - compliance){
		// 			// 		motors[motor].setRegisterValue("goalPosition", 1024-position);
		// 			// 		// console.log("mot2 " + i++);
		// 			// 	} else
		// 			// 		// logger.info("Iters :" + i);
		// 			// 		clearInterval(intervalId);
		// 			// }, 21);
		// 		} else {
		// 			motors[motor].setRegisterValue("torqueLimit",800);
		// 			motors[motor].setRegisterValue("movingSpeed", movingSpeed);
		// 			motors[motor].setRegisterValue("goalPosition",position);
		// 			// var j=0;
		// 			// var intervalId = setInterval(function (){
		// 			// 	logger.info("verifgauche");
		// 			// 	if((motors[motor].getRegister("presentPosition").decodedValue > position + compliance) || (motors[motor].getRegister("presentPosition").decodedValue < position - compliance)){
		// 			// 		motors[motor].setRegisterValue("goalPosition", position);
		// 			// 		// console.log("mot3 " + j++);
		// 			// 	} else
		// 			// 		// logger.info("Iters :" + j);
		// 			// 		clearInterval(intervalId);
		// 			// }, 21);
		// 		}
		// 	} else {
		// 		logger.error("Motor " + motor + "not connected");
		// 	}
		// }

		// function AX12_goto(position){
		// 	AX12_setGoal(2, "right", position);
		// 	AX12_setGoal(3, "left", position);
		// };

		// function AX12_close(){
		// 	AX12_set2Goals(2, "right", 745, 3, "left", 745);
		// };

		// function AX12_open(){
		// 	AX12_set2Goals(2, "right", 400, 3, "left", 400);
		// };



	
		// function ordersArrayHandler(array){
		// 	for (var i = 0; i < array.length; i++)
		// 		orderHandler("pr", array[i].name, array[i].params);
		// }
	return Acts;
})();