angular.module('app').controller('TelecommandeCtrl', ['$rootScope', '$scope', 'Client',
	function($rootScope, $scope, Client) {
	$rootScope.act_page = 'telecommande';
	$scope.gr_pwm_gauche = 50;
	$scope.gr_pwm_droite = 50;
	$scope.gr_pwm_ms = 1000;
	$scope.gr_a = 0;
	$scope.gr_x = 0;
	$scope.gr_y = 0;

	$scope.grAcheter = function() {
		Client.send("gr", "acheter", {});
	};

	$scope.grVendre = function() {
		Client.send("gr", "vendre", {});
	};

	$scope.grPWM = function() {
		Client.send("gr", "pwm", {
			left: $scope.gr_pwm_droite,
			right: $scope.gr_pwm_gauche,
			ms: $scope.gr_pwm_ms
		});
	};

	$scope.grGoa = function() {
		Client.send("gr", "goa", {a: parseFloat($scope.gr_a)*Math.PI/180});
	};
	$scope.grGoxy = function() {
		Client.send("gr", "goxy", {x: parseFloat($scope.gr_x), y: parseFloat($scope.gr_y)});
	};
	$scope.grGoxya = function() {
		$scope.grGoxy();
		$scope.grGoa();
	};

	$scope.grScript = function() {
		$scope.grAcheter();
		$scope.gr_pwm_gauche = 80;
		$scope.gr_pwm_droite = 80;
		$scope.gr_pwm_ms = 3550;
		$scope.grPWM();
		$scope.gr_pwm_gauche = -100;
		$scope.gr_pwm_droite = 100;
		$scope.gr_pwm_ms = 1600;
		$scope.grPWM();
		$scope.gr_pwm_gauche = 80;
		$scope.gr_pwm_droite = 80;
		$scope.gr_pwm_ms = 2500;
		$scope.grPWM();
		$scope.grVendre();
		$scope.gr_pwm_gauche = 80;
		$scope.gr_pwm_droite = 80;
		$scope.gr_pwm_ms = 1500;
		$scope.grPWM();
		$scope.grAcheter();
	};




	$(document).on("click", "#rc_pr_servo", function(e) {
		Client.send("pr", "servo_goto", {
			"servo": $("#rc_pr_numservo").val(),
			"position": parseInt($("#rc_pr_servo_pos").val())});
	});



	$(document).on("click", "#rc_pr_stab_close", function(e) {
		Client.send("pr", "stabs_close", {});
	});

	$(document).on("click", "#rc_pr_stab_chouilla", function(e) {
		Client.send("pr", "stabs_open_chouilla", {});
	});

	$(document).on("click", "#rc_pr_stab_open", function(e) {
		Client.send("pr", "stabs_open", {});
	});

	$(document).on("click", "#rc_pr_arm_close", function(e) {
		Client.send("pr", "arm_close", {});
	});

	$(document).on("click", "#rc_pr_arm_chouilla", function(e) {
		Client.send("pr", "arm_open_chouilla", {});
	});

	$(document).on("click", "#rc_pr_arm_open", function(e) {
		Client.send("pr", "arm_open", {});
	});

	$(document).on("click", "#rc_pr_AX12_close", function(e) {
		Client.send("pr", "AX12_close", {});
	});

	$(document).on("click", "#rc_pr_AX12_open", function(e) {
		Client.send("pr", "AX12_open", {});
	});


	$(document).on("click", "#rc_hok_start", function(e) {
		Client.send("hokuyo", "start", {
			"color": $("#rc_hok_color").val(),
			"nbrobots": parseInt($("#rc_hok_nbrobots").val())});
		console.log("Message `start` sent");
	});

	$(document).on("click", "#rc_hok_stop", function(e) {
		Client.send("hokuyo", "stop", {});
		console.log("Message `stop` sent");
	});


	/*$scope.rc_pr_pos_value = 0.5;
	$scope.rc_pr_AX12_pos = 500;
	$scope.rc_pr_servo1_min = 63;
	$scope.rc_pr_servo1_max = 90;
	$scope.rc_pr_servo2_min = 63;
	$scope.rc_pr_servo2_max = 90;
	$scope.rc_pr_steppers_move = 0;



	$scope.updatePosValue = function (value){
		Client.send("pr", "servo_goto", {
			"servo": $("#rc_pr_numservo").val(),
			"position": parseFloat(value)
		});
		// console.log("Message `servo_goto` " + value + " sent to PR.");
	}

	$scope.prServoClose1 = function (servo1_min, servo2_min){
		Client.send("pr", "servo_goto", {
			"servo": 0,
			"position": servo1_min/180
		});
		Client.send("pr", "servo_goto", {
			"servo": 1,
			"position": servo2_min/180
		});
	}

	$scope.prServoOpen1 = function (servo1_max, servo2_max){
		Client.send("pr", "servo_goto", {
			"servo": 0,
			"position": servo1_max/180
		});
		Client.send("pr", "servo_goto", {
			"servo": 1,
			"position": servo2_max/180
		});
	}

	$scope.prServoClose2 = function (){
		Client.send("pr", "servo_close", {});
	}

	$scope.prServoOpen2 = function (){
		Client.send("pr", "servo_open", {});
	}


	$scope.updateAX12PosValue = function (value){
		Client.send("pr", "AX12_goto", {
			"position": $scope.rc_pr_AX12_pos
		});
	}

	$scope.prAX12Close = function (value){
		Client.send("pr", "AX12_close", {});
	}

	$scope.prAX12Open = function (value){
		Client.send("pr", "AX12_open", {});
	}

	$scope.updateSteppersMoveValue = function (rc_pr_steppers_move){
		var direction = rc_pr_steppers_move<0?"clockwise":"counterclockwise";

		Client.send("pr", "steppers_move", {
			move: Math.abs(rc_pr_steppers_move),
			direction: direction
		});

		$scope.rc_pr_steppers_move = 0;
	};

	$scope.prSteppersToogle = function (){
		Client.send("pr", "steppers_toogle", {});
	};

	$scope.prSteppersSetBottom = function (){
		Client.send("pr", "steppers_set_bottom", {});
	};*/
}]);