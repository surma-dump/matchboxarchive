window.angular.module('matchboxarchive')
.factory('valuesService', ['$http', '$q', 'helper', function($http, $q, helper) {
    var cache = {};
    return {
        get: function(field) {
            if(cache[field]) {
                return cache[field];
            }
            return $http({
                url: '/values?name='+field,
                method: 'GET',
            })
            .then(helper.httpPromiseResolver)
            .then(function(data) {
                var deferred = $q.defer();
                if(data.data.length <= 0) {
                    return null;
                }
                deferred.resolve(data.data[0]);
                cache[field] = deferred.promise;
                return deferred.promise;
            });
        },
        add: function(field, value) {
            if(!cache[field]) {
                cache[field] = [];
            }
            cache[field].push(value)
            cache[field] = _(cache[field]).uniq();
            return $http({
                url: '/values/'+cache[field].id,
                method: 'PUT',
                data: cache[field],
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(helper.httpPromiseResolver);
        },
        delete: function(id) {
            return $http({
                url: '/matchboxes/'+id,
                method: 'DELETE',
            }).then(helper.httpPromiseResolver);
        },
        query: function(qry) {
            return $http({
                url: '/matchboxes?'+JSON.stringify(qry),
                method: 'GET',
            }).then(helper.httpPromiseResolver);
        },
    };
}]);
