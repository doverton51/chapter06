'use strict'

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const env = require('gulp-env');
const eslint = require('gulp-eslint');
const istanbul = require('gulp-istanbul');
const shell = require('gulp-shell');

gulp.task('instrument', function() {
    return gulp.src(['src/**/*.js'])
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire());
});

gulp.task('lint-server', function() {
    return gulp.src(['src/**/*.js', '!src/public/**/*.js'])
        .pipe(eslint({
            envs: ['es6', 'node'],
            rules: {
                'no-unused-vars': [2, {'argsIgnorePattern': 'next'}]
            }
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('lint-client', function() {
    return gulp.src('src/public/**/*.js')
        .pipe(eslint({
            envs: ['browser', 'jquery']
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('lint-test', function() {
    return gulp.src('test/**/*.js')
        .pipe(eslint({
            envs: ['es6', 'node', 'mocha'],
            rules: {
                'no-console': 0
            }
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('lint-integrationtest', function() {
    return gulp.src('integration-test/**/*.js')
        .pipe(eslint({
            envs: ['browser', 'phantomjs', 'jquery'],
            rules: {
                'no-console': 0
            }
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test', ['instrument'], function() {
    env({ vars: { 
        NODE_ENV: 'test'
    }});

    return gulp.src('test/**/*.js')
    .pipe(mocha())
    .pipe(istanbul.writeReports());
});

gulp.task('lint', ['lint-server', 'lint-client', 
                    'lint-test', 'lint-integrationtest']);

gulp.task('integration-test', ['lint-integrationtest'], (done) => {
    const TEST_PORT=5000;

    require('./src/config/mongoose.js').then((mongoose) => {
        var d = (err) => {
            console.log("DONE: " + err);
            if(err) {
                done(err)
            } else {
                done();
            }
        }
        let server, teardown = (error) => {
            server.close(() => mongoose.disconnect(() => d(error)));
        };

        server = require('http')
            .createServer(require('./src/app.js')(mongoose))
            .listen(TEST_PORT, function () {
                gulp.src('integration-test/**/*.js')
                .pipe(shell('node node_modules/phantomjs-prebuilt/bin/phantomjs <%=file.path%>', {
                    env: {'TEST_PORT': TEST_PORT}
                }))
                .on('error', teardown)
                .on('end', teardown)
            });
    })
});

gulp.task('default', ['lint', 'test']);