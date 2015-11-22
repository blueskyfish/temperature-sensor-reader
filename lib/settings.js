/*
 * temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 */

'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('lodash');

var parameters = require('./common/parameters');
var utilities = require('./common/utilities');

var SETTING_FILENAME = '.tsr-settings.json';

var mSettingMap = _readSettingValues();

module.exports = {

  getValue: function (name, def) {
    return _.get(mSettingMap, name, def);
  },

  setValue: function (name, value) {
    _.set(mSettingMap, name, value);
  }

};

function _readSettingValues() {
  // read from the home path settings...
  var settings = _readJSON(path.join(utilities.getUserHomePath(), SETTING_FILENAME));

  // Check whether the "settings" parameter is present.
  if (parameters.hasParam('settings')) {
    // try to read from the parameter settings.
    var paramSettings = _readJSON(
      path.join(process.cwd(), parameters.getParam('settings', SETTING_FILENAME)));
    // merge the settings together
    settings = _.assign({}, settings, paramSettings);
  }
  return settings;
}

function _readJSON(pathname) {
  if (fs.existsSync(pathname)) {
    var content = fs.readFileSync(pathname, 'utf8');
    try {
      return JSON.parse(content);
    }
    catch (e) {
      return {};
    }
  }
  return {};
}