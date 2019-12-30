/**
 * Create by Checkson on 2019-12-03
 * Gulp Settings
 */
// import dependencies
const { src, dest, parallel, watch } = require('gulp');
const notify = require('gulp-notify');
const livereload = require('gulp-livereload');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const connect = require('gulp-connect');

// uglify JavaScript task
const uglifyJsTask = () => {
  return src(['src/*.js', 'src/**/*.js'])
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest('dist/'))
    .pipe(connect.reload())
    .pipe(notify({
      message: 'Uglify JavaScript task has finished!'
    }));
};

// parse sass and minify css
const parseSassAndMinifyCssTask = () => {
  return src('src/**/*.scss')
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(rename({ extname: '.min.css' }))
    .pipe(dest('dist'))
    .pipe(connect.reload())
    .pipe(notify({
      message: 'Parse scss and minify css task has finished!'
    }));
};

// start web server task
const startWebServerTask = (cb) => {
  connect.server({
    port: 8080,
    livereload: true
  });
  cb();
};

// watch task
const watchTask = (cb) => {
  watch('src/**/*.scss', parseSassAndMinifyCssTask);
  watch(['src/*.js', 'src/**/*.js'], uglifyJsTask);
  livereload.listen();
  watch(['dist/**', 'themes/**']).on('change', livereload.changed);
  startWebServerTask(cb);
  cb();
};

// default task
const defaultTask = parallel(uglifyJsTask, parseSassAndMinifyCssTask);

// export watch task
exports.watch = watchTask;

// export default task
exports.default = defaultTask;
