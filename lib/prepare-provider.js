/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 */

'use strict';

var _ = require('lodash');
var Q = require('q');

var logger = require('./logger').getLogger('sensor.provider.prepare');

module.exports = {

  extractLine: function (data) {
    return extractLine_(data);
  }
};

var PREFIX_LINE = '$1;1;;';
var SUFFIX_LINE = ';0';

function extractLine_(data) {
  if (!data || !_.startsWith(data, PREFIX_LINE) || !_.endsWith(data, SUFFIX_LINE)) {
    return Q.reject('receive invalidate data -> not processing');
  }

  var line = _extract(data);
  logger.trace('Sensor Raw:  ', data);
  logger.debug('Sensor Line: ', line);
  return line;
}

function _extract(line) {
  var len = line.length;
  return line.substring(PREFIX_LINE.length, len - SUFFIX_LINE.length).replace(/,/g, '.');
}
