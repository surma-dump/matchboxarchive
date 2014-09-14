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
                if(data.data.length <= 0) {
                    return null;
                }

                var deferred = $q.defer();
                deferred.resolve(data.data[0]);
                cache[field] = deferred.promise;
                return deferred.promise;
            });
        },
        add: function(field, value) {
            var p = cache[field];
            if(!cache[field]) {
                p = this.get(field);
            }
            return p.then(function(doc) {
                if(!doc) {
                    return $http({
                        url: '/values',
                        method: 'POST',
                        data: {
                            name: field,
                            values: [value]
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(helper.httpPromiseResolver)
                    .then(function(doc) {
                        var deferred = $q.defer();
                        deferred.resolve(doc);
                        cache[field] = deferred.promise;
                        return deferred.promise
                    });
                }

                doc.values.push(value);
                doc.values = _(doc.values).uniq().value();

                var deferred = $q.defer();
                deferred.resolve(doc);
                cache[field] = deferred.promise;

                return $http({
                    url: '/values/'+doc.id,
                    method: 'PUT',
                    data: doc,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(helper.httpPromiseResolver);
            });
        },
        resetCache: function() {
            cache = {};
        }
    };
}]);
