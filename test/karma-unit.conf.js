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

      'test/unit/**/*.js'
    ]
  });
};
