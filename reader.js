/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 *
 * Distributed on "<%= datetime %> @ <%= target %>" in version <%= version %>
 *
 * Usage:
 * $ node reader.js [--config=path/to/config.js] [--help] [--level=xxx]
 */

'use strict';

var _ = require('lodash');
var later = require('later');
var loggerFactory = require('bluesky-logger');
var logger = loggerFactory.getLogger('sensor.main');
var serialport = require('serialport');
var Q = require('q');

var env = require('./lib/env');
var cacheProvider = require('./lib/cache-provider');
var httpProvider = require('./lib/http-provider');
var prepareProvider = require('./lib/prepare-provider');
var sensorProvider = require('./lib/sensor-provider');
var databaseProvider = require('./lib/database-provider');
var pkg = require('./package.json');

var
  reader,   // serial port reader
  jobId;    // the later job (for cancel the job)

/**
 * Callback function for receive data from the sensor reader.
 *
 * It is processing many steps by different providers. The processing is executing asynchronously.
 *
 * ```
 * $1;1;;27.0;23,8;24,3;;;;;;43;57;53;;;;;;;;;;;0
 * ```
 *
 * @param {string} data the plain text with the sensor data.
 * @private
 */
function _onReceiveData(data) {
  logger.info('Begin: receive Data (size=', _.size(data), ')');
  Q.fcall(function () {
    return prepareProvider.extractLine(data);
  })
    .then(function (line) {
      return sensorProvider.getSensorList(env.sensor, line);
    })
    .then(function (sensorList) {
      return _traceStep('Sensor List (extract)', sensorList);
    })
    .then(function (sensorList) {
      return cacheProvider.filterSensorList(env.cache, sensorList);
    })
    .then(function (sensorList) {
      return _traceStep('SensorList (cache filtered)', sensorList);
    })
    .then(function (sensorList) {
      return httpProvider.sendSensorList(env.server, sensorList);
    })
    .then(function (sensorList) {
      return _traceStep('Sensor List (after send)', sensorList);
    })
    .then(function (sensorList) {
      return databaseProvider.saveSensorList(env.database, sensorList);
    })
    .done(
      function (insertIdList) {
        if (insertIdList) {
          logger.info('Finish receive data: ');
          logger.debug(JSON.stringify(insertIdList));
        }
      },
      function (reason) {
        logger.info('Warning (Sensor)');
        logger.info(reason);
      }
    );
}

function _onScheduleSensor() {
  logger.info('Begin schedule of not uploaded sensor data');
  Q.fcall(function () {
    return databaseProvider.getSensorList(env.database);
  })
  .then(function (sensorList) {
    return _traceStep('SensorList (status <> "UPDATED")', sensorList);
  })
  .then(function (sensorList) {
    return httpProvider.sendSensorList(env.server, sensorList);
  })
  .then(function (sensorList) {
    return _traceStep('Sensor List (after send)', sensorList);
  })
  .then(function (sensorList) {
    return databaseProvider.updateSensorList(env.database, sensorList);
  })
  .done(
    function (result) {
      logger.info('Finish schedule');
      logger.debug(JSON.stringify(result));
    },
    function (reason) {
      logger.info('Warning (Schedule)');
      logger.info(reason);
    }
  );
}

/**
 * Print out the result JSON object
 *
 * @param {string} message the log trace messsage
 * @param {*} result the JSON object that trace out
 * @returns {*} the unmodified result JSON object.
 * @private
 */
function _traceStep(message, result) {
  logger.trace(message, ' ', JSON.stringify(result, null, 4));
  return result;
}

/**
 * Shutdown the sensor reader app. If the signal "kill" or "Ctrl-C" is send to the node process,
 * then it finish the reading
 * @private
 */
function _shutdown(sigName) {
  if (reader) {
    logger.info(sigName, ': Finish...');
    // stop the schedule job
    jobId.clear();
    reader.close(function (err) {
      if (err) {
        logger.warn(sigName, ': Shutdown with error: ', err);
      }
      else {
        logger.info(sigName, ': Shutdown');
      }
      logger.info('\n\n');
      process.exit(0);
    });
  }
}

/**
 * The main entry point of the sensor reader.
 *
 * @private
 */
function _main() {

  var
    sched;

  // configuration of logger
  loggerFactory
    .config(env.logger.namespaces)
    .setSeparator(env.logger.separator);

  switch (env.schedule.unit || 'minute') {
    case 'hour':
      sched = later.parse.recur().every(env.schedule.value).hour();
      break;
    default:
    case 'minute':
      sched = later.parse.recur().every(env.schedule.value).minute();
      break;
  }

  
  logger.info(pkg.name, ' (', pkg.version, ')');
  logger.config('Schedule: ', env.schedule.value, ' ', env.schedule.unit);

  // starts the schedule job with later...
  jobId = later.setInterval(_onScheduleSensor, sched);

  // create serialport object
  reader = new serialport.SerialPort(env.port.name, {
    baudrate: env.port.baudrate,
    parser: serialport.parsers.readline(env.port.separator)
  });

  reader.on('open', function () {
    logger.config('Open serial Port "', env.port.name, '" with sensor reader "', env.sensor.groupId, '"');
    reader.on('data', _onReceiveData);
  });

  // listen for TERM signal .e.g. kill
  process.on('SIGTERM', function () {
    _shutdown('sigterm');
  });

  // listen for INT signal e.g. Ctrl-C
  process.on('SIGINT', function () {
    _shutdown('ctrl+c');
  });
}

//
// starts the sensor reader app
//
_main();
