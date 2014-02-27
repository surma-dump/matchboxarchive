angular.module('matchboxarchive', ['ngRoute'])
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
		refreshState: function() {
			return $http({
				url: '/users/me',
				method: 'GET'
			})
			.then(function(data) {
				if(data.status == 200) {
					userService.isLoggedIn = true;
				} else {
					userService.isLoggedIn = false;
				}
				return userService.isLoggedIn
			});
		}
	};

	userService.refreshState();
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
.controller('loginctrl', ['$scope', '$location', 'userService', 'rolloutService', function($scope, $location, userService, rolloutService) {
	rolloutService.rollOut();
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
.controller('uploadctrl', ['$scope', '$location', '$q', 'userService', 'rolloutService', 'CONFIG', function($scope, $location, $q, userService, rolloutService, CONFIG){
	rolloutService.rollOut();
	userService.refreshState().then(function(isLoggedIn) {
		if(!isLoggedIn) {
			$location.path('/login');
		}
	});
	$scope.deferredUpload = $q.defer()
	$scope.deferredUpload.resolve();
	$scope.metadata = {};
	$scope.files = [];
	$scope.unprocessedFiles = []
	$scope.uploading = false;
	$scope.selectedFilesChanged = function(input) {
		$scope.selectedFiles = input.files;
	};

	var upload = function() {
		$scope.uploading = true;
		var file = $scope.unprocessedFiles[0];
		$scope.unprocessedFiles = $scope.unprocessedFiles.slice(1);

		var xhr = new XMLHttpRequest();
		xhr.open('POST', CONFIG.s3Endpoint+file.remoteName, true);
		xhr.upload.addEventListener('progress', function(ev) {
			file.status = 'Uploading...';
			$scope.$apply();
		}, false);
		xhr.addEventListener('load', function(ev) {
			file.status = 'Done';
			$scope.$apply();
			if($scope.unprocessedFiles.length == 0) {
				$scope.uploading = false;
				return;
			}
			upload();
		})
		xhr.send(file.file);
	};

	$scope.addFiles = function(selectedFiles) {
		for(var i = 0; i < selectedFiles.length; i++) {
			var selectedFile = selectedFiles[i];
			var file = {
				file: selectedFile,
				remoteName: new Date().toISOString(),
				status: "0%",
			};
			$scope.files.push(file);
			$scope.unprocessedFiles.push(file);
			if(!$scope.uploading) {
				upload();
			}
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
.value('CONFIG', {
	s3Endpoint: '/bucket/',
})
