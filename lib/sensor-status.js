/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 *
 * Distributed on "<%= datetime %> @ <%= target %>" in version <%= version %>
 */

'use strict';

/**
 * @class SensorStatus
 * @description
 * This class is a enumeration of the sensor status.
 *
 * @constructor
 */
module.exports = {

  /**
   * @name SAVED
   * @description
   * The sensor data is saved in the local database
   *
   * @constant
   */
  SAVED: 'SAVED',

  /**
   * @name UPLOADED
   * @description
   * The sensor data is uploaded to the external server and is saved in the local database
   *
   * @constant
   */
  UPLOADED: 'UPLOADED',

  /**
   * @name DELETED
   * @description
   * The sensor data is marked as deleted. Do not use anymore.
   *
   * @constant
   */
  DELETED: 'DELETED'
};
