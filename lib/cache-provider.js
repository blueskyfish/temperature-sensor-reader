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
  logger = require('bluesky-logger').getLogger('sensor.provider.cache');



function _buildKey(sensor) {
  var
    groupId = sensor.groupId,
    nameId = sensor.nameId;

  return 'sensor-' + groupId + '-' + nameId;
}

/**
 * @class CacheProvider
 * @description
 * The CacheProvider is filter the sensor list.
 *
 * The background: The sensor-reader sends every time the line, when a sensor is transmitted
 * his data. But the sensor-reader sends the whole line with all sensor data.
 *
 */
var provider = module.exports = {
  name: 'cache-provider',
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
provider.cache = { };

/**
 * @name filterSensorList
 * @description
 * update the given sensor list with the cached sensor data. Unchanged sensor data are remove from
 * the sensor list.
 *
 * @param {object} config the configuration
 * @param {Array<object>} sensorList a list with sensor data.
 * @return {Array<object>} a list with changed sensor data.
 */
provider.filterSensorList = function (config, sensorList) {

  var
    cache = this.cache,
    list  = [];

  _.forEach(sensorList, function (sensor) {

    var
      sensorDate, itemDate,
      key = _buildKey(sensor),
      item = cache[key];

    if (!item) {
      cache[key] = sensor;
      logger.debug('sensor "', key, '" is not in cache: save sensor data');
      list.push(sensor);
      return;
    }

    // compare the sensor values!!!
    if (item.temperature !== sensor.temperature || item.humidity !== sensor.humidity) {
      cache[key] = sensor;
      logger.debug('sensor "', key, '" replaced in cache: temperature or humidity is different');
      list.push(sensor);
      return;
    }

    // compare the sensor date
    sensorDate = Date.parse(sensor.date);
    itemDate = Date.parse(item.date);
    if (sensorDate > itemDate && (sensorDate - itemDate) >= config.timePeriod) {
      cache[key] = sensor;
      logger.debug('sensor "', key, '" replaced in cache: period is greater than: ', config.timePeriod, ' ms');
      list.push(sensor);
      return;
    }

    // sensor data is older than the cached data
    logger.debug('sensor "', key, '" is unchanged');
  });

  logger.trace('cache: ', JSON.stringify(cache));

  return list;
};
