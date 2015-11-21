/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 */

'use strict';

var
  http = require('http'),
  url = require('url');

var _ = require('lodash');
var Q = require('q');

var logger = require('./logger').getLogger('sensor.provider.http');
var httpStatus = require('./http-status');
var settings = require('./settings');
var sensorStatus = require('./sensor-status');

module.exports = {


  /**
   * Sends the sensor dates to the server. If the sending is successful, then the sensor dates is extended with the
   * sensorStatus "UPLOADED", otherwise the sensor data is unchanged!
   *
   * @param {Array<object> } sensorList the ist of sensor dates.
   * @returns {Array<object>} the sensor list with the sensor sensorStatus.
   */
  sendSensorList: function (sensorList) {
    return sendSensorList_(sensorList);
  }
};


function sendSensorList_(sensorList) {
  if (_.size(sensorList) === 0) {
    return Q.reject('sensor list is empty, nothing to upload');
  }

  // upload the sensor list
  var promiseList = [];

  _.forEach(sensorList, function (sensor) {
    promiseList.push(_sendData(sensor));
  });

  return Q.all(promiseList);
}


function _sendData(sensor) {
  var done = Q.defer();
  var url = settings.getValue('server.url', null);
  var postData = _preparePostData(sensor);
  var httpServer = url.parse(url);
  var options = {
    hostname: httpServer.hostname,
    port: httpServer.port || 80,
    path: httpServer.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Content-Length': postData.length
    }
  };
  var req = http.request(options, function (res) {

    logger.debug('"', url, '" StatusCode=' + res.statusCode);

    if (httpStatus.getCode(res.statusCode) >= httpStatus.HTTP_BAD_REQUEST) {
      logger.warn('"', url, '" StatusCode=', res.statusCode, ' -> ', res.statusMessage);
      // resolve the unchanged sensor data.
      done.resolve(sensor);
      return;
    }

    res.setEncoding('utf8');
    res.on('data', function (data) {

      logger.trace('Response: ', data);
      try {
        // try to parse into a JSON object
        var result = JSON.parse(data);

        if (result && result.status === 'okay' && result.id) {
          // uploaded sensor data is stored in the server
          logger.debug('Uploaded sensor data: ', result.id);
          // update the sensor sensorStatus
          sensor.status = sensorStatus.UPLOADED;
        }
        done.resolve(sensor);
      } catch (e) {
        logger.warn('Error: could not parse the response data into a JSON object. ', e);
        // resolve the unchanged sensor data.
        done.resolve(sensor);
      }
    });
  });

  req.on('error', function(e) {

    logger.warn('Error: "', url, '" problem with request: ' + e.message);
    // resolve the unchanged sensor data.
    done.resolve(sensor);
  });

  // write the post data
  req.write(postData);
  req.end();

  return done.promise;
}


function _preparePostData(sensor) {
  var data = {};
  _.forEach(sensor, function (value, name) {
    switch (name) {
      case 'sensor_id':
      case 'sensorId':
      case 'status':
        break;
      default:
        data[name] = value;
        break;
    }
  });
  return JSON.stringify(data);
}
