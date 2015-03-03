angular.module('app').controller('LoggerCtrl', ['$scope', 'Logger', '$interval', function($scope, Logger, $interval) {
	$scope.orders = Logger.orders;
	Logger.onOrder(function() { this.$apply(); }.bind($scope));
}]);

angular.module('app').service('Logger', ['Client', function(Client) {
	this.orders = [];
	this.deffered = $q.defer();
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
		this.callback();
		}.bind(this));
	};
	this.onOrder = function (callback) {
		this.callback = callback;
	};
}]);