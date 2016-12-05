var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var nodemon = require('gulp-nodemon');
var sourcemaps = require('gulp-sourcemaps');

// Compile LESS files from /less into /css
gulp.task('less', function () {
    return gulp.src('public/less/sb-admin-2.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function () {
    return gulp.src('public/dist/css/sb-admin-2.css')
        .pipe(sourcemaps.init())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Copy JS to dist
gulp.task('js', function () {
    return gulp.src(['public/js/*.js'])
        .pipe(gulp.dest('public/dist/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', ['js'], function () {
    return gulp.src('public/js/*.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/dist/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Copy vendor libraries from /bower_components into /vendor
gulp.task('copy', function () {
    gulp.src(['bower_components/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('vendor/bootstrap'));

    gulp.src(['bower_components/bootstrap-social/*.css', 'bower_components/bootstrap-social/*.less', 'bower_components/bootstrap-social/*.scss'])
        .pipe(gulp.dest('vendor/bootstrap-social'));

    gulp.src(['bower_components/datatables/media/**/*'])
        .pipe(gulp.dest('vendor/datatables'));

    gulp.src(['bower_components/datatables-plugins/integration/bootstrap/3/*'])
        .pipe(gulp.dest('vendor/datatables-plugins'));

    gulp.src(['bower_components/datatables-responsive/css/*', 'bower_components/datatables-responsive/js/*'])
        .pipe(gulp.dest('vendor/datatables-responsive'));

    gulp.src(['bower_components/flot/*.js'])
        .pipe(gulp.dest('vendor/flot'));

    gulp.src(['bower_components/flot.tooltip/js/*.js'])
        .pipe(gulp.dest('vendor/flot-tooltip'));

    gulp.src(['bower_components/font-awesome/**/*', '!bower_components/font-awesome/*.json', '!bower_components/font-awesome/.*'])
        .pipe(gulp.dest('vendor/font-awesome'));

    gulp.src(['bower_components/jquery/dist/jquery.js', 'bower_components/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('vendor/jquery'));

    gulp.src(['bower_components/metisMenu/dist/*'])
        .pipe(gulp.dest('vendor/metisMenu'));

    gulp.src(['bower_components/morrisjs/*.js', 'bower_components/morrisjs/*.css', '!bower_components/morrisjs/Gruntfile.js'])
        .pipe(gulp.dest('vendor/morrisjs'));

    gulp.src(['bower_components/raphael/raphael.js', 'bower_components/raphael/raphael.min.js'])
        .pipe(gulp.dest('vendor/raphael'));

});

// Run everything
gulp.task('default', ['minify-css', 'minify-js', 'watch']);

// Run server with nodemon
gulp.task('nodemon', ['default', 'watch'], function () {
    nodemon({
        script: './bin/www',
        ext: 'js',
        ignore: ["public/js", "public/dist/js"],
        env: {
            'NODE_ENV': 'development'
        }
    })
        .on('start', function () {
            console.log('start!');
        })
        .on('change', function () {
            console.log('change!');
        })
        .on('restart', function () {
            console.log('restarted!');
        });
});

gulp.task('watch', function () {
    gulp.watch('public/less/*.less', ['less']);
    gulp.watch('public/dist/css/*.css', ['minify-css']);
    gulp.watch('public/js/*.js', ['minify-js']);
});
