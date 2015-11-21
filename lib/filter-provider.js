/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 */

'use strict';

var _ = require('lodash');

var logger = require('./logger').getLogger('sensor.provider.cache');
var settings = require('./settings');

module.exports = {

  /**
   * update the given sensor list with the cached sensor data. Unchanged sensor data are remove from
   * the sensor list.
   *
   * @param {Array<object>} sensorList a list with sensor data.
   * @return {Array<object>} a list with changed sensor data.
   */
  filterSensorList: function (sensorList) {
    return filterSensorList_(sensorList);
  }
};



/**
 * ```js
 * cache: {
 *   sensor-1000-0: {
 *     sensorData
 *   }
 * }
 * ```
 */
var mCache = { };

function filterSensorList_(sensorList) {
  var timeoutPeriod = settings.getValue('filter.timeoutPeriod', 180);
  var list  = [];

  _.forEach(sensorList, function (sensor) {
    var sensorDate;
    var itemDate;
    var key = _buildKey(sensor);
    var item = mCache[key];

    // Check whether the sensor data is in the cache
    if (!item) {
      mCache[key] = sensor;
      logger.debug('sensor "', key, '" is not in cache: save sensor data');
      list.push(sensor);
      return;
    }

    // compare the sensor values!!!
    if (item.temperature !== sensor.temperature || item.humidity !== sensor.humidity) {
      mCache[key] = sensor;
      logger.debug('sensor "', key, '" replaced in cache: temperature or humidity is different');
      list.push(sensor);
      return;
    }

    // compare the sensor date
    sensorDate = Date.parse(sensor.date);
    itemDate = Date.parse(item.date);
    if (sensorDate > itemDate && (sensorDate - itemDate) >= timeoutPeriod) {
      mCache[key] = sensor;
      logger.debug('sensor "', key, '" replaced in cache: period is greater than: ', timeoutPeriod, ' ms');
      list.push(sensor);
      return;
    }

    // sensor data is older than the cached data
    logger.debug('sensor "', key, '" is unchanged');
  });

  logger.trace('cache: ', JSON.stringify(mCache));

  return list;
}

function _buildKey(sensor) {
  var groupId = sensor.groupId;
  var nameId = sensor.nameId;
  return 'sensor-' + groupId + '-' + nameId;
}
