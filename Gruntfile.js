module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        sass: {
            options: {
                includePaths: ['bower_components/foundation/scss']
            },
            dist: {
                options: {
                    outputStyle: 'extended'
                },
                files: {
                    'dist/css/app.css': 'src/scss/app.scss'
                }
            }
        },

        watch: {

            all: {
                files: 'dist/*.html'
            },

            grunt: { files: ['Gruntfile.js'] },

            sass: {
                files: 'src/scss/**/*.scss',
                tasks: ['sass']
            },

            scripts: {
                files: ['src/js/**/*.js'],
                tasks: ['copy']
            },

            output_twig: {
                files: ['src/twig/**/*.html.twig'],
                tasks: ['output_twig']
            }

        },

        output_twig: {
            settings: {
                options: {
                    docroot: 'src/twig/'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src/twig/',
                        src: ['**/*.html.twig', '!_**/*', '!**/_*', '!_*', '!partials/*'],
                        dest: 'dist/',
                        ext: '.html'
                    }
                ]
            }
        },

        express: {
            all: {
                options: {
                    port: 9000,
                    hostname: "0.0.0.0",
                    bases: ['dist/']
                }
            }
        },

        open: {
            all: {
                // Gets the port from the connect configuration
                path: 'http://localhost:<%= express.all.options.port%>'
            }
        },

        copy: {
            main: {
                files: [
                    {
                        src: 'bower_components/requirejs/require.js',
                        dest: 'dist/js/require.js',
                        filter: 'isFile'
                    },
                    {
                        src: ['bower_components/jquery/dist/jquery.js'],
                        dest: 'dist/js/jquery.js',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'src/js',
                        src: '**/*',
                        dest: 'dist/js'
                    }
                ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-output-twig');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('server', ['express','open','watch']);
    grunt.registerTask('javascript', ['copy']);
    grunt.registerTask('twig', ['output_twig']);
    grunt.registerTask('build', ['sass', 'javascript', 'twig']);
    grunt.registerTask('default', ['express','open','build','watch','output_twig']);

};