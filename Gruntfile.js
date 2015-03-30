'use strict';

module.exports = function(grunt) {
  
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		paths: {
			jsSrc: [
		        'app/app.js',
		        'app/masterPage/masterPage.js',
		        'app/services/services.js',
		        'app/blockDetail/blockDetail.js',
		        'app/d3/d3.js',
		        'app/components/version/version.js',
  				'app/components/version/version-directive.js',
  				'app/components/version/interpolate-filter.js',
  				'app/bower_components/angular-route/angular-route.js'
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

