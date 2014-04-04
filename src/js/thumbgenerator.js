window.angular.module('matchboxarchive')
.factory('thumbGenerator', ['$q', function($q) {
    var defaultValues = function(opts) {
        opts.maxWidth = opts.maxWidth || 200;
        opts.maxHeight = opts.maxHeight || 200;
        return opts;
    };
    var resizeImage = function(img, opts) {
        var cnv = document.createElement('canvas');
        var ctx = cnv.getContext('2d');
        cnv.width = opts.maxWidth;
        cnv.height = opts.maxHeight;

        ctx.drawImage(img, 0, 0, opts.maxWidth, opts.maxHeight);

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
        img.addEventListener('load', function() {
            deferred.resolve(resizeImage(img, opts));
        });

        if(typeof opts.image === 'string') {
            img.crossOrigin = 'anonymous';
            img.src = opts.image;
        }
        else if(opts.image instanceof File) {
            var fr = new FileReader();
            fr.addEventListener('loadend', function() {
                img.src = fr.result;
            });
            fr.readAsDataURL(opts.image);
        } else {
            deferred.reject('Invalid image type');
        }

        return deferred.promise;
    };
}]);
