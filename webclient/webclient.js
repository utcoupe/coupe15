angular.module('app', [
	'ngRoute'
]);

angular.module('app').config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	// $locationProvider.html5Mode(true);
	$routeProvider
		.when('/', {templateUrl: 'index.tpl.html'})
		.when('/logger', {templateUrl: 'pages/logger/logger.tpl.html'})
		.when('/reseau', {templateUrl: 'pages/reseau/reseau.tpl.html'})
		.when('/simulateur', {templateUrl: 'pages/simulateur/simulateur.tpl.html'})
		.when('/telecommande', {templateUrl: 'pages/telecommande/telecommande.tpl.html'})
		.otherwise({redirectTo:'/'});
}]);

angular.module('app').controller('AppCtrl', ['$scope', 'Logger', 'Reseau', 'Simulateur',
	function($scope, Logger, Reseau, Simulateur) {
	Logger.init();
	Reseau.init();
	Simulateur.init();
}]);

angular.module('app').controller('MenuCtrl', ['$scope', function($scope) {
	
}]);

angular.module('app').controller('IndexCtrl', ['$scope', function($scope) {
	
}]);

angular.module('app').service('Client', SocketWebclient);
