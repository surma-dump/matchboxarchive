window.angular.module('matchboxarchive')
.factory('matchboxService', ['$http', '$q', 'helper', function($http, $q, helper) {
    return {
        save: function(doc) {
            if(doc.id) {
                return this.update(doc.id, doc);
            }
            return this.create(doc);
        },
        create: function(doc) {
            return $http({
                url: '/matchboxes',
                method: 'POST',
                data: doc,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(helper.httpPromiseResolver);
        },
        update: function(id, doc) {
            return $http({
                url: '/matchboxes/'+id,
                method: 'PUT',
                data: doc,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(helper.httpPromiseResolver);
        },
        get: function(id) {
            return $http({
                url: '/matchboxes/'+id,
                method: 'GET',
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
        }
    };
}]);
