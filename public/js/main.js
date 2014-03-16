angular.module('matchboxarchive', ['ngRoute'])
.factory('helper', [function() {
	return {
		httpPromiseResolver: function(data) {
			return {
				error: data.status != 200,
				data: data.data
			};
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
		},
		delete: function(id) {
			return $http({
				url: '/matchboxes/'+id,
				method: 'DELETE',
			}).then(helper.httpPromiseResolver);
		},
		query: function(qry) {
			return $http({
				url: '/matchboxes?'+JSON.stringify(qry),
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
		templateUrl: 'partials/metadata.html',
		controller: 'metadatactrl'
	})
	.when('/edit/:id', {
		templateUrl: 'partials/metadata.html',
		controller: 'metadatactrl'
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
.controller('metadatactrl', ['$scope', '$location', '$routeParams', '$q', 'userService', 'matchboxService', 'rolloutService', 'thumbGenerator', 'CONFIG', function($scope, $location, $routeParams, $q, userService, matchboxService, rolloutService, thumbGenerator, CONFIG){
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
	if($routeParams.id != "") {
		matchboxService.get($routeParams.id).then(function(doc) {
			$scope.doc = doc.data;
		});
	}
	$scope.unprocessedFiles = [];
	$scope.uploading = false;
	$scope.selectedFilesChanged = function(input) {
		$scope.selectedFiles = input.files;
	};

	var uploadFile = function(file, name) {
		var deferred = $q.defer();
		var xhr = new XMLHttpRequest();
		xhr.open('POST', CONFIG.s3Endpoint+name, true);
		xhr.addEventListener('load', function(ev) {
			deferred.resolve();
		});
		xhr.send(file.file);
		return q.promise;
	};

	var upload = function() {
		_($scope.unprocessedFiles)
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
			var name = 
			var ext = ;
			var file = {
				file: selectedFile,
				name: new Date().toISOString() + Math.random().toString(36),
				ext: selectedFile.name.substr(selectedFile.name.lastIndexOf('.') + 1),
				promise: null,
			};
			$scope.unprocessedFiles.push(file);
			upload();
		}
	};

	$scope.save = function(doc) {
		matchboxService.save(doc).then(function(data) {
			$scope.msg = {
				type: 'success',
				text: 'Item saved'
			};
			$location.path('/details/'+data.data.id);
		}, function(data) {
			$scope.msg = {
				type: 'error',
				text: 'Item could not be saved: ' + JSON.stringify(data.data)
			};
		});
	};

	$scope.remove = function(imgId) {
		var idx = -1;
		var imgs = $scope.doc.images;
		for(var i in imgs) {
			if(imgs[i].id == imgId) {
				idx = i;
			}
		}
		if(idx != -1){
			$scope.doc.images = imgs.slice(0, parseInt(idx)).concat(imgs.slice(parseInt(idx)+1));
		}
	};	
}])
.controller('detailsctrl', ['$scope', '$location', '$routeParams', '$q', 'userService', 'matchboxService', 'rolloutService', 'CONFIG', function($scope, $location, $routeParams, $q, userService, matchboxService, rolloutService, CONFIG){
	$scope.isLoggedIn = function() {
		return userService.isLoggedIn
	};
	$scope.doc = {
		images: [],
		metadata: {}
	};
	if($routeParams.id != "") {
		matchboxService.get($routeParams.id).then(function(doc) {
			$scope.doc = doc.data;
		});
	}

	$scope.editMatchbox = function(imgId) {
		$location.path('/edit/'+imgId);
	};

	$scope.deleteMatchbox = function(imgId) {
		if(confirm('Do you really want to delete this matchbox')) {
			matchboxService.delete(imgId);
		}
	};

	$scope.duplicateMatchbox = function(matchbox) {
		delete matchbox.id;
		matchboxService.create(matchbox).then(function(data) {
			$location.path('/edit/'+data.data.id);
		});
	}

}])
.controller('searchctrl', ['$scope', '$interval', '$location', 'matchboxService', 'rolloutService', 'userService', 'CONFIG', function($scope, $interval, $location, matchboxService, rolloutService, userService, CONFIG) {
	$scope.results = [];
	$scope.page = 0;
	$scope.hasMore = true;

	$scope.isLoggedIn = function() {
		return userService.isLoggedIn;
	};

	$scope.query = {
		'visible': true,
	};

	$interval(function poll() {
		if(!$scope.hasMore) {
			return;
		}

		var offset = document.querySelector('.load-trigger').getClientRects()[0].top - window.innerHeight;
		if(offset < 10) {
			var pagedQuery = $scope.query;
			pagedQuery['$skip'] = $scope.page*CONFIG.infiniteScrollLoad;
			pagedQuery['$limit'] = CONFIG.infiniteScrollLoad;
			matchboxService.query(pagedQuery).then(function(data) {
				$scope.page += 1;
				$scope.hasMore = data.data.length == CONFIG.infiniteScrollLoad;
				for(var i in data.data) {
					$scope.results.push(data.data[i]);
				}
			})
			return;
		}
	}, CONFIG.infiniteScrollPoll);

	$scope.queryData = {};

	$scope.newSearch = function() {
		$scope.query = {};
		if(!($scope.isLoggedIn() && ($scope.queryData.showHidden))) {
			$scope.query['visible'] = true;
		}
		$scope.page = 0;
		$scope.hasMore = true;
		$scope.results = [];
	};

	$scope.showDetails = function(imgId) {
		rolloutService.rollOut();
		$location.path('/details/'+imgId);
	};

	$scope.closeDrawer = function() {
		rolloutService.rollIn();
		$location.path('/');
	};

	$scope.newMatchbox = function() {
		rolloutService.rollOut();
		$location.path('/upload');
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
.factory('thumbGenerator', ['$q', '$document', function($q, $document) {
	var defaultValues = function(opts) {
		opts.maxWidth = opts.maxWidth || 200;
		opts.maxHeight = opts.maxHeight || 200;
		return opts;
	};
	var resizeImage = function(opts, img) {
		var cnv = $document.createElement('canvas');
		var ctx = cnv.getContext('2d');
		cnv.width = opts.maxWidth;
		cnv.height = opts.maxHeight;

		ctx.drawImage(img, 0, 0, opts.maxWidth, opts.maxHeight);

		var deferred = $q.defer();
		cnv.toBlob(function(blob) {
			console.log(blob)
			deferred.resolve(blob);
		}, "image/png");
		return deferred.promise;
	};

	return function(opts) {
		opts = defaultValues(opts);
		var img = $document.createElement('img');
		img.crossOrigin = 'anonymous';

		var deferred = $q.defer();
		if(typeof opts.image === 'string') {
			img.addEventListener('load', function() {
				deferred.resolve(resizeImage(img, opts));
			});
			img.src = opts.image;
		}
		return deferred.promise;
	};
}])
.value('CONFIG', {
	s3Endpoint: '/bucket/',
	infiniteScrollLoad: 20,
	infiniteScrollPoll: 200,
	thumbSize: 150,
});

angular.bootstrap(document, ['matchboxarchive']);