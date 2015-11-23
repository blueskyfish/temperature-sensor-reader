/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 */

'use strict';

var fs = require('fs');
var path = require('path');

var loggerFactory = require('bluesky-logger');
var fileAppender = require('bluesky-logger/file-appender');

var settings = require('./settings');
var parameters = require('./common/parameters');
var utilities = require('./common/utilities');

// setup the basics and get the logger instance
var logger = loggerFactory
  .config(settings.getValue('logger.namespaces', { root: 'info'}))
  .setSeparator(settings.getValue('logger.separator', '.'))
  .getLogger('sensor.logger');

if (!parameters.getParam('d', false)) {
  // write the log messages into the files
  var pathname = path.join(utilities.getUserHomePath(), 'var', 'logs');
  if (!fs.existsSync(pathname)) {
    var tempPath = path.join(utilities.getUserHomePath(), 'var');
    fs.mkdirSync(tempPath, '744');
    fs.mkdirSync(pathname, '744');
    logger.config('create the log path (', pathname, ')');
  }
  var filer = fileAppender({
    path: pathname,
    name: 'temperature-sensor-reader'
  });

  loggerFactory.setWriter(filer.appendMessage);
  logger.config('set the file appender in order to write the log message into a file');
}

module.exports = {

  getLogger: function (name) {
    return loggerFactory.getLogger(name);
  }

};
