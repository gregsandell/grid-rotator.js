//Gruntfile
module.exports = function(grunt) {

  //Initializing the configuration object
  grunt.initConfig({
    watch: {
      files: ["**/*.js", "mocha.html"],
      options: {
        livereload: true
      }
    }
  });

  // Plugin loading
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Task definition
  grunt.registerTask('default', ['watch']);
};