angular.module('matchboxarchive', ['ngRoute', 'ngSanitize'])
.factory('userService', ['$http', '$q', function($http, $q) {
	var userService = {
		isLoggedIn: false,
		login: function(username, password) {
			return $http({
				url: '/users/login',
				method: 'POST',
				headers: {
					"Content-Type": 'application/json'
				},
				data: {
					username: username,
					password: password
				}
			}).then(function(data) {
				this.isLoggedIn = (data.status == 200);
			}.bind(this));
		},
		logout: function() {
			return $http({
				url: '/users/logout',
				method: 'POST'
			}).then(function() {
				this.isLoggedIn = false;
				return true;
			}.bind(this));
		},
	};

	$http({
		url: '/users/me',
		method: 'GET'
	})
	.then(function(data) {
		if(data.status == 200) {
			userService.isLoggedIn = true;
		} 
	}.bind(this));

	return userService;
}])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider
	.when('/', {
		template: ''
	})
	.when('/details/:id', {
		templateUrl: 'partials/details.html',
		controller: 'detailsctrl'
	})
	.when('/login', {
		templateUrl: 'partials/login.html',
		controller: 'loginctrl'
	})
	.when('/upload', {
		templateUrl: 'partials/upload.html',
		controller: 'uploadctrl'
	})
	.otherwise({
		redirectTo: '/'
	})
}])
.controller('loginctrl', ['$scope', '$location', 'userService', function($scope, $location, userService) {
	$scope.location = $location;
	$scope.isLoggedIn = function() {
		return userService.isLoggedIn;
	};
	$scope.login = function() {
		userService.login($scope.username, $scope.password);
	}
	$scope.logout = function() {
		userService.logout();
	}
}])
.controller('uploadctrl', ['$scope', '$sce', 'rolloutService', 'formFieldBuilder', 'metadataSpec', function($scope, $sce, rolloutService, formFieldBuilder, metadataSpec){
	rolloutService.rollOut();
	$scope.metadataSpec = metadataSpec;
	$scope.parse = function(spec) {
		return $sce.trustAsHtml(formFieldBuilder.buildFormField(spec));
	};
}])
.value('metadataSpec', [
	{
		field: 'width',
		description: 'Width',
		type: 'float'
	},
	{
		field: 'height',
		description: 'Height',
		type: 'float'
	},
	{
		field: 'depth',
		description: 'Depth',
		type: 'float',
	},
	{
		field: 'colors',
		description: 'Colors',
		type: 'tags'
	},
	{
		field: 'tags',
		description: 'Tags',
		type: 'tags',
	},
	{
		field: 'yearStart',
		description: 'Earliest year',
		type: 'float'
	},
	{
		field: 'yearEnd',
		description: 'Latest year',
		type: 'float'
	},
	{
		field: 'country',
		description: 'Country',
		type: 'string'
	}
])
.factory('formFieldBuilder', ['$compile', function($compile) {
	return {
		buildFormField: function(spec) {
			var r = ""
			switch(spec.type) {
				case 'string':
					r = '<input type="text" ng-model="'+spec.field+'">';
					break;
				case 'float':
					r = '<input type="number" ng-model="metadata.'+spec.field+'">';
					break;
				case 'bool':
					r = '<input type="checkbox" ng-model="metadata.'+spec.field+'">';
					break;
				default:
					console.log(spec.type, 'not implemented');
			}
			return r;
		}
	}
}])
.factory('rolloutService', [function() {
	var drawer = document.getElementById('drawer');
	return {
		rollOut: function() {
			drawer.className = 'show';
		},
		rollIn: function() {
			drawer.className = '';
		}
	}
}])
