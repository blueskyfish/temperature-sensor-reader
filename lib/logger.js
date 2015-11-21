/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 */

'use strict';

var path = require('path');

var loggerFactory = require('bluesky-logger');
var fileAppender = require('bluesky-logger/file-appender');

var settings = require('./settings');
var parameters = require('./common/parameters');
var utilities = require('./common/utilities');

// setup the basics
loggerFactory
  .config(settings.getValue('logger.namespaces', { root: 'info'}))
  .setSeparator(settings.getValue('logger.separator', '.'));

if (!parameters.getParam('d', false)) {
  // write the log messages into the files
  var filer = fileAppender({
    path: path.join(utilities.getUserHomePath(), 'var', 'logs'),
    name: '{date}-temperature-sensor-reader.log'
  });

  loggerFactory.setWriter(filer.appendMessage);
}

module.exports = {

  getLogger: function (name) {
    return loggerFactory.getLogger(name);
  }

};
