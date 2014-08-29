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
    metafields: [
        {
            name: "country",
            type: "text",
            placeholder: "Country"
        },
        {
            name: "year",
            type: "number",
            placeholder: "Year",
            minimum: 1200,
            step: 1,
            maximum: 2100,
        },
        {
            name: "width",
            type: "number",
            placeholder: "Width",
            minimum: 0,
            step: 0.1
        },
        {
            name: "height",
            type: "number",
            placeholder: "Height",
            minimum: 0,
            step: 0.1
        },
        {
            name: "depth",
            type: "number",
            placeholder: "Depth",
            minimum: 0,
            step: 0.1
        }
    ]
});
