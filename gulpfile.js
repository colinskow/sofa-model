var gulp   = require('gulp'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  mocha = require('gulp-mocha');

gulp.task('lint', gulp.series(function() {
  return gulp.src(['./*.js', './test/*.js'])
    .pipe(jshint({node: true, mocha: true}))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
}));

gulp.task('test', gulp.series(['lint'], function () {
  return gulp.src('test/*.spec.js', {read: false})
    .pipe(mocha({timeout: 5000}));
}));

gulp.task('default', gulp.series(['test', 'lint']));