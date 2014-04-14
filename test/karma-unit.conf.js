module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['jasmine'],
    reporters: ['progress'],
    browsers: ['PhantomJS'],
    autoWatch: false,

    // these are default values anyway
    singleRun: true,
    colors: true,

    files : [
      'bower_components/lodash/dist/lodash.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/blueimp-canvas-to-blob/js/canvas-to-blob.js',

      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/bind-polyfill/index.js',

      'src/js/matchboxarchive.js',
      'src/js/helper.js',
      'src/js/thumbgenerator.js',
      'src/js/userservice.js',
      'src/js/rolloutservice.js',
      'src/js/matchboxservice.js',
      'src/js/detailsctrl.js',
      'src/js/loginctrl.js',
      'src/js/metadatactrl.js',
      'src/js/searchctrl.js',

      'test/unit/**/*.js',

      {
        pattern: 'fixtures/**/*',
        included: false,
        served: true
      }
    ]
  });
};
