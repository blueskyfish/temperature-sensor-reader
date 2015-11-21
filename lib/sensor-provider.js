/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 *
 * Distributed on "<%= datetime %> @ <%= target %>" in version <%= version %>
 */

'use strict';

var _ = require('lodash');

var dateUtil = require('./common/date-util');
var logger = require('./logger').getLogger('sensor.provider.sensor');
var settings = require('./settings');

module.exports = {

  /**
   * Extract from the given line (text) the sensor dates and build a list of sensor dates
   *
   * @param {string} line the input line
   * @return {Array<object>} a list with the sensor dates
   */
  getSensorList: function (line) {
    return getSensorList_(line);
  }
};

var SENSOR_COUNT = 8;

function getSensorList_(line) {
  var groupId = settings.getValue('sensor.groupId', 0);
  var date = dateUtil.format(new Date());
  var dataList = line.split(';');
  var sensorData;
  var sensorList = [];

  logger.trace('data:', dataList, '; size:', dataList.length);

  for (var index = 0; index < SENSOR_COUNT; index++) {
    if (_.isEmpty(dataList[ index ])) {
      continue;
    }
    sensorData = {
      nameId:       index,
      groupId:      groupId,
      temperature:  _parseAndConvertToInt(dataList[ index ]),
      humidity:     _parseAndConvertToInt(dataList[ index + SENSOR_COUNT ]),
      date:         date
    };
    sensorList.push(sensorData);
  }
  logger.debug('Read sensor data: ', JSON.stringify(sensorList));
  return sensorList;
}

function _parseAndConvertToInt(text) {
  var
    value = parseFloat(text);
  return parseInt(value * 100, 10);
}
