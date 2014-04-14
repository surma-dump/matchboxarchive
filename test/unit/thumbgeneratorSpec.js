describe('Thumbnail Generator', function() {
  var $rootScope;
  var fixtureURL = '/base/fixtures/image.gif';
  var createTestImage = function(cb) {
    var cnv = document.createElement('canvas');
    cnv.width = 1024;
    cnv.height = 1024;
    return cnv.toBlob(cb);
  };

  var parseImage = function(imgBlob, cb) {
    var img = document.createElement('img');
    img.onload = cb.bind(img, img);
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(imgBlob);
    img.src = imageUrl;
  };

  beforeEach(module('matchboxarchive'));
  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
  }));

  it('should be be a function', inject(function(thumbGenerator) {
    expect(thumbGenerator).toEqual(jasmine.any(Function));
  }));

  it('should work with an image url', function(done) {
    inject(function(thumbGenerator) {
      thumbGenerator({
        image: fixtureURL
      }).then(function(imgBlob) {
        parseImage(imgBlob, function(img) {
          expect(img.width).not.toBe(1024);
          expect(img.height).not.toBe(1024);
          done();
        });
      }, function(error) {
        throw new Error(error);
      });
      $rootScope.$digest();
    });
  });

  it('should work with a file', function(done) {
    inject(function(thumbGenerator) {
      createTestImage(function(imgBlob) {
        thumbGenerator({
          image: imgBlob
        }).then(function(imgBlob) {
          parseImage(imgBlob, function(img) {
            expect(img.width).not.toBe(1024);
            expect(img.height).not.toBe(1024);
            done();
          });
        }, function(error) {
          throw new Error(error);
        });
        $rootScope.$digest();
      });
    });
  });

  it('should yield an image with the given size', function(done) {
    inject(function(thumbGenerator) {
      thumbGenerator({
        image: fixtureURL,
        maxWidth: 250,
        maxHeight: 250
      }).then(function(imgBlob) {
        parseImage(imgBlob, function(img) {
          expect(img.width).toBe(250);
          expect(img.height).toBe(250);
          done();
        });
      }, function(error) {
        throw new Error(error);
      });
      $rootScope.$digest();
    });
  });
});
