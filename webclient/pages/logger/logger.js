angular.module('app').controller('LoggerCtrl', ['$scope', 'Logger', function($scope, Logger) {
	$scope.logs = Logger.logs;
}]);

angular.module('app').service('Logger', ['$rootScope', 'Client', function($rootScope, Client) {
	this.logs = [];
	this.init = function () {
		Client.order(function (from, name, data) {
			if(name == 'logger') {
				console.log('log', data);
				this.logs.unshift(data);
				if(this.logs.length > 500)
					this.logs.pop();
				$rootScope.$apply();
			}
		}.bind(this));
	};
}]);
