var app = angular.module ('matchbox_app', ['ui.bootstrap']);
app.controller('ButtonsCtrl', function ($scope) {
  $scope.singleModel = 1;
  $scope.openDetails = function(){
  	$scope.in = !$scope.in; 
  }
}); 
