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
  logger = require('bluesky-logger').getLogger('sensor.provider.sensor');

var
  dateUtil = require('./date-util');

var
  SENSOR_COUNT = 8;

function _parseAndConvertToInt(text) {
  var
    value = parseFloat(text);
  return parseInt(value * 100, 10);
}

/**
 * @class SensorProvider
 * @description
 * Extract the sensor dates from text and create a list of sensor dates.
 */
var provider = module.exports = {
  name: 'sensor-provider'
};

/**
 * @method getSensorList
 * @description
 * Extract from the given line (text) the sensor dates and build a list of sensor dates
 *
 * @param {object} config the configuration object for the sensor provider
 * @param {string} line the input line
 * @return {Array<object>} a list with the sensor dates
 */
provider.getSensorList = function (config, line) {
  var
    date = dateUtil.format(new Date()),
    dataList = line.split(';'),
    sensorData,
    sensorList = [];

  logger.trace('data:', dataList, '; size:', dataList.length);

  for (var index = 0; index < SENSOR_COUNT; index++) {
    if (_.isEmpty(dataList[ index ])) {
      continue;
    }
    sensorData = {
      nameId:        index,
      groupId:       config.groupId,
      temperature:  _parseAndConvertToInt(dataList[ index ]),
      humidity:     _parseAndConvertToInt(dataList[ index + SENSOR_COUNT ]),
      date:         date
    };
    sensorList.push(sensorData);
  }
  logger.debug('Read sensor data: ', JSON.stringify(sensorList));
  return sensorList;
};
