/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 */

'use strict';

var _ = require('lodash');

module.exports = {

  fromEnv: function (name) {
    return fromEnv_(name);
  },

  getUserHomePath: function () {
    return getUserHomePath_();
  }
};


function fromEnv_(name) {
  if (!_.isString(name)) {
    return null;
  }

  var loName = name.toLowerCase();
  var upName = name.toUpperCase();

  return process.env[loName] ||
      process.env[upName] ||
      process.env[name] || null;
}

function getUserHomePath_() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}