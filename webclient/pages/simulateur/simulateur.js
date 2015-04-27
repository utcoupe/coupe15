angular.module('app').controller('SimulateurCtrl', ['$rootScope', '$scope',
	function($rootScope, $scope) {
	$rootScope.act_page = 'simulateur';
	Simu.init();
	$scope.vueDeFace = function() { Simu.vueDeFace(); }
	$scope.vueDeDessus = function() { Simu.vueDeDessus(); }
	$scope.vueDeDerriere = function() { Simu.vueDeDerriere(); }
	$scope.vueDeGauche = function() { Simu.vueDeGauche(); }
	$scope.vueDeDroite = function() { Simu.vueDeDroite(); }
}]);

angular.module('app').service('Simulateur', ['$rootScope', 'Client', function($rootScope, Client) {
	this.init = function () {
		Client.order(function (from, name, data) {
			if(name == "simulator_update" && $rootScope.act_page == 'simulateur') {
				Simu.update(data);
			}
		});
	};
}]);
