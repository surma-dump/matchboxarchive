window.angular.module('matchboxarchive')
.controller('searchctrl', ['$scope', '$interval', '$location', 'matchboxService', 'rolloutService', 'userService', 'CONFIG', function($scope, $interval, $location, matchboxService, rolloutService, userService, CONFIG) {
    $scope.results = [];
    $scope.page = 0;
    $scope.hasMore = true;
    $scope.isLoading = false;

    $scope.isLoggedIn = function() {
        return userService.isLoggedIn;
    };

    $scope.query = {
        'visible': true,
    };

    $interval(function poll() {
        if(!$scope.hasMore || $scope.isLoading) {
            return;
        }

        var offset = document.querySelector('.load-trigger').getClientRects()[0].top - window.innerHeight;
        if(offset < 10) {
            $scope.isLoading = true;
            var pagedQuery = $scope.query;
            pagedQuery['$skip'] = $scope.page*CONFIG.infiniteScrollLoad;
            pagedQuery['$limit'] = CONFIG.infiniteScrollLoad;
            matchboxService.query(pagedQuery).then(function(data) {
                $scope.page += 1;
                $scope.hasMore = data.data.length == CONFIG.infiniteScrollLoad;
                for(var i in data.data) {
                    $scope.results.push(data.data[i]);
                }
                $scope.isLoading = false;
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
}]);
