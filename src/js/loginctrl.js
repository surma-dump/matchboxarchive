window.angular.module('matchboxarchive')
.controller('loginctrl', ['$scope', '$location', 'userService', 'rolloutService', function($scope, $location, userService, rolloutService) {
    rolloutService.rollOut();
    $scope.location = $location;
    $scope.isLoggedIn = function() {
      return userService.isLoggedIn;
    };
    $scope.login = function() {
      userService.login($scope.username, $scope.password);
    };
    $scope.logout = function() {
      userService.logout();
    };
  }]);
