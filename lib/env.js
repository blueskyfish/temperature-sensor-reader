/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 *
 * Distributed on "<%= datetime %> @ <%= target %>" in version <%= version %>
 *
 * Purpose:
 * Read the program arguments and the config file.
 *
 * $ node reader.js [--config=path/to/config.js] [--help] [--level=xxx]
 *
 * Arguments:
 *   config             the filename of the configuration. If not present, then it use "config.js"
 *   help               shows the usage of the application
 *   level              set the log level
 * Configuration:
 *   level.namespaces   a key / value map (key = namespace, value = log level)
 *   level.separator    the separator in the namespace.
 *   sensor.groupId     the sensor group id
 *   database.name      the database name
 *   database.host      the host of the database server
 *   database.port      the port of the database server
 *   database.user      the user of the database
 *   database.pass      the password of the database user
 *   server.url         the url of the rest server (http://domain/path/index.php/sensor/upload)
 *   port.name          the filename of the serial port
 *   port.baudrate      the baudrate for reading the sensor raw data
 *   port.separator     the line separator
 *
 * Note:
 * All config properties are required. The program arguments are optional.
 */

'use strict';

var
  fs = require('fs'),
  path = require('path');

var
  _ = require('lodash'),
  minimist = require('minimist');

var
  DEFAULT_CONFIG_NAME = path.join(process.cwd(), 'config.js');

var
  env,
  params = minimist(process.argv.slice(2));


function _readConfigFileAndReturnMap(configName) {
  configName = configName || DEFAULT_CONFIG_NAME;
  if (!fs.existsSync(configName)) {
    configName = DEFAULT_CONFIG_NAME;
  }
  if (!fs.existsSync(configName)) {

    throw new Error('Unknown config file "' + configName + '"!', 0x0222);
  }
  return require(configName);
}

//
// extends the parameters and the config object
//
env = _.assign({}, params, _readConfigFileAndReturnMap(params.config));

env.name = 'env (Environment)';

//
// Exports the env object
//
module.exports = env;
