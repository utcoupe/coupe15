angular.module('app').controller('TelecommandeCtrl', ['$scope', 'Client', function($scope, Client) {
	$scope.rc_pr_pos_value = 0.5;
	$scope.rc_pr_AX12_pos = 500;
	$scope.rc_pr_servo1_min = 63;
	$scope.rc_pr_servo1_max = 90;
	$scope.rc_pr_servo2_min = 63;
	$scope.rc_pr_servo2_max = 90;
	$scope.rc_pr_steppers_move = 0;

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
	};
}]);