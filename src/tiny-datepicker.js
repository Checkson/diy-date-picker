/**
 * Copyright (c) 2019-12-03 Checkson.
 * Licensed under the MIT License (MIT).
 * Github:https://github.com/Checkson/tiny-datepicker
 */

;(function (factory) {
  // Find the global object for export to both the browser and web workers
  var globalObj = (typeof window === 'object' && window) ||
                     (typeof self === 'object' && self);

  // CommonJS
  if (typeof module !== 'undefined' && typeof exports !== 'undefined' && !exports.nodeType) {
    module.exports = factory();
  } else if (globalObj) {
    // register tiny-datepicker
    globalObj.tinyDatepicker = factory();
    // if exist amd
    if (typeof define === 'function' && define.amd) {
      define([], function () {
        return globalObj.tinyDatepicker;
      });
    }
  }
}(function () {
  // ---------------- utils ----------------
  function pad (str, char, len) {
    var _str = '' + str;
    var _len = _str.length;
    while (_len++ < len) {
      _str = char + _str;
    }
    return _str;
  }

  function isLeapYear (year) {
    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  }

  function getFirstDateOfMonth (year, month) {
    return new Date(year, month - 1, 1);
  }

  function getFirstDayOfMonth (year, month) {
    return getFirstDateOfMonth(year, month).getDay();
  }

  function getLastDateOfLastMonth (year, month) {
    return new Date(year, month - 1, 0);
  }

  function getDayCountOfLastMonth (year, month) {
    return getLastDateOfLastMonth(year, month).getDate();
  }

  function getLastDateOfMonth (year, month) {
    return new Date(year, month, 0);
  }

  function getDayCountOfMonth (year, month) {
    return getLastDateOfMonth(year, month).getDate();
  }

  //  ---------------- datepicker  ---------------- 
  function DatePicker (el, options) {
    // pass
  }

  DatePicker.prototype.init = function (year, month) {
    // pass
  };

  DatePicker.prototype.initData = function () {
    // pass
  };

  DatePicker.prototype.initEvent = function () {
    // pass
  };

  DatePicker.prototype.render = function () {
    // pass
  };

  DatePicker.prototype.doPrevMonth = function () {
    // pass
  };

  DatePicker.prototype.doNextMonth = function () {
    // pass
  };

  DatePicker.prototype.doPrevYear = function () {
    // pass
  };

  DatePicker.prototype.doNextYear = function () {
    // pass
  };

  //  ---------------- tiny datepicker  ---------------- 
  var tinyDatePicker = {};

  tinyDatePicker.init = function (selectors, options) {
    var elements = document.querySelectorAll(selectors);
    for (var i = 0, len = elements.length; i < len; i++) {
      new DatePicker(elements[0], options);
    }
  };

  return tinyDatePicker;
}));
