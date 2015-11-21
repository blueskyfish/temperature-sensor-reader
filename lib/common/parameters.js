/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 *
 * Distributed on "<%= datetime %> @ <%= target %>" in version <%= version %>
 */

'use strict';

var minimist = require('minimist');

var paramMap = minimist(process.args.slice(2));

module.exports = {

  hasParam: function (name) {
    return hasParam_(name);
  },

  getParam: function (name, def) {
    return getParam_(name, def);
  }
};

function hasParam_(name) {
  if (paramMap._[name]) {
    return true;
  }
  return !!paramMap[name];
}

function getParam_(name, def) {
  return paramMap[name] || def;
}

