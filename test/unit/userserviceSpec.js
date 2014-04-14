describe('User Service', function() {
  var $httpBackend;

  beforeEach(module('matchboxarchive'));
  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/users/me').respond(404, '');
  }));

  it('should have a login state', inject(function(userService) {
    expect(userService.isLoggedIn).toEqual(jasmine.any(Boolean));
  }));

  it('should have a login function', inject(function(userService) {
    expect(userService.login).toEqual(jasmine.any(Function));
  }));

  it('should have a logout function', inject(function(userService) {
    expect(userService.logout).toEqual(jasmine.any(Function));
  }));

  it('should have a refreshState function', inject(function(userService) {
    expect(userService.refreshState).toEqual(jasmine.any(Function));
  }));

  it('should reflect the current login state', inject(function(userService) {
    $httpBackend.expectGET('/users/me').respond(404, '');
    userService.refreshState();
    $httpBackend.flush();
    expect(userService.isLoggedIn).toBe(false);

    $httpBackend.expectGET('/users/me').respond(200, '');
    userService.refreshState();
    $httpBackend.flush();
    expect(userService.isLoggedIn).toBe(true);
  }));
});
