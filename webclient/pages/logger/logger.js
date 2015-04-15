angular.module('app').controller('LoggerCtrl', ['$scope', 'Logger', '$interval', function($scope, Logger, $interval) {
	$scope.orders = Logger.orders;
}]);

angular.module('app').service('Logger', ['$rootScope', 'Client', function($rootScope, Client) {
	this.orders = [];
	this.init = function () {
		Client.order(function (from, name, data, to) {
			this.orders.unshift({
				from: from,
				name: name,
				data: JSON.stringify(data),
				to: to,
			});
		if(this.orders.length > 2000)
			this.orders.pop();
		$rootScope.$apply();
		}.bind(this));
	};
}]);
