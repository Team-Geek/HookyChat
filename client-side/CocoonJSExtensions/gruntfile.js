(function() {
  'use strict';

  module.exports = function(grunt) {

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      concat: {
        options: {
          separator: ';',
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> www.ludei.com */'
        },
        dist: {
          files: {
            'build/cocoon.js': [
            'src/CocoonJS.js',
            'src/CocoonJS_App.js',
            'src/CocoonJS_App_ForCocoonJS.js',
            'src/CocoonJS_App_ForWebView.js',
            'src/CocoonJS_Ad.js',
            'src/CocoonJS_Social.js',
            'src/CocoonJS_Social_GameCenter.js',
            'src/CocoonJS_Social_GooglePlayGames.js',
            'src/CocoonJS_Social_Manager.js',
            'src/CocoonJS_Social_Facebook.js',
            'src/CocoonJS_Social_LocalStorage.js',
            'src/CocoonJS_Multiplayer.js',
            'src/CocoonJS_Multiplayer_GameCenter.js',
            'src/CocoonJS_Multiplayer_Loopback.js',
            'src/CocoonJS_Multiplayer_GooglePlayGames.js',
            'src/CocoonJS_Store.js',
            'src/CocoonJS_Camera.js',
            'src/CocoonJS_Gamepad.js',
            'src/CocoonJS_Notification.js'
             ]
          }
        }
      },
      uglify: {
        options: {
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> www.ludei.com */'
        },
        dist: {
          files: {
            'build/cocoon.min.js': ['build/cocoon.js'],
            'build/cocoon_box2d.min.js': ['src/box2d_cocoonJS.js']
          }
        }
      }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify']);

  };
}());
