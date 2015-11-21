/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 *
 * Distributed on "<%= datetime %> @ <%= target %>" in version <%= version %>
 */

'use strict';

module.exports = {

  /**
   * The sensor data is saved in the local database
   *
   * @constant
   */
  SAVED: 'SAVED',

  /**
   * The sensor data is uploaded to the external server and is saved in the local database
   *
   * @constant
   */
  UPLOADED: 'UPLOADED',

  /**
   * The sensor data is marked as deleted. Do not use anymore.
   *
   * @constant
   */
  DELETED: 'DELETED'
};
