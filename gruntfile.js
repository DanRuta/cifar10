module.exports = function(grunt){
    grunt.initConfig({
        babel: {
            options: {
                presets: ["es2015", "stage-3"],
            },
            dist: {
                options: {
                    sourceMap: true
                },
                files: {
                    "dist/cifar10.js": ["dev/cifar10.js"],
                    "dist/cifar10-server.js": ["dev/cifar10-server.js"],
                    "dist/cifar10-client.es5.js": ["dev/cifar10-client.js"]
                }
            }
        },

        uglify: {
            my_target: {
                options: {
                    sourceMap: {
                        includeSources: true
                    }
                },
                files: {
                    "dist/cifar10.min.js" : ["dist/cifar10.es5.js"],
                    "dist/cifar10-client.min.js" : ["dist/cifar10-client.es5.js"]
                }
            }            
        },

        watch: {
            scripts: {
                files: ["dev/*.js"],
                tasks: ["build"]
            }
        }
    })

    grunt.loadNpmTasks("grunt-babel")
    grunt.loadNpmTasks("grunt-contrib-watch")
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.registerTask("default", ["watch"])
    grunt.registerTask("build", ["babel", "uglify"])
}