/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 *
 * Distributed on "<%= datetime %> @ <%= target %>" in version <%= version %>
 */

'use strict';

var
  _ = require('lodash'),
  logger = require('bluesky-logger').getLogger('sensor.provider.prepare'),
  Q = require('q');

var
  PREFIX_LINE = '$1;1;;',
  SUFFIX_LINE = ';0';

function __extract(line) {
  var
    len = line.length;

  return line.substring(PREFIX_LINE.length, len - SUFFIX_LINE.length).replace(/,/g, '.');
}

var provider = module.exports = {
  name: 'prepare-provider'
};

provider.extractLine = function (data) {
  var
    line;

  if (!data || !_.startsWith(data, PREFIX_LINE) || !_.endsWith(data, SUFFIX_LINE)) {
    return Q.reject(new Error('receive invalidate data -> not processing'));
  }
  line = __extract(data);
  logger.trace('Sensor Raw:  ', data);
  logger.debug('Sensor Line: ', line);
  return line;
};
