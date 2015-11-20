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
  dateformat = require('dateformat');

var
  DATE_PATTERN = 'yyyy-mm-dd HH:MM:ss';

module.exports = {

  format: function (date) {
    return dateformat(date, DATE_PATTERN);
  }
};
