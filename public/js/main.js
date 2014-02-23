var app = angular.module('matchboxarchive', []);
app.factory('userService', ['$http', '$q', function($http, $q) {
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
}]);
app.controller('loginctrl', ['$scope', 'userService', function($scope, userService) {
	$scope.isLoggedIn = function() {
		return userService.isLoggedIn;
	};
	$scope.login = function() {
		userService.login($scope.username, $scope.password);
	}
	$scope.logout = function() {
		userService.logout();
	}
}]);
