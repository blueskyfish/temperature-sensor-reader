/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 */

'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('lodash');

var logger = require('./logger').getLogger('sensor.provider.cache');
var settings = require('./settings');
var utilities = require('./common/utilities');

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
var mCache = _readCache();

function filterSensorList_(sensorList) {
  var timeoutPeriod = settings.getValue('filter.timeoutPeriod', 180);
  var list  = [];
  var saveCache = false;

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
      saveCache = true;
      return;
    }

    // compare the sensor values!!!
    if (item.temperature !== sensor.temperature || item.humidity !== sensor.humidity) {
      mCache[key] = sensor;
      logger.debug('sensor "', key, '" replaced in cache: temperature or humidity is different');
      list.push(sensor);
      saveCache = true;
      return;
    }

    // compare the sensor date
    sensorDate = Date.parse(sensor.date);
    itemDate = Date.parse(item.date);
    if (sensorDate > itemDate && (sensorDate - itemDate) >= timeoutPeriod) {
      mCache[key] = sensor;
      logger.debug('sensor "', key, '" replaced in cache: period is greater than: ', timeoutPeriod, ' ms');
      list.push(sensor);
      saveCache = true;
      return;
    }

    // sensor data is older than the cached data
    logger.debug('sensor "', key, '" is unchanged');
  });

  if (logger.isTraceEnable()) {
    logger.trace('cache: ', JSON.stringify(mCache));
  }
  if (saveCache) {
    _saveCache();
  }

  return list;
}

function _buildKey(sensor) {
  var groupId = sensor.groupId;
  var nameId = sensor.nameId;
  return 'sensor-' + groupId + '-' + nameId;
}

function _getCacheFilename() {
  return path.join(utilities.getUserHomePath(), 'var', 'trs-cache.json');
}

function _saveCache() {
  var filename = _getCacheFilename();
  var content = JSON.stringify(mCache);
  if (logger.isDebugEnabled()) {
    logger.debug('save the cached list of sensor data (', filename, ')')
  }
  fs.writeFileSync(filename, content, 'utf-8');
}

function _readCache() {
  var filename = _getCacheFilename();
  if (fs.existsSync(filename)) {
    logger.config('found the former cached list or sensor data (', filename, ')');
    var content = fs.readFileSync(filename, 'utf8');
    try {
      return JSON.parse(content);
    }
    catch (e) {
      logger.warn('could not parse the cache json file from ', filename);
      return {};
    }
  }
  return {};
}