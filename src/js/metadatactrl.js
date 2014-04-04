window.angular.module('matchboxarchive')
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
    if($routeParams.id) {
        matchboxService.get($routeParams.id).then(function(doc) {
            $scope.doc = doc.data;
        });
    }

    $scope.selectedFiles = [];
    $scope.selectedFilesChanged = function(input) {
        $scope.selectedFiles = input.files;
    };

    var uploadFile = function(file, name) {
        var deferred = $q.defer();
        var xhr = new XMLHttpRequest();
        xhr.open('POST', CONFIG.s3Endpoint+name, true);
        xhr.addEventListener('load', function() {
            deferred.resolve();
        });
        xhr.send(file);
        return deferred.promise;
    };

    $scope.unprocessedFiles = [];
    var uploading = false;
    var upload = function() {
        if($scope.unprocessedFiles.length < 1) {
            uploading = false;
            return;
        }
        if(uploading) {
            return;
        }
        uploading = true;
        uploadNextItem();
    };

    var uploadNextItem = function() {
        var file = $scope.unprocessedFiles[0];
        var deferred = $q.defer();
        file.promise = deferred.promise;
        var bigUpload = uploadFile(file.file, file.name);
        var thumbUpload = thumbGenerator({
            image: file.file,
        }).then(function(blob) {
            return uploadFile(blob, file.name+'.thumb.png');
        });

        deferred.resolve($q.all([bigUpload, thumbUpload]).then(function() {
            $scope.doc.images.push({
                id: file.name,
            });
            if(!$scope.doc.mainImage) {
                $scope.doc.mainImage = $scope.doc.images[0].id;
            }
            $scope.unprocessedFiles = $scope.unprocessedFiles.slice(1);
            if($scope.unprocessedFiles.length === 0) {
                uploading = false;
            } else {
                uploadNextItem();
            }
        }).promise);
    };

    $scope.addFiles = function(selectedFiles) {
        for(var i = 0; i < selectedFiles.length; i++) {
            var selectedFile = selectedFiles[i];
            var name = new Date().toISOString() + Math.random().toString(36);
            var ext = selectedFile.name.substr(selectedFile.name.lastIndexOf('.') + 1);
            var file = {
                file: selectedFile,
                name: name+'.'+ext,
                promise: null,
            };
            $scope.unprocessedFiles.push(file);
        }
        upload();
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
            $scope.doc.images = imgs.slice(0, parseInt(idx, 10)).concat(imgs.slice(parseInt(idx, 10)+1));
        }
    };
}]);
