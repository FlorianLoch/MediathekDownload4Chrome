module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        mangle: true
      },
      popup: {
        dest: 'dist/md4c.popup.min.js',
        src: [
          'bower_components/jquery/dist/jquery.min.js', 
          'bower_components/angular/angular.min.js',
          "bower_components/angular-animate/angular-animate.min.js",
          "bower_components/bootstrap/js/dropdown.js",
          "js/popup.js"
        ]
      },
      background: {
        dest: 'dist/md4c.bg.min.js',
        src: [
          "js/background.js",
          "js/mediathekCore.js",
          "js/mediathekHandler/*"
        ]
      }
    },
    copy: {
      bootstrap: {
        src: "bower_components/bootstrap/dist/css/bootstrap.min.css", 
        dest: 'dist/bs.min.css',
      },
      images: {
        src: "images/*",
        dest: "dist/"
      },
      manifest: {
        src: 'manifest.json',
        dest: 'dist/manifest.json',
        options: {
          process: function (content) {
            var d = JSON.parse(content);
            d.background.scripts = ['md4c.bg.min.js'];
            return JSON.stringify(d);
          }
        }
      },
      popup: {
        src: "popup.html",
        dest: "dist/popup.html",
        options: {
          process: function (content) {
            return content.replace(/<!-- START OF INCLUDES -->[\s\S]*<!-- END OF INCLUDES -->/, "<script type=\"text/javascript\" src=\"md4c.popup.min.js\"></script><link rel=\"stylesheet\" type=\"text/css\" href=\"bs.min.css\">");
          }
        }
      }      
    },
    removeDir: {
      dist: {
        src: "dist"
      }
    },
    crx: {
      outputPackage: {
        "src": "dist/",
        "dest": "./",
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerMultiTask("removeDir", "Removes a directory", function () {
    var rimraf = require('rimraf');
    rimraf.sync(this.data.src);
  });

  grunt.registerTask('build', ['removeDir', 'uglify', 'copy']);
};  