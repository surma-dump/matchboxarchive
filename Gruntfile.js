module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      js: {
        src: [
          'bower_components/lodash/dist/lodash.js',
          'bower_components/blueimp-canvas-to-blob/js/canvas-to-blob.js',
          'bower_components/angular/angular.js',
          'bower_components/angular-route/angular-route.js',
          'src/js/matchboxarchive.js',
          'src/js/helper.js',
          'src/js/thumbgenerator.js',
          'src/js/userservice.js',
          'src/js/rolloutservice.js',
          'src/js/matchboxservice.js',
          'src/js/detailsctrl.js',
          'src/js/loginctrl.js',
          'src/js/metadatactrl.js',
          'src/js/searchctrl.js'
        ],
        dest: '.tmp/concat/js/main.js'
      },
      css: {
        src: [
            '.tmp/compass/css/*',
            'src/css/*'
        ],
        dest: '.tmp/concat/css/style.css'
      }
    },

    compass: {
        css: {
            options: {
                sassDir: 'src/sass',
                css: '.tmp/compass/css'
            }
        }
    },

    uglify: {
      options: {},
      js: {
        files: [
          {
            expand: true,
            cwd: '.tmp/concat/js/',
            src: '**/*.js',
            dest: '.tmp/uglify'
          }
        ]
      }
    },

    cssmin: {
      options: {},
      css: {
        files: [
          {
            expand: true,
            cwd: '.tmp/concat/css',
            src: '**/*.css',
            dest: '.tmp/cssmin'
        }
        ]
      }
    },

    copy: {
      html: {
        files: [
          {
            expand: true,
            cwd: 'src',
            src: '**/*.html',
            dest: 'public/'
          }
        ]
      },
      tmpjs: {
        files: [
          {
            expand: true,
            cwd: '.tmp/concat/js',
            src: '**/*.js',
            dest: 'public/js'
          }
        ]
      },
      js: {
        files: [
          {
            expand: true,
            cwd: '.tmp/uglify',
            src: '**/*.js',
            dest: 'public/js'
          }
        ]
      },
      css: {
        files: [
          {
            expand: true,
            cwd: '.tmp/cssmin',
            src: '**/*.css',
            dest: 'public/css'
          }
        ]
      },
      tmpcss: {
        files: [
          {
            expand: true,
            cwd: '.tmp/concat/css',
            src: '**/*.css',
            dest: 'public/css'
          }
        ]
      }
    },

    watch: {
      scripts: {
        files: ['src/**'],
        tasks: ['dev-build'],
        atBegin: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-compass');

  grunt.registerTask('build', ['compass', 'concat', 'uglify', 'cssmin', 'copy:html', 'copy:css', 'copy:js']);
  grunt.registerTask('dev-build', ['compass', 'concat', 'copy:html', 'copy:tmpcss', 'copy:tmpjs']);
  grunt.registerTask('heroku', ['build']);
  grunt.registerTask('default', ['build']);
};
