angular.module('app').controller('LoggerCtrl', ['$rootScope', '$scope', 'Logger',
	function($rootScope, $scope, Logger) {
	// $rootScope.act_page = 'logger';
	$scope.logs = Logger.logs;
}]);

angular.module('app').service('Logger', ['$rootScope', '$sce', 'Client',
	function($rootScope, $sce, Client) {
	this.logs = [];
	this.init = function () {
		Client.order(function (from, name, data) {
			if(name == 'logger') {
				// console.log('log', data);
				this.logs.unshift($sce.trustAsHtml(data));
				if(this.logs.length > 500)
					this.logs.pop();
				if($rootScope.act_page == 'index') {
					$rootScope.$apply();
				}
			}
		}.bind(this));
	};
}]);
