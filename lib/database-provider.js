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
  logger = require('bluesky-logger').getLogger('sensor.provider.database'),
  mysql = require('mysql'),
  Q = require('q');

var
  dateUtil = require('./date-util'),
  status = require('./sensor-status');

var
  SQL_INSERT = 'INSERT INTO `sensor-local` SET ?',
  SQL_SELECT = 'SELECT sensor_id, group_id, name_id, temperature, humidity, date, status FROM `sensor-local` WHERE `status` <> "UPLOADED" LIMIT 20' ,
  SQL_UPDATE = 'UPDATE `sensor-local` SET status = "UPLOADED" WHERE sensor_id = ?',
  SQL_DELETE = 'DELETE FROM `sensor-local` WHERE sensor_id = ?';

function _openConnection(config) {
  var
    conn = mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.pass,
      database: config.name
    });
  conn.connect();
  return conn;
}

function _adjustSensorData(sensor) {
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

function _modifySensorData(sensor) {
  var
    data = {};

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

function _insertExecute(conn, sensor) {
  var
    defer = Q.defer();

  logger.trace('Insert Start...');

  conn.query(SQL_INSERT, _adjustSensorData(sensor), function (err, result) {

    if (err) {
      logger.trace('Insert with error: ', err);
      defer.reject(err);
      return;
    }

    logger.trace('Insert Result: ', JSON.stringify(result, null, 4));
    defer.resolve(result.insertId);
  });

  return defer.promise;
}

/**
 * Update the table `sensor-local`.
 *
 * Status = 'DELETED' => will be deleted.
 * Status = 'UPDATED' => will be updated.
 */
function _updateExecute(conn, sensor) {
  var
    defer = Q.defer(),
    sensorId = sensor.sensor_id,
    data = [sensorId];

  logger.trace('before update: ', JSON.stringify(sensor));

  if (sensor.status === status.UPLOADED) {
    logger.debug('save sensor: status is UPLOADED: ', sensorId);
    conn.query(SQL_UPDATE, data, function (err, result) {
      if (err) {
        return defer.reject(err);
      }
      defer.resolve(sensorId);
    });
  }
  else if (sensor.status === status.DELETED) {
    logger.debug('delete sensor: status is DELETED: ', sensorId);
    conn.query(SQL_DELETE, data, function (err, result) {
      if (err) {
        return defer.reject(err);
      }
      defer.resolve(sensorId);
    });
  }
  else {
    process.nextTick(function () {
      logger.warn('Error: unknown update status from sensor: ', sensorId, ' ??');
      defer.resolve(sensor);
    });
  }
  return defer.promise;
}


/**
 * @class DatabaseProvider
 * @description
 * Save the sensor data
 */
var provider = module.exports = {
  name: 'database-provider'
};


provider.saveSensorList = function (config, sensorList) {
  var
    conn = _openConnection(config),
    promiseList = [];

  logger.trace('save sensor list:');
  _.forEach(sensorList, function (sensor) {
    logger.trace('Before Insert: ', JSON.stringify(sensor));
    promiseList.push(_insertExecute(conn, sensor));
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
      return Q.reject(new Error('storage is failed'));
    }
  );
};

/**
 * Get the sensor list with sensor data that have status <> 'UPLOADED'
 */
provider.getSensorList = function (config) {
  var
    conn = _openConnection(config),
    defer = Q.defer();

    conn.query(SQL_SELECT, function (err, results, fields) {
      conn.end();

      if (err) {
        return defer.reject(err);
      }
      if (_.size(results) === 0) {
        return defer.reject('not uploaded sensor list is empty');
      }
      var
        list = [];
      _.forEach(results, function (sensor) {
        list.push(_modifySensorData(sensor));
      });
      logger.debug('get not uploaded sensor data: ', JSON.stringify(list));
      defer.resolve(list);
    });

    return defer.promise;
};

provider.updateSensorList = function (config, sensorList) {
  var
    conn = _openConnection(config),
    promiseList = [];

  _.forEach(sensorList, function (sensor) {
    promiseList.push(_updateExecute(conn, sensor));
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
