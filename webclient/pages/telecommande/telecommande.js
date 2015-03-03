angular.module('app').controller('TelecommandeCtrl', ['$scope', function($scope) {
	$scope.rc_pr_pos_value = 0.5;
	$scope.rc_pr_servo1_min = 63;
	$scope.rc_pr_servo1_max = 90;
	$scope.rc_pr_servo2_min = 63;
	$scope.rc_pr_servo2_max = 90;

	$(document).on("click", "#rc_hok_start", function(e) {
		client.send("hokuyo", "start", {
			"color": $("#rc_hok_color").val(),
			"nbrobots": parseInt($("#rc_hok_nbrobots").val())});
		console.log("Message `start` sent");
	});

	$(document).on("click", "#rc_hok_stop", function(e) {
		client.send("hokuyo", "stop", {});
		console.log("Message `stop` sent");
	});

	$scope.updatePosValue = function (value){
		client.send("pr", "servo_goto", {
			"servo": $("#rc_pr_numservo").val(),
			"position": parseFloat(value)
		});
		// console.log("Message `servo_goto` " + value + " sent to PR.");
	}

	$scope.prServoClose = function (servo1_min, servo2_min){
		client.send("pr", "servo_goto", {
			"servo": 0,
			"position": servo1_min/180
		});
		client.send("pr", "servo_goto", {
			"servo": 1,
			"position": servo2_min/180
		});
	}

	$scope.prServoOpen = function (servo1_max, servo2_max){
		client.send("pr", "servo_goto", {
			"servo": 0,
			"position": servo1_max/180
		});
		client.send("pr", "servo_goto", {
			"servo": 1,
			"position": servo2_max/180
		});
	}
}]);