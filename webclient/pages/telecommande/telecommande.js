angular.module('app').controller('TelecommandeCtrl', ['$scope', function($scope) {

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
}]);