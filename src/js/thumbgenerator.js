window.angular.module('matchboxarchive')
.factory('thumbGenerator', ['$q', '$rootScope', function($q, $rootScope) {
    var defaultValues = function(opts) {
      opts.maxWidth = opts.maxWidth || 200;
      opts.maxHeight = opts.maxHeight || 200;
      return opts;
    };

    var resizeImage = function(img, opts) {
      var cnv = document.createElement('canvas');
      var ctx = cnv.getContext('2d');
      var dstRatio = opts.maxWidth / opts.maxHeight;
      var srcRatio = img.width / img.height;

      if (srcRatio > dstRatio) {
        cnv.width = opts.maxWidth
        cnv.height = opts.maxWidth / srcRatio;
      } else {
        cnv.height = opts.maxHeight;
        cnv.width = opts.maxHeight * srcRatio;
      }

      ctx.drawImage(img, 0, 0, cnv.width, cnv.height);

      var deferred = $q.defer();
      cnv.toBlob(function(blob) {
        deferred.resolve(blob);
      }, "image/png");
      return deferred.promise;
    };

    return function(opts) {
      opts = defaultValues(opts);
      var img = document.createElement('img');
      var deferred = $q.defer();
      img.onload = function() {
        deferred.resolve(resizeImage(img, opts));
        $rootScope.$apply();
      };
      img.onerror = function() {
        deferred.reject('Could not load image');
        $rootScope.$apply();
      };

      if (typeof opts.image === 'string') {
        img.crossOrigin = 'anonymous';
        img.src = opts.image;
      } else if (opts.image instanceof Blob) {
        var fr = new FileReader();
        fr.onloadend = function() {
          img.src = fr.result;
        };
        fr.readAsDataURL(opts.image);
      } else {
        deferred.reject('Invalid image type');
      }

      return deferred.promise;
    };
  }]);
