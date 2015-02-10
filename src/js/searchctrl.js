window.angular.module('matchboxarchive')
.controller('searchctrl', ['$scope', '$interval', '$location', 'matchboxService', 'valuesService', 'rolloutService', 'userService', 'CONFIG', function($scope, $interval, $location, matchboxService, valuesService, rolloutService, userService, CONFIG) {
    $scope.results = [];
    $scope.page = 0;
    $scope.hasMore = true;
    $scope.isLoading = false;
    $scope.metafields = CONFIG.metafields;
    $scope.optionsCache = {};
    $scope.query = {
      'visible': true,
    };
    $scope.queryData = {};

    CONFIG.metafields.forEach(function(metafield) {
      switch(metafield.type) {
        case "range":
          $scope.queryData['min_'+metafield.name] = metafield.minimum;
          $scope.queryData['max_'+metafield.name] = metafield.maximum;
          break;
      }
      valuesService
      .get(metafield.name)
      .then(function(vals) {
        $scope.optionsCache[metafield.name] = vals;
      });
    });

    $scope.isLoggedIn = function() {
      return userService.isLoggedIn;
    };

    $interval(function poll() {
      if (!$scope.hasMore || $scope.isLoading) {
        return;
      }

      var offset = document.querySelector('.load-trigger').getClientRects()[0].top - window.innerHeight;
      if (offset < 10) {
        $scope.isLoading = true;
        var pagedQuery = $scope.query;
        pagedQuery['$skip'] = $scope.page * CONFIG.infiniteScrollLoad;
        pagedQuery['$limit'] = CONFIG.infiniteScrollLoad;
        matchboxService.query(pagedQuery).then(function(data) {
          $scope.page += 1;
          $scope.hasMore = data.data.length == CONFIG.infiniteScrollLoad;
          for (var i in data.data) {
            $scope.results.push(data.data[i]);
          }
          $scope.isLoading = false;
        })
        return;
      }
    }, CONFIG.infiniteScrollPoll);


    function queryGenerator(queryData) {
      var query = {};

      $scope.metafields.forEach(function(metafield) {
        switch (metafield.type) {
          case 'text':
            if (queryData[metafield.name]) {
              query['metadata.' + metafield.name] = queryData[metafield.name];
            }
            break;
          case 'number':
            if (queryData['min_' + metafield.name]) {
              query['metadata.' + metafield.name] = angular.extend(query['metadata.' + metafield.name] || {}, {
                '$gte': queryData['min_' + metafield.name]
              });
            }
            if (queryData['max_' + metafield.name]) {
              query['metadata.' + metafield.name] = angular.extend(query['metadata.' + metafield.name] || {}, {
                '$lte': queryData['max_' + metafield.name]
              });
            }
            break;
        }
      });

      return query;
    }
    ;

    $scope.newSearch = function() {
      $scope.query = queryGenerator($scope.queryData);

      if (!($scope.isLoggedIn() && ($scope.queryData.showHidden))) {
        $scope.query['visible'] = true;
      }

      $scope.page = 0;
      $scope.hasMore = true;
      $scope.results = [];
    };

    $scope.showDetails = function(imgId) {
      rolloutService.rollOut();
      $location.path('/details/' + imgId);
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
