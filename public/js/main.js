angular.module('matchboxarchive', ['ngRoute'])
.factory('helper', [function() {
	return {
		httpPromiseResolver: function(data) {
			if(data.status == 200) {
				return {
					error: false,
					data: data.data
				};
			}
			return {
				error: true,
				data: data.data
			}
		}
		}
}])
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
.factory('matchboxService', ['$http', '$q', 'helper', function($http, $q, helper) {
	return {
		save: function(doc) {
			if(doc.id) {
				return this.update(doc.id, doc);
			}
			return this.create(doc);
		},
		create: function(doc) {
			return $http({
				url: '/matchboxes',
				method: 'POST',
				data: doc,
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(helper.httpPromiseResolver);
		},
		update: function(id, doc) {
			return $http({
				url: '/matchboxes/'+id,
				method: 'PUT',
				data: doc,
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(helper.httpPromiseResolver);
		},
		get: function(id) {
			return $http({
				url: '/matchboxes/'+id,
				method: 'GET',
			}).then(helper.httpPromiseResolver);
		}
	} 
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
.controller('uploadctrl', ['$scope', '$location', '$q', 'userService', 'matchboxService', 'rolloutService', 'CONFIG', function($scope, $location, $q, userService, matchboxService, rolloutService, CONFIG){
	rolloutService.rollOut();
	userService.refreshState().then(function(isLoggedIn) {
		if(!isLoggedIn) {
			$location.path('/login');
		}
	});
	$scope.msg = {};

	$scope.doc = {
		images: [],
		metadata: {}
	};
	$scope.unprocessedFiles = [];
	$scope.uploading = false;
	$scope.selectedFilesChanged = function(input) {
		$scope.selectedFiles = input.files;
	};

	var upload = function() {
		$scope.uploading = true;
		var file = $scope.unprocessedFiles[0];

		var xhr = new XMLHttpRequest();
		xhr.open('POST', CONFIG.s3Endpoint+file.remoteName, true);
		xhr.upload.addEventListener('progress', function(ev) {
			file.status = 'uploading';
			$scope.$apply();
		}, false);
		xhr.addEventListener('load', function(ev) {
			file.status = 'done';
			$scope.doc.images.push({id: file.remoteName});
			if(!$scope.doc.mainImage) {
				$scope.doc.mainImage = $scope.doc.images[0].id;
			}
			$scope.unprocessedFiles = $scope.unprocessedFiles.slice(1);
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
			var ext = selectedFile.name.substr(selectedFile.name.lastIndexOf('.') + 1);
			var file = {
				file: selectedFile,
				remoteName: new Date().toISOString() + Math.random().toString(36).substring(2,7) + '.' + ext,
				status: 'waiting',
			};
			$scope.unprocessedFiles.push(file);
			if(!$scope.uploading) {
				upload();
			}
		}
	};

	$scope.save = function(doc) {
		matchboxService.save(doc).then(function() {
			$scope.msg = {
				type: 'success',
				text: 'Item added to database'
			};
		}, function(data) {
			$scope.msg = {
				type: 'error',
				text: 'Item could not be added to database: ' + JSON.stringify(data.data)
			};
		})
	}
}])
.controller('searchctrl', ['$scope', 'rolloutService', 'CONFIG', function($scope, rolloutService, CONFIG) {
	$scope.results = [];
	$scope.loading = false;
	$scope.rolloutService = rolloutService;
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
	infiniteScrollLoad: 20,
});

angular.bootstrap(document, ['matchboxarchive']);