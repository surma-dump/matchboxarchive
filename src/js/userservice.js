window.angular.module('matchboxarchive')
.factory('userService', ['$http', function($http) {
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
                return userService.isLoggedIn;
            });
        }
    };

    userService.refreshState();
    return userService;
}]);
