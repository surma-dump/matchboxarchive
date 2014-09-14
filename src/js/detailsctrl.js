window.angular.module('matchboxarchive')
.controller('detailsctrl', ['$scope', '$location', '$routeParams', '$q', 'userService', 'matchboxService', function($scope, $location, $routeParams, $q, userService, matchboxService) {
    $scope.isLoggedIn = function() {
      return userService.isLoggedIn;
    };
    $scope.doc = {
      images: [],
      metadata: {}
    };
    if ($routeParams.id !== "") {
      matchboxService.get($routeParams.id).then(function(doc) {
        $scope.doc = doc.data;
      });
    }

    $scope.editMatchbox = function(imgId) {
      $location.path('/edit/' + imgId);
    };

    $scope.deleteMatchbox = function(imgId) {
      if (confirm('Do you really want to delete this matchbox')) {
        matchboxService.delete(imgId);
      }
    };

    $scope.duplicateMatchbox = function(matchbox) {
      delete matchbox.id;
      matchboxService.create(matchbox).then(function(data) {
        $location.path('/edit/' + data.data.id);
      });
    };
  }]);
