describe('Thumbnail Generator', function() {
  var createTestImage = function(cb) {
    var cnv = document.createElement('canvas');
    cnv.width = 1024;
    cnv.height = 1024;
    return cnv.toBlob(cb);
  };

  beforeEach(function(done) {
    module('matchboxarchive');
    inject(['$rootScope', 'thumbGenerator', function($rootScope, thumbGenerator) {
      this.thumbGenerator = thumbGenerator;
      this.$rootScope = $rootScope;
      done();
    }.bind(this)]);
  });

  it('should be be a function', function() {
    expect(this.thumbGenerator).toEqual(jasmine.any(Function));
  });

  it('should change the dimensions of an image url', function(done) {
    this.thumbGenerator({image: '/base/fixtures/image.gif'})
    .then(function(img) {
      expect(img.width).not.toBe(1024);
      expect(img.height).not.toBe(1024);
      done();
    }, function(error) {
      console.log(error);
      throw new Error(error);
      done();
    }.bind(this));
    this.$rootScope.$digest();
  });
});
