window.angular.module('matchboxarchive')
.factory('rolloutService', [function() {
    var drawer = document.getElementById('drawer');
    return {
      rollOut: function() {
        drawer.className = 'show';
      },
      rollIn: function() {
        drawer.className = '';
      }
    };
  }]);
