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
var mysql = require('mysql');
var Q = require('q');

var dateUtil = require('./common/date-util');
var logger = require('./logger').getLogger('sensor.provider.database');
var sensorStatus = require('./sensor-status');
var settings = require('./settings');

module.exports = {

  insertSensorList: function (sensorList) {
    return insertSensorList_(sensorList);
  },

  getSensorList: function () {
    return getSensorList_();
  },

  updateSensorList: function (sensorList) {
    return updateSensorList_(sensorList);
  }
};


var SQL_INSERT_SENSOR = 'INSERT INTO `sensor-local` SET ?';

/**
 * Defines the sql statement for get the sensor data that not have the sensorStatus "UPLOADED".
 * @constant
 */
var SQL_SELECT_NOT_UPLOAD_SENSORS = [
  'SELECT sensor_id, group_id, name_id, temperature, humidity, date, status ',
  'FROM `sensor-local` ',
  'WHERE `status` <> "UPLOADED" ',
  'LIMIT 20'
].join('\n');

var SQL_UPDATE_SENSOR = 'UPDATE `sensor-local` SET status = "UPLOADED" WHERE sensor_id = ?';
var SQL_DELETE_SENSOR = 'DELETE FROM `sensor-local` WHERE sensor_id = ?';

function insertSensorList_(sensorList) {
  var conn = _openConnection();
  var promiseList = [];

  logger.trace('save sensor list:');

  _.forEach(sensorList, function (sensor) {
    if (logger.isTraceEnable()) {
      logger.trace('Before Insert: ', JSON.stringify(sensor));
    }
    promiseList.push(_doInsertSensor(conn, sensor));
  });

  return Q.all(promiseList).then(
    function (result) {
      logger.debug('Insert new sensor data: ', result);
      conn.end();
      return result;
    },
    function (reason) {
      logger.warn('Insert sensor: ', reason);
      conn.end();
      return Q.reject('storage is failed');
    }
  );
}

/**
 * Get the sensor list with sensor data that have sensorStatus <> 'UPLOADED'
 */
function getSensorList_() {
  var conn = _openConnection();
  var defer = Q.defer();

  conn.query(SQL_SELECT_NOT_UPLOAD_SENSORS, function (err, results, fields) {
    conn.end();

    if (err) {
      return defer.reject(err);
    }
    if (_.size(results) === 0) {
      return defer.reject('not uploaded sensor list is empty');
    }
    // copy sensor records into list
    var list = [];
    _.forEach(results, function (sensor) {
      list.push(_prepareToList(sensor));
    });
    logger.debug('get not uploaded sensor data: ', JSON.stringify(list));
    defer.resolve(list);
  });

  return defer.promise;
}

function updateSensorList_(sensorList) {
  var conn = _openConnection();
  var promiseList = [];
  _.forEach(sensorList, function (sensor) {
    promiseList.push(_doUpdateSensor(conn, sensor));
  });

  return Q.all(promiseList).then(
    function (result) {
      logger.debug('Update sensor (Success): ', JSON.stringify(result));
      conn.end();
      return result;
    },
    function (reason) {
      logger.warn('Update sensor (Error): ', reason);
      conn.end();
      return Q.reject(new Error('storage is failed'));
    }
  );
};



function _openConnection() {
  var conn = mysql.createConnection({
    host: settings.getValue('database.host', 'localhost'),
    port: settings.getValue('database.port', 3306),
    user: settings.getValue('database.user', 'root'),
    password: settings.getValue('database.pass', ''),
    database: settings.getValue('database.name', '')
  });
  conn.connect();
  return conn;
}


function _doInsertSensor(conn, sensor) {
  var done = Q.defer();

  if (logger.isTraceEnable()) {
    logger.trace('Insert Start...');
  }

  conn.query(SQL_INSERT_SENSOR, _prepareForInsert(sensor), function (err, result) {

    if (err) {
      logger.trace('Insert with error: ', err);
      done.reject(err);
      return;
    }

    if (logger.isTraceEnable()) {
      logger.trace('Insert Result: ', JSON.stringify(result, null, 4));
    }
    done.resolve(result.insertId);
  });

  return done.promise;
}

/**
 * Update the table `sensor-local`.
 *
 * Status = 'DELETED' => will be deleted.
 * Status = 'UPDATED' => will be updated.
 */
function _doUpdateSensor(conn, sensor) {
  var done = Q.defer();
  var sensorId = sensor.sensor_id || 0;
  if (sensorId <= 0) {
    process.nextTick(function () {
      logger.warn('sensor data missing the property "sensor_id"!');
      done.resolve(sensor);
    });
    return done.promise;
  }
  var data = [sensorId];
  if (logger.isTraceEnable()) {
    logger.trace('before update: ', JSON.stringify(sensor));
  }

  if (sensor.status === sensorStatus.UPLOADED) {
    logger.debug('save sensor: status is UPLOADED: ', sensorId);
    conn.query(SQL_UPDATE_SENSOR, data, function (err, result) {
      if (err) {
        return done.reject(err);
      }
      done.resolve(sensorId);
    });
  }
  else if (sensor.status === sensorStatus.DELETED) {
    logger.debug('delete sensor: status is DELETED: ', sensorId);
    conn.query(SQL_DELETE_SENSOR, data, function (err, result) {
      if (err) {
        return done.reject(err);
      }
      done.resolve(sensorId);
    });
  }
  else {
    process.nextTick(function () {
      logger.warn('Error: unknown update status from sensor: ', sensorId, ' ??');
      done.resolve(sensorId);
    });
  }
  return done.promise;
}


function _prepareForInsert(sensor) {
  var
    data = {};

  _.forEach(sensor, function (value, name) {
    switch (name) {
      case 'nameId':
        data.name_id = value;
        break;
      case 'groupId':
        data.group_id = value;
        break;
      default:
        data[name] = value;
        break;
    }
  });
  return data;
}

function _prepareToList(sensor) {
  var data = {};
  _.forEach(sensor, function (value, name) {
    switch (name) {
      case 'group_id':
        data.groupId = value;
        break;
      case 'name_id':
        data.nameId = value;
        break;
      case 'date':
        data.date = dateUtil.format(value);
        break;
      default:
        data[name] = value;
        break;
    }
  });
  return data;
}
