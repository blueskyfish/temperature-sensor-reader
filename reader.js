/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 */

'use strict';

var _ = require('lodash');
var later = require('later');
var serialport = require('serialport');
var Q = require('q');

var logger = require('./lib/logger').getLogger('sensor.main');
var settings = require('./lib/settings');
var filterProvider = require('./lib/filter-provider');
var httpProvider = require('./lib/http-provider');
var prepareProvider = require('./lib/prepare-provider');
var sensorProvider = require('./lib/sensor-provider');
var databaseProvider = require('./lib/database-provider');
var pkg = require('./package.json');

var reader;   // The serial reader object
var jobId;    // the later job (for cancel the job)

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
function _onSensorAdapterReceiveData(data) {
  logger.info('Begin: receive Data (size=', _.size(data), ')');
  Q.fcall(function () {
    return prepareProvider.extractLine(data);
  })
    .then(function (line) {
      return sensorProvider.getSensorList(line);
    })
    .then(function (sensorList) {
      return _traceStep('Sensor List (extract)', sensorList);
    })
    .then(function (sensorList) {
      return filterProvider.filterSensorList(sensorList);
    })
    .then(function (sensorList) {
      return _traceStep('SensorList (filtered)', sensorList);
    })
    .then(function (sensorList) {
      return httpProvider.sendSensorList(sensorList);
    })
    .then(function (sensorList) {
      return _traceStep('Sensor List (after send)', sensorList);
    })
    .then(function (sensorList) {
      return databaseProvider.insertSensorList(env.database, sensorList);
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

function _onScheduleNotUploadedSensors() {
  logger.info('Begin schedule of not uploaded sensor data');
  Q.fcall(function () {
    return databaseProvider.getSensorList();
  })
  .then(function (sensorList) {
    return _traceStep('SensorList (status <> "UPDATED")', sensorList);
  })
  .then(function (sensorList) {
    return httpProvider.sendSensorList(sensorList);
  })
  .then(function (sensorList) {
    return _traceStep('Sensor List (after send)', sensorList);
  })
  .then(function (sensorList) {
    return databaseProvider.updateSensorList(sensorList);
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
  if (logger.isTraceEnable()) {
    logger.trace(message, ' ', JSON.stringify(result, null, 4));
  }
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

  var sched;
  var schedUnit = settings.getValue('schedule.unit', 'minute');
  var schedValue = settings.getValue('schedule.value', 20);
  var portName = settings.getValue('port.name', null);
  var portBaudrate = settings.getValue('port.baudrate', 9600);
  var portSeparator = settings.getValue('port.separator', '\r\n');

  switch (schedUnit) {
    case 'hour':
      sched = later.parse.recur().every(schedValue).hour();
      break;
    default:
    case 'minute':
      sched = later.parse.recur().every(schedValue).minute();
      break;
  }

  
  logger.info(pkg.name, ' (', pkg.version, ')');
  logger.config('Schedule: ', schedValue, ' ', schedUnit);

  // starts the schedule job with later...
  jobId = later.setInterval(_onScheduleNotUploadedSensors, sched);

  // create serialport object
  reader = new serialport.SerialPort(portName, {
    baudrate: portBaudrate,
    parser: serialport.parsers.readline(portSeparator)
  });

  reader.on('open', function () {
    logger.config('Open serial Port "', portName, '" with sensor reader "', settings.getValue('sensor.groupId', 0), '"');
    reader.on('data', _onSensorAdapterReceiveData);
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
