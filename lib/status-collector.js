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
  logger = require('bluesky-logger');

var
  statusData = {};

/**
 * @class StatusCollector
 * @description
 * This service collect the internal status.
 */
var collector = module.exports = {
  name: 'status-collector'
};

collector.updateData = function (selector, value) {
  _.set(statusData, selector, value);

  logger.trace('status: ', JSON.stringify(statusData));
};

collector.getData = function (selector, defValue) {
  return _.get(statusData, selector, defValue);
};

collector.hasData = function (selector) {
  return _.has(statusData, selector);
};

collector.clear = function () {
  statusData = {};
};
