window.angular.module('matchboxarchive', ['ngRoute'])
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
    });
}])
.value('CONFIG', {
    s3Endpoint: '/bucket/',
    infiniteScrollLoad: 20,
    infiniteScrollPoll: 200,
    thumbSize: 150,
});
