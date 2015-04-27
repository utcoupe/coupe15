angular.module('app').controller('SimulateurCtrl', ['$scope', function($scope) {
	Simu.init();
	$scope.vueDeFace = function() { Simu.vueDeFace(); }
	$scope.vueDeDessus = function() { Simu.vueDeDessus(); }
	$scope.vueDeDerriere = function() { Simu.vueDeDerriere(); }
	$scope.vueDeGauche = function() { Simu.vueDeGauche(); }
	$scope.vueDeDroite = function() { Simu.vueDeDroite(); }
}]);

angular.module('app').service('Simulateur', ['Client', function(Client) {
	this.init = function () {
		Client.order(function (from, name, data) {
			if(name == "simulator_update") {
				Simu.update(data);
			}
		});
	};
}]);
