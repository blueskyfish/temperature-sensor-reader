/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 */

'use strict';

//
// Config Object
//
module.exports = {

  // The logger section
  // (values: 'all', 'warn', 'info', 'config', 'debug', 'trace', 'none')
  logger: {
    namespaces: {
      'root': 'config',
      'sensor': 'config',
      'sensor.main': 'info',
      'sensor.provider': 'info',
      'sensor.provider.filter': 'debug',
      'sensor.provider.database': 'info',
      'sensor.provider.prepare': 'debug',
      'sensor.provider.sensor': 'debug'
    },
    separator: '.'
  },

  // The serial port section
  port: {
    name: '/dev/ttyXX',                                             // the device name of the sensor reader
    baudrate: 9600,                                                 // don't change this value
    separator: '\r\n'                                               // the line end separator
  },

  // The schedule
  schedule: {
    value: 20,
    unit: 'minute'        // possible values: "minute", "hour"
  },

  // the cache
  cache: {
    timePeriod: 170000    // 2 minutes und 50 seconds.
  },

  // The sensor section
  sensor: {

    // group id of the sensor reader
    groupId: 1000

  },

  // The MySQL database server section
  database: {
    // database name
    name: 'database',
    host: 'localhost',                                              // the host of the server
    port: 3306,                                                     // the port of the server
    user: 'dbuser',                                                 // the database user
    pass: 'dbpassword'                                              // the passwort of the database user
  },

  // The external server section
  server: {
    url: 'http://domain.com/path/to/temo/server/upload'             // url to the external server
  }

};
