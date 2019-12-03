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
  if (typeof exports !== 'undefined' && !exports.nodeType) {
    exports.tinyDatepicker = factory();
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
  // utils
  
  // datepicker
  function DatePicker (selector, options) {
    
  }

  // tiny datepicker
  var tinyDatePicker = {
    init: function (selector) {
      return new DatePicker(selector);
    }
  }

  // return tinyDatePicker
  return tinyDatePicker;
}));
