/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 */

'use strict';

module.exports = {

  HTTP_OKAY: 200,

  HTTP_BAD_REQUEST: 400,

  getCode: function (statusCode) {
    return parseInt(statusCode, 10);
  }
};
