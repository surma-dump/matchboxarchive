window.angular.module('matchboxarchive')
.factory('helper', [function() {
    return {
        httpPromiseResolver: function(data) {
            return {
                error: data.status != 200,
                data: data.data
            };
        }
    };
}]);
