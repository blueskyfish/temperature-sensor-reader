/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 */

'use strict';

var
  del = require('del'),
  dateformat = require('dateformat'),
  ejs = require('gulp-ejs'),
  gulp = require('gulp'),
  minimist = require('minimist'),
  rename = require('gulp-rename');

var
  pkg = require('./package.json'),
  params = minimist(process.argv.slice(2)),
  target = params.target || '',

  // The name of the config file for the distribution
  configFile = target + '.config.js';

var
  model = {
    target: target,
    datetime: dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
    version: pkg.version
  },
  settings = {
    ext: '.js'
  };

gulp.task('clean', function (done) {
  del(['dist'], function () {
    done();
  });
});

gulp.task('check-target', ['clean'], function () {
  if (target === '') {
    console.log('');
    console.log('missing parameter "--target=name"');
    console.log('cancel!!');
    console.log('');
    process.exit(1);
  }
});

gulp.task('config-file', ['clean'], function () {
  return gulp.src(configFile)
    .pipe(ejs(model, settings))
    .pipe(rename('config.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy-package', ['clean'], function () {
  return gulp.src('package.json')
    .pipe(gulp.dest('dist'));
});

gulp.task('copy-reader', ['clean'], function () {
  return gulp.src(['reader.js'])
    .pipe(ejs(model, settings))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy-libraries', ['clean'], function () {
  return gulp.src(['lib/*.js'])
    .pipe(ejs(model, settings))
    .pipe(gulp.dest('dist/lib'));
});

gulp.task('copy-all', [
  'config-file',
  'copy-package',
  'copy-reader',
  'copy-libraries'
]);

/**
 * Build a distribution
 */
gulp.task('build', [
  'check-target',
  'copy-all'
]);

/**
 * Default Task (help)
 */
gulp.task('default', function () {
  console.log('');
  console.log('Sensor Reader');
  console.log('');
  console.log('Usage:');
  console.log('   gulp build --target=name   create a distribution with the config file of the target');
  console.log('   gulp clean                 delete the distribution folder');
});
