angular.module('app').controller('SimulateurCtrl', ['$rootScope', '$scope', 'Client',
	function($rootScope, $scope, Client) {
	$rootScope.act_page = 'simulateur';
	Simu.init();
	$scope.vueDeFace = function() { Simu.vueDeFace(); }
	$scope.vueDeDessus = function() { Simu.vueDeDessus(); }
	$scope.vueDeDerriere = function() { Simu.vueDeDerriere(); }
	$scope.vueDeGauche = function() { Simu.vueDeGauche(); }
	$scope.vueDeDroite = function() { Simu.vueDeDroite(); }
	$scope.iaJack = function() { Client.send("ia", "ia.jack"); }
}]);

angular.module('app').service('Simulateur', ['$rootScope', 'Client', function($rootScope, Client) {
	this.init = function () {
		Client.order(function (from, name, data) {
			if(name == 'simulateur' && $rootScope.act_page == 'simulateur') {
				Simu.update(data);
			}
		});
	};
}]);
