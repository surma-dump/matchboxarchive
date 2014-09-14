describe('Values Service', function() {
  var $httpBackend, $rootScope, valuesService;

  var obj = {
    id: 'someId',
    name: 'someField',
    values: ['v1', 'v2', 'v3']
  };

  beforeEach(module('matchboxarchive'));
  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
    $httpBackend = $injector.get('$httpBackend');
    valuesService = $injector.get('valuesService');
  }));

  it('should return the received values', function(done) {
    $httpBackend.expectGET('/values?name='+obj.name).respond(200, [obj]);
    var req = valuesService.get(obj.name);
    req.then(function(result) {
      expect(result).toEqual(obj);
      done();
    });
    $httpBackend.flush();
  })

  it('should cache the received values', function(done) {
      $httpBackend.expectGET('/values?name='+obj.name).respond(200, [obj]);
      valuesService.get(obj.name);
      $httpBackend.flush();

      var req = valuesService.get('someField');
      req.then(function(result) {
        expect(result).toEqual(obj);
        done();
      });
      $rootScope.$apply();
  });

  it('should create new entries for new fields', function() {
      $httpBackend.expectGET('/values?name='+obj.name).respond(200, []);
      $httpBackend.expectPOST('/values', {
        name: 'someField',
        values: ['someValue'],
      }).respond(200, '');
      valuesService.add('someField', 'someValue');
      $httpBackend.flush();
  });

  it('should append the values to the array for an existing field', function() {
      $httpBackend.expectGET('/values?name='+obj.name).respond(200, [obj]);
      $httpBackend.expectPUT('/values/'+obj.id, {
        id: obj.id,
        name: 'someField',
        values: ['v1', 'v2', 'v3', 'v4'],
      }).respond(200, '');
      valuesService.add('someField', 'v4');
      $httpBackend.flush();
  });

  afterEach(function() {
    valuesService.resetCache();
  })
});
