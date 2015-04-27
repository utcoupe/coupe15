angular.module('app').controller('IndexCtrl', ['$scope', 'UTCoupe', 'Client',
	function($scope, UTCoupe, Client) {
	$scope.utcoupe = UTCoupe.utcoupe;
	$scope.our_color = 'yellow';
	$scope.launch = function(u) {
		Client.send('server', 'server.launch', {
			prog: u,
			color: $scope.our_color
		});
	}
	$scope.stop = function(u) {
		Client.send('server', 'server.stop', u);
	}
}]);

angular.module('app').service('UTCoupe', ['$rootScope', 'Client', function($rootScope, Client) {
	this.utcoupe = {
		'ia': false,
		'pr': false,
		'gr': false,
		'hokuyo': false
	};
	this.init = function () {
		Client.order(function (from, name, data) {
			if(name == 'utcoupe') {
				// console.log('[UTCoupe update]');
				this.utcoupe.ia = data.ia;
				this.utcoupe.gr = data.gr;
				this.utcoupe.pr = data.pr;
				this.utcoupe.hokuyo = data.hokuyo;
				$rootScope.$apply();
			}
		}.bind(this));
	};
}]);
