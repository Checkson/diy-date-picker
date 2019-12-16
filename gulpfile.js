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
const minify = require('gulp-minify-css');
const connect = require('gulp-connect');

// uglify JavaScript task
const uglifyJsTask = () => {
  return src('src/*.js')
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest('dist/'))
    .pipe(connect.reload())
    .pipe(notify({
      message: 'Uglify JavaScript task has finished!'
    }));
};

// uglify locale task
const uglifyLocaleTask = () => {
  return src('src/locale/*.js')
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest('dist/locale/'))
    .pipe(connect.reload())
    .pipe(notify({
      message: 'Uglify locale task has finished!'
    }));
};

// parse sass and minify css
const parseSassAndMinifyCssTask = () => {
  return src('src/scss/*.scss')
    .pipe(sass())
    .pipe(minify())
    .pipe(rename({ extname: '.min.css' }))
    .pipe(dest('theme'))
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
  watch('src/scss/*.scss', parseSassAndMinifyCssTask);
  watch(['src/*.js'], uglifyJsTask);
  watch(['src/locale/*.js'], uglifyLocaleTask);
  livereload.listen();
  watch(['dist/**', 'theme/**']).on('change', livereload.changed);
  startWebServerTask(cb);
  cb();
};

// default task
const defaultTask = parallel(uglifyJsTask, parseSassAndMinifyCssTask, uglifyLocaleTask);

// export watch task
exports.watch = watchTask;

// export default task
exports.default = defaultTask;
