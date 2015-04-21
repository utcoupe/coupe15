angular.module('app').controller('SimulateurCtrl', ['$scope', function($scope) {
	Simu.init();
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
