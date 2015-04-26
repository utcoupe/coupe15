angular.module('app').controller('OrdersCtrl', ['$scope', 'Orders', '$interval', function($scope, Orders, $interval) {
	$scope.orders = Orders.orders;
}]);

angular.module('app').service('Orders', ['$rootScope', 'Client', function($rootScope, Client) {
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
