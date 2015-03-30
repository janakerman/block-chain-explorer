'use strict';

module.exports = function(grunt) {
  
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		paths: {
			jsSrc: [
		       'app/app.js'
		    ],
		    jsDest: 'app/script.js',
		},

		clean: {
			scriptMap: ['app/script.js.map']
		},

		uglify: {
			development: {
				options: {
					sourceMap: true,
		    		sourceMapIncludeSources: true	
				},
				files: {
					'<%= paths.jsDest %>': '<%= paths.jsSrc %>'
				}
			},
			production: {
				options: {
					mangle: true,
		    		compress: {}	
				},
				files: {
					'<%= paths.jsDest %>': '<%= paths.jsSrc %>'
				}
			}    
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('build', ['scripts']);
	grunt.registerTask('scripts', ['clean:scriptMap', 'uglify:production']);

	grunt.registerTask('build:dev', ['scripts:dev']);
	grunt.registerTask('scripts:dev', ['uglify:development']);

	grunt.registerTask('default', ['build']);
};

