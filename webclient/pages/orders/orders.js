angular.module('app').controller('OrdersCtrl', ['$scope', 'Orders', function($scope, Orders) {
	$scope.orders = Orders.orders;
}]);

angular.module('app').service('Orders', ['$rootScope', 'Client', function($rootScope, Client) {
	this.orders = [];
	this.init = function () {
		Client.order(function (from, name, data, to) {
			if(name != 'logger' && name != 'utcoupe') {
				this.orders.unshift({
					from: from,
					name: name,
					data: JSON.stringify(data),
					to: to,
				});
				if(this.orders.length > 500)
					this.orders.pop();
				$rootScope.$apply();
			}
		}.bind(this));
	};
}]);
