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
    globalObj.tinyDatePicker = factory();
    // if exist amd
    if (typeof define === 'function' && define.amd) {
      define([], function () {
        return globalObj.tinyDatePicker;
      });
    }
  }
}(function () {
  // ---------------- utils ----------------
  function pad (str) {
    var _str = '' + str;
    var len = _str.length;
    while (len++ < 2) {
      _str = '0' + _str;
    }
    return _str;
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

  function getFirstDateOfNextMonth (year, month) {
    return new Date(year, month, 1);
  }

  // reference: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
  function merge (target) {
    if (target == null) { // TypeError if undefined or null
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var i = 1; i < arguments.length; i++) {
      var nextSource = arguments[i];
      if (nextSource != null) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }

    return to;
  }

  function getScroll (type) {
    var _type = 'scroll' + type[0].toUpperCase() + type.slice(1);
    if (document.documentElement && document.documentElement[_type]) {
      return document.documentElement[_type];
    }
    return document.body[_type];
  }

  function getDOMTagName ($dom) {
    return $dom.tagName.toLowerCase();
  }

  function isDate (date) {
    if (date === null || date === 'undefined') return false;
    if (isNaN(new Date(date).getTime())) return false;
    if (Array.isArray(date)) return false; // deal with `new Date([ new Date() ]) -> new Date()`
    return true;
  }

  function isEqualDate (date1, date2) {
    var dateValue1 = new Date(new Date(date1).setHours(0, 0, 0, 0)).getTime();
    var dateValue2 = new Date(new Date(date2).setHours(0, 0, 0, 0)).getTime();
    return dateValue1 === dateValue2;
  }

  function setData ($el, key, value) {
    $el[key + SEED] = value;
  }

  function getData ($el, key) {
    return $el[key + SEED];
  }

  function removeData ($el, key) {
    delete $el[key + SEED];
  }

  function getElements (selectors) {
    var els = [];

    if (typeof selectors === 'string') { // strings selector
      var elements = document.querySelectorAll(selectors);
      for (var i = 0, len = elements.length; i < len; i++) {
        els.push(elements[i]);
      }
    } else if (selectors instanceof NodeList || selectors instanceof HTMLCollection) { // a series of node
      for (var j = 0, len2 = selectors.length; j < len2; j++) {
        els.push(selectors[i]);
      }
    } else if (selectors && typeof selectors === 'object' && selectors instanceof HTMLElement) { // a single node
      els.push(selectors);
    } else {
      throw new Error('Invalid selector for tiny date picker!');
    }

    return els;
  }

  function trigger ($el, event) {
    if ('createEvent' in document) {
      var evt = document.createEvent('HTMLEvents');
      evt.initEvent(event, false, true);
      $el.dispatchEvent(evt);
    } else {
      $el.fireEvent('on' + event);
    }
  }

  // ---------------- constants  ----------------
  var DEFAULTS = {
    clearable: false,
    daysOfWeekDisabled: [],
    disabledDate: null,
    defaultValue: null,
    format: 'yyyy-mm-dd',
    lang: 'zh-CN',
    showWeekDays: true,
    templates: null,
    weekStart: 0,
    zIndex: 2019
  };

  var VALID_FORMAT = /dd?|DD?|mm?|MM?|yy(?:yy)?/g;

  var SEED = Math.random().toString(36).substr(2);

  // ---------------- datepicker  ----------------
  function DatePicker ($el, options) {
    this.$el = $el;
    this.$input = getDOMTagName($el) === 'input' ? $el : $el.querySelector('input');
    this.options = options || {};
    this.$datePicker = null;
    this.value = null;
    this.state = {
      isVisible: false, // visible or invisible
      isMounted: false, // mounted or unmounted
      showStatus: 0, // 0 -> date, 1 -> month, 2 -> year
      weekData: [], // sunday, monday, tuesday, wednesday, thursday, friday, saturday
      dateData: [],
      monthData: [],
      yearData: [],
      date: null,
      month: null,
      year: null
    };
    this.handleShow = this.onShow.bind(this);
    this.handleKeyDown = this.onKeyDown.bind(this);
    this.handleHide = this.onHide.bind(this);
    this.register();
  }

  DatePicker.prototype.register = function () {
    // setData
    setData(this.$el, 'datepicker', this);
    // add event listener
    this.addEventListener();
  };

  DatePicker.prototype.init = function () {
    this.initOptions();
    this.initData();
    this.initDom();
    this.render();
    this.initEvent();
    this.blur();
  };

  DatePicker.prototype.initOptions = function () {
    this.settings = merge({}, DEFAULTS, this.options);
  };

  DatePicker.prototype.initData = function () {
    this.initWeekData();
    this.initDateData();
    this.initMonthData();
    this.initYearData();
  };

  DatePicker.prototype.initWeekData = function () {
    var weekData = this.getI18n().daysMin;
    // calc week start
    var weekStart = this.getWeekStart();

    // calc week data
    for (var i = 0; i < weekStart; i++) {
      weekData.push(weekData.shift());
    }

    this.state.weekData = weekData;
  };

  DatePicker.prototype.initDateData = function () {
    var thisYear = this.state.year;
    var thisMonth = this.state.month;

    if (!thisYear || !thisMonth) {
      var defaultValue = this.settings.defaultValue;
      var resDate = null;

      if (isDate(defaultValue)) { // valid date format: timestamp、instance of Date、strings etc.
        resDate = new Date(defaultValue); ;
      } else { // no default value
        resDate = new Date();
      }

      thisYear = resDate.getFullYear();
      thisMonth = resDate.getMonth() + 1;
    }

    var firstDateOfThisMonth = getFirstDateOfMonth(thisYear, thisMonth);
    var firstDayOfThisMonth = getFirstDayOfMonth(thisYear, thisMonth);
    thisMonth = firstDateOfThisMonth.getMonth() + 1;
    thisYear = firstDateOfThisMonth.getFullYear();

    var lastDateOfLastMonth = getLastDateOfLastMonth(thisYear, thisMonth);
    var dayCountOfLastMonth = getDayCountOfLastMonth(thisYear, thisMonth);
    var lastMonth = lastDateOfLastMonth.getMonth() + 1;
    var yearOfLastMonth = lastDateOfLastMonth.getFullYear();

    var dayCountOfThisMonth = getDayCountOfMonth(thisYear, thisMonth);

    var firstDateOfNextMonth = getFirstDateOfNextMonth(thisYear, thisMonth);
    var nextMonth = firstDateOfNextMonth.getMonth() + 1;
    var nextMonthOfYear = firstDateOfNextMonth.getFullYear();

    var dayCountOfWeek = 7;
    var rowCountOfDisplay = 6;

    // calc week start
    var weekStart = this.getWeekStart();

    // clear date data
    this.state.dateData = [];

    if (firstDayOfThisMonth === weekStart) {
      for (var i = 0; i < dayCountOfWeek; i++) {
        this.state.dateData.push({
          day: (i + weekStart) % dayCountOfWeek,
          date: dayCountOfLastMonth - dayCountOfWeek + i + 1,
          month: lastMonth,
          year: yearOfLastMonth
        });
      }
      rowCountOfDisplay--;
    }

    var showDayCountOfLastMonth = Math.abs(firstDayOfThisMonth - weekStart + dayCountOfWeek) % dayCountOfWeek;

    for (var j = 0; j < dayCountOfWeek * rowCountOfDisplay; j++) {
      var date, month, year;

      if (j < showDayCountOfLastMonth) { // last month
        date = dayCountOfLastMonth - showDayCountOfLastMonth + j + 1;
        month = lastMonth;
        year = yearOfLastMonth;
      } else if (j > dayCountOfThisMonth + showDayCountOfLastMonth - 1) { // next month
        date = j - dayCountOfThisMonth - showDayCountOfLastMonth + 1;
        month = nextMonth;
        year = nextMonthOfYear;
      } else { // this month
        date = j - showDayCountOfLastMonth + 1;
        month = thisMonth;
        year = thisYear;
      }

      this.state.dateData.push({
        day: (j + weekStart) % dayCountOfWeek,
        date: date,
        month: month,
        year: year
      });
    }

    this.state.month = thisMonth;
    this.state.year = thisYear;
  };

  DatePicker.prototype.initMonthData = function () {
    var labels = this.getI18n().monthsShort;

    this.state.monthData = labels.map(function (item, index) {
      return {
        label: item,
        value: index + 1
      };
    });
  };

  DatePicker.prototype.initYearData = function () {
    var thisYear = this.state.year;
    var countOfYear = 10;
    var minYear = thisYear - (thisYear % countOfYear);

    // clear year data
    this.state.yearData = [];

    for (var i = 0; i < countOfYear; i++) {
      this.state.yearData.push(minYear + i);
    }
  };

  DatePicker.prototype.initDom = function () {
    var i18n = this.getI18n();

    var todayText = i18n.today;
    var clearText = i18n.clear;
    var titleExchange = i18n.titleExchange;

    var settings = this.settings;
    var clearable = settings.clearable;
    var templates = settings.templates;

    var prevYearArrow = '&lt;&lt;';
    var prevMonthArrow = '&lt;';
    var nextYearArrow = '&gt;&gt;';
    var nextMonthArrow = '&gt;';

    if (templates) {
      prevYearArrow = templates.prevYearArrow || prevYearArrow;
      prevMonthArrow = templates.prevMonthArrow || prevMonthArrow;
      nextYearArrow = templates.nextYearArrow || nextYearArrow;
      nextMonthArrow = templates.nextMonthArrow || nextMonthArrow;
    }

    var $view = [
      '<div class="tiny-datepicker__header">',
      '<button class="tiny-datepicker__btn tiny-datepicker__prev-btn tiny-datepicker__prev-year">' + prevYearArrow + '</button>',
      '<button class="tiny-datepicker__btn tiny-datepicker__prev-btn tiny-datepicker__prev-month">' + prevMonthArrow + '</button>',
      '<span class="tiny-datepicker__header-label tiny-datepicker__show-year"></span>',
      '<span class="tiny-datepicker__header-label tiny-datepicker__show-month"></span>',
      '<button class="tiny-datepicker__btn tiny-datepicker__next-btn tiny-datepicker__next-year">' + nextYearArrow + '</button>',
      '<button class="tiny-datepicker__btn tiny-datepicker__next-btn tiny-datepicker__next-month">' + nextMonthArrow + '</button>',
      '</div>',
      '<div class="tiny-datepicker__body">',
      '<table class="tiny-datepicker__table tiny-datepicker__date-table">',
      '<thead></thead>',
      '<tbody></tbody>',
      '</table>',
      '<table class="tiny-datepicker__table tiny-datepicker__month-table">',
      '<tbody></tbody>',
      '</table>',
      '<table class="tiny-datepicker__table tiny-datepicker__year-table">',
      '<tbody></tbody>',
      '</table>',
      '</div>',
      '<div class="tiny-datepicker__footer" style="display: ' + (clearable ? 'block' : 'none') + '">',
      '<button class="tiny-datepicker__footer-btn tiny-datepicker__now-btn"><span>' + todayText + '</span></button>',
      '<button class="tiny-datepicker__footer-btn tiny-datepicker__clear-btn"><span>' + clearText + '</span></button>',
      '</div>'];

    if (titleExchange) {
      var $temp = $view[3];
      $view[3] = $view[4];
      $view[4] = $temp;
    }

    var $datePicker = document.createElement('div');
    $datePicker.className = 'tiny-datepicker__wrapper';
    $datePicker.innerHTML = $view.join('');

    // init dom for datepicker
    this.$datePicker = $datePicker;
    this.$showYear = this.getDom('.tiny-datepicker__show-year');
    this.$showMonth = this.getDom('.tiny-datepicker__show-month');
    this.$dateTable = this.getDom('.tiny-datepicker__date-table');
    this.$monthTable = this.getDom('.tiny-datepicker__month-table');
    this.$yearTable = this.getDom('.tiny-datepicker__year-table');
    this.$prevYear = this.getDom('.tiny-datepicker__prev-year');
    this.$prevMonth = this.getDom('.tiny-datepicker__prev-month');
    this.$nextMonth = this.getDom('.tiny-datepicker__next-month');
    this.$nextYear = this.getDom('.tiny-datepicker__next-year');
    this.$datePickerFooter = this.getDom('.tiny-datepicker__footer');
    this.$nowBtn = this.getDom('.tiny-datepicker__now-btn');
    this.$clearBtn = this.getDom('.tiny-datepicker__clear-btn');
  };

  DatePicker.prototype.addEventListener = function () {
    // bind event for input
    this.$input.addEventListener('focus', this.handleShow);
    this.$input.addEventListener('click', this.handleShow);
    this.$input.addEventListener('keydown', this.handleKeyDown);
    // bind event for hide datepicker
    document.addEventListener('click', this.handleHide);
  };

  DatePicker.prototype.removeEventListener = function () {
    // bind event for input
    this.$input.removeEventListener('focus', this.handleShow);
    this.$input.removeEventListener('click', this.handleShow);
    this.$input.removeEventListener('keydown', this.handleKeyDown);
    // bind event for hide datepicker
    document.removeEventListener('click', this.handleHide);
  };

  DatePicker.prototype.onShow = function () {
    if (this.state.isVisible) {
      return;
    }
    if (this.state.isMounted) {
      this.changeView(0);
      this.renderForShowStatus();
      this.show();
    } else {
      this.init();
    }
    this.adjustPosition();
  };

  DatePicker.prototype.onHide = function (event) {
    var $target = event.target;
    if (this.state.isVisible && this.isInvalidClick($target)) {
      this.hide();
      this.blur();
    }
  };

  DatePicker.prototype.show = function () {
    if (this.$datePicker) {
      this.$datePicker.style.display = 'block';
      this.state.isVisible = true;
    }
  };

  DatePicker.prototype.hide = function () {
    if (this.$datePicker) {
      this.$datePicker.style.display = 'none';
      this.state.isVisible = false;
    }
  };

  DatePicker.prototype.blur = function () {
    var inputValue = this.$input.value;
    var value = this.value;

    if (value && isDate(value)) { // value is not null
      if (inputValue && isDate(inputValue)) { // value and inputValue is not null
        !isEqualDate(value, inputValue) && this.setDate(inputValue);
      } else { // value is not null, inputValue is null
        this.setDate(value);
      }
    } else if (inputValue && isDate(inputValue)) { // value is null, inputValue not null
      this.setDate(inputValue);
    } else { // value and inputValue is null
      this.setDate(null);
    }
  };

  DatePicker.prototype.onKeyDown = function (event) {
    var keyCode = event.keyCode;
    var self = this;

    // ESC
    if (keyCode === 27) {
      self.hide();
      self.blur();
    }

    // Tab
    if (keyCode === 9) {
      setTimeout(function () {
        if (this.$input !== document.activeElement) {
          self.hide();
          self.blur();
        }
      }, 0);
    }
  };

  DatePicker.prototype.adjustPosition = function () {
    var inputRect = this.$el.getBoundingClientRect();
    var datepickerRect = this.$datePicker.getBoundingClientRect();

    var inputTop = inputRect.top;
    var inputLeft = inputRect.left;
    var inputBottom = inputRect.bottom;
    var inputRight = inputRect.right;
    var inputWidth = inputRight - inputLeft;
    var inputHeight = inputBottom - inputTop;

    var datepickerWidth = datepickerRect.right - datepickerRect.left;
    var datepickerHeight = datepickerRect.bottom - datepickerRect.top;

    var scrollTop = getScroll('top');
    var scrollLeft = getScroll('left');

    var winWidth = window.innerWidth;
    var winHeight = window.innerHeight;

    var arrowSize = 8;

    var className = 'tiny-datepicker__wrapper tiny-datepicker__';

    if (winHeight < inputTop + datepickerHeight + arrowSize) {
      this.$datePicker.style.top = inputTop - datepickerHeight + scrollTop - arrowSize + 'px';
      className += 'top';
    } else {
      this.$datePicker.style.top = inputTop + inputHeight + scrollTop + arrowSize + 'px';
      className += 'bottom';
    }

    if (winWidth < inputLeft + datepickerWidth) {
      this.$datePicker.style.left = inputLeft - datepickerWidth + inputWidth + scrollLeft + 'px';
      className += '-right';
    } else {
      this.$datePicker.style.left = inputLeft + scrollLeft + 'px';
      className += '-left';
    }

    if (this.settings.clearable) {
      className += ' tiny-datepicker__clearable';
    }

    this.$datePicker.className = className;
    this.$datePicker.style.zIndex = this.settings.zIndex;
  };

  DatePicker.prototype.render = function () {
    this.renderWeekData();
    this.renderDateData();
    this.renderMonthData();
    this.renderYearData();
    this.changeView(this.state.showStatus);
    this.mount();
  };

  DatePicker.prototype.mount = function () {
    this.state.isVisible = true;
    this.state.isMounted = true;
    document.body.appendChild(this.$datePicker);
  };

  DatePicker.prototype.renderWeekData = function () {
    // if need to hide
    if (!this.settings.showWeekDays) {
      return;
    }

    var $view = [];
    var weekData = this.state.weekData;

    $view.push('<tr>');

    for (var i = 0, len = weekData.length; i < len; i++) {
      $view.push('<th>' + weekData[i] + '</th>');
    }

    $view.push('</tr>');

    this.$dateTable.querySelector('thead').innerHTML = $view.join('');
  };

  DatePicker.prototype.renderDateData = function () {
    var $view = [];
    var dateData = this.state.dateData;
    var countOfRow = 7;

    for (var i = 0, len = dateData.length; i < len; i++) {
      var data = dateData[i];
      var className = this.getDateTdClass(data);

      if (i % countOfRow === 0) {
        $view.push('<tr>');
      }

      $view.push('<td class="' + className + '"><span>' + data.date + '</span></td>');

      if (i % countOfRow === countOfRow - 1) {
        $view.push('</tr>');
      }
    }

    this.$dateTable.querySelector('tbody').innerHTML = $view.join('');
  };

  DatePicker.prototype.reRenderDateData = function () {
    var dateData = this.state.dateData;
    var $tdArr = this.$dateTable.querySelectorAll('tbody tr td');

    for (var i = 0, len = dateData.length; i < len; i++) {
      var data = dateData[i];
      var $td = $tdArr[i];
      $td.className = this.getDateTdClass(data);
      $td.innerHTML = '<span>' + data.date + '</span>';
    }

    this.changeDateTableHeaderView();
  };

  DatePicker.prototype.getDateTdClass = function (data) {
    var year = this.state.year;
    var month = this.state.month;
    var className = '';

    if (data.month < month && data.year <= year) { // prev-month
      className = 'prev-month';
    } else if (data.month === month && data.year === year) { // this month
      className = 'available';
      // check if today
      var today = new Date();
      if (today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === data.date) {
        className += ' today';
      }
      // check if selected
      if (this.value &&
          this.value.getFullYear() === year &&
          this.value.getMonth() + 1 === month &&
          this.value.getDate() === data.date) {
        className += ' selected';
      }
    } else { // next-month
      className = 'next-month';
    }

    // settings check
    var settings = this.settings;
    var daysOfWeekDisabled = settings.daysOfWeekDisabled || [];
    var disabledDate = settings.disabledDate;

    // check if day of week disabled
    if (daysOfWeekDisabled.indexOf(data.day) > -1) {
      className += ' disabled';
    } else if (disabledDate && (typeof disabledDate === 'function') && disabledDate(new Date(data.year, data.month - 1, data.date, 0, 0, 0, 0))) {
      className += ' disabled';
    }

    return className;
  };

  DatePicker.prototype.renderMonthData = function () {
    var $view = [];
    var monthData = this.state.monthData;
    var countOfRow = 4;

    for (var i = 0, len = monthData.length; i < len; i++) {
      var className = this.getMonthTdClass(monthData[i]);

      if (i % countOfRow === 0) {
        $view.push('<tr>');
      }

      $view.push('<td class="' + className + '"><span>' + monthData[i].label + '</span></td>');

      if (i % countOfRow === countOfRow - 1) {
        $view.push('</tr>');
      }
    }

    this.$monthTable.querySelector('tbody').innerHTML = $view.join('');
  };

  DatePicker.prototype.reRenderMonthData = function () {
    var monthData = this.state.monthData;
    var $tdArr = this.$monthTable.querySelectorAll('tbody tr td');

    for (var i = 0, len = monthData.length; i < len; i++) {
      var $td = $tdArr[i];
      $td.className = this.getMonthTdClass(monthData[i]);
    }

    this.changeMonthTableHeaderView();
  };

  DatePicker.prototype.getMonthTdClass = function (data) {
    var year = this.state.year;
    var className = 'available';
    var today = new Date();

    // check if today
    if (today.getFullYear() === year && today.getMonth() + 1 === data.value) {
      className += ' today';
    }

    // check if selected
    if (this.value &&
        this.value.getFullYear() === year &&
        this.value.getMonth() + 1 === data.value) {
      className += ' selected';
    }

    return className;
  };

  DatePicker.prototype.renderYearData = function () {
    var $view = [];
    var yearData = this.state.yearData;
    var countOfRow = 4;
    var amount = 12;

    for (var i = 0; i < amount; i++) {
      var className = this.getYearTdClass(yearData[i]);

      if (i % countOfRow === 0) {
        $view.push('<tr>');
      }

      $view.push('<td><span class="' + className + '">' + (yearData[i] || '') + '</span></td>');

      if (i % countOfRow === countOfRow - 1) {
        $view.push('</tr>');
      }
    }

    this.$yearTable.querySelector('tbody').innerHTML = $view.join('');
  };

  DatePicker.prototype.reRenderYearData = function () {
    var yearData = this.state.yearData;
    var $tdArr = this.$yearTable.querySelectorAll('tbody tr td');

    for (var i = 0, len = yearData.length; i < len; i++) {
      var data = yearData[i];
      var $td = $tdArr[i];

      $td.className = this.getYearTdClass(data);
      $td.innerHTML = '<span>' + data + '</span>';
    }

    this.changeYearTableHeaderView();
  };

  DatePicker.prototype.getYearTdClass = function (data) {
    var className = 'available';
    var today = new Date();

    // check if today
    if (today.getFullYear() === data) {
      className += ' today';
    }

    // check if selected
    if (this.value &&
        this.value.getFullYear() === data) {
      className += ' selected';
    }

    return className;
  };

  DatePicker.prototype.initEvent = function () {
    this.$showMonth.addEventListener('click', this.changeMonthView.bind(this));
    this.$showYear.addEventListener('click', this.changeYearView.bind(this));
    this.$prevYear.addEventListener('click', this.doPrevYear.bind(this));
    this.$prevMonth.addEventListener('click', this.doPrevMonth.bind(this));
    this.$nextMonth.addEventListener('click', this.doNextMonth.bind(this));
    this.$nextYear.addEventListener('click', this.doNextYear.bind(this));
    this.$nowBtn.addEventListener('click', this.setTodayValue.bind(this));
    this.$clearBtn.addEventListener('click', this.doClearDate.bind(this));
    this.initChooseEvent();
  };

  DatePicker.prototype.initChooseEvent = function () {
    var $elArr = [this.$dateTable, this.$monthTable, this.$yearTable];
    var methodArr = ['onChooseDate', 'onChooseMonth', 'onChooseYear'];
    for (var i = 0, len1 = $elArr.length; i < len1; i++) {
      var $tdArr = $elArr[i].querySelectorAll('tbody tr td');
      for (var j = 0, len2 = $tdArr.length; j < len2; j++) {
        $tdArr[j].addEventListener('click', this[methodArr[i]].bind(this, j, $tdArr[j]));
      }
    }
  };

  DatePicker.prototype.onChooseDate = function (index, $el) {
    // if disabled
    if ($el.className.search(/\bdisabled\b/) > -1) {
      return;
    }

    var data = this.state.dateData[index];

    var newDate = new Date(data.year, data.month - 1, data.date);

    this.setDate(newDate);
    this.hide();
  };

  DatePicker.prototype.onChooseMonth = function (index) {
    var newMonth = this.state.monthData[index].value;
    this.state.month = newMonth;
    this.changeDateView();
  };

  DatePicker.prototype.onChooseYear = function (index) {
    var newYear = this.state.yearData[index];
    this.state.year = newYear;
    this.changeMonthView();
  };

  DatePicker.prototype.toggleMonthBtnView = function (flag) {
    var $domArr = [
      this.$showMonth, this.$prevMonth, this.$nextMonth
    ];

    $domArr.forEach(function ($el) {
      $el.style.display = flag ? '' : 'none';
    });
  };

  DatePicker.prototype.changeDateView = function () {
    this.changeView(0);
    this.renderForShowStatus();
  };

  DatePicker.prototype.changeDateTableHeaderView = function () {
    if (!this.isDateView()) {
      return;
    }
    this.$showYear.innerHTML = this.formatYear(this.state.year);
    this.$showMonth.innerHTML = this.formatMonth(this.state.year, this.state.month);
  };

  DatePicker.prototype.changeMonthView = function () {
    this.changeView(1);
    this.renderForShowStatus();
  };

  DatePicker.prototype.changeMonthTableHeaderView = function () {
    if (!this.isMonthView()) {
      return;
    }
    this.$showYear.innerHTML = this.formatYear(this.state.year);
  };

  DatePicker.prototype.changeYearView = function () {
    this.changeView(2);
    this.renderForShowStatus();
  };

  DatePicker.prototype.changeYearTableHeaderView = function () {
    if (!this.isYearView()) {
      return;
    }
    var yearData = this.state.yearData;
    var minYear = yearData[0];
    var maxYear = yearData[yearData.length - 1];
    this.$showYear.innerHTML = this.formatYear(minYear) + ' - ' + this.formatYear(maxYear);
  };

  DatePicker.prototype.changeView = function (showStatus) {
    this.state.showStatus = showStatus;

    var $domArr = [
      this.$dateTable, this.$monthTable, this.$yearTable
    ];

    $domArr.forEach(function ($el, index) {
      $el.style.display = index === showStatus ? '' : 'none';
    });

    switch (showStatus) {
    case 0:
      this.changeDateTableHeaderView();
      break;
    case 1:
      this.changeMonthTableHeaderView();
      break;
    case 2:
      this.changeYearTableHeaderView();
      break;
    }

    this.toggleMonthBtnView(showStatus === 0);
  };

  DatePicker.prototype.doPrevMonth = function () {
    if (!this.isDateView()) {
      return;
    }
    this.state.month -= 1;
    this.renderForShowStatus();
  };

  DatePicker.prototype.doNextMonth = function () {
    if (!this.isDateView()) {
      return;
    }
    this.state.month += 1;
    this.renderForShowStatus();
  };

  DatePicker.prototype.doPrevYear = function () {
    var showStatus = this.state.showStatus;
    switch (showStatus) {
    case 0: // date view
    case 1: // month view
      this.state.year -= 1;
      break;
    case 2: // year view
      this.state.year -= 10;
      break;
    }
    this.renderForShowStatus();
  };

  DatePicker.prototype.doNextYear = function () {
    var showStatus = this.state.showStatus;
    switch (showStatus) {
    case 0: // date view
    case 1: // month view
      this.state.year += 1;
      break;
    case 2: // year view
      this.state.year += 10;
      break;
    }
    this.renderForShowStatus();
  };

  DatePicker.prototype.renderForShowStatus = function () {
    var showStatus = this.state.showStatus;

    switch (showStatus) {
    case 0:
      this.initDateData();
      this.reRenderDateData();
      break;
    case 1:
      this.initMonthData();
      this.reRenderMonthData();
      break;
    case 2:
      this.initYearData();
      this.reRenderYearData();
      break;
    }

    this.toggleMonthBtnView(showStatus === 0);
  };

  DatePicker.prototype.setTodayValue = function () {
    var now = new Date();

    // check today if disabled
    var disabledDate = this.settings.disabledDate;

    if (disabledDate && typeof disabledDate === 'function' && disabledDate(new Date(now.setHours(0, 0, 0, 0)))) {
      return;
    }

    this.setDate(now);
    this.hide();
  };

  DatePicker.prototype.doClearDate = function () {
    this.clearDate();
    this.hide();
  };

  DatePicker.prototype.clearDate = function () {
    this.setDate(null);
  };

  DatePicker.prototype.setDate = function (newDate) {
    var _date = null;

    if (isDate(newDate)) {
      _date = new Date(newDate);
    }

    this.state.year = _date && _date.getFullYear();
    this.state.month = _date && (_date.getMonth() + 1);
    this.state.date = _date && _date.getDate();

    this.value = _date;
    this.$input.value = this.formatDate(_date, this.getFinalValue('format'));

    trigger(this.$input, 'change');

    this.changeView(0);
    this.renderForShowStatus();
  };

  DatePicker.prototype.parseFormat = function (formatStr) {
    var separators = formatStr.replace(VALID_FORMAT, '\0').split('\0');
    var parts = formatStr.match(VALID_FORMAT);

    if (!separators || !separators.length || !parts || parts.length === 0) {
      throw new Error('Invalid date format.');
    }

    return {
      separators: separators,
      parts: parts
    };
  };

  DatePicker.prototype.getDate = function () {
    return this.value;
  };

  DatePicker.prototype.formatDate = function (date, formatStr) {
    if (!date) {
      return date;
    }

    // if is timestamp format
    if (formatStr === 'timestamp') {
      return date.getTime();
    }

    var format = this.parseFormat(formatStr);
    var i18n = this.getI18n();

    var values = {
      d: date.getDate(),
      dd: pad(date.getDate()),
      D: i18n.daysShort[date.getDay()],
      DD: i18n.days[date.getDay()],
      m: date.getMonth() + 1,
      mm: pad(date.getMonth() + 1),
      M: i18n.monthsShort[date.getMonth()],
      MM: i18n.months[date.getMonth()],
      yy: date.getFullYear().toString().substring(2),
      yyyy: date.getFullYear()
    };

    var res = [];
    var seps = format.separators || [];

    for (var i = 0, len = format.parts.length; i <= len; i++) {
      if (seps.length) {
        res.push(seps.shift());
      }
      res.push(values[format.parts[i]]);
    }

    return res.join('');
  };

  DatePicker.prototype.formatYear = function (year) {
    var yearTitle = this.getI18n().yearTitle;
    return this.formatDate(new Date(year, 0, 1), yearTitle);
  };

  DatePicker.prototype.formatMonth = function (year, month) {
    var monthTitle = this.getI18n().monthTitle;
    return this.formatDate(new Date(year, month - 1, 1), monthTitle);
  };

  DatePicker.prototype.getWeekStart = function () {
    var weekStart = parseInt(Math.abs(this.getFinalValue('weekStart'))) % 7;
    return isNaN(weekStart) ? 0 : weekStart;
  };

  DatePicker.prototype.isDateView = function () {
    return this.state.showStatus === 0;
  };

  DatePicker.prototype.isMonthView = function () {
    return this.state.showStatus === 1;
  };

  DatePicker.prototype.isYearView = function () {
    return this.state.showStatus === 2;
  };

  DatePicker.prototype.getDom = function (selector) {
    return this.$datePicker.querySelector(selector);
  };

  DatePicker.prototype.isInvalidClick = function ($target) {
    var $node = $target;
    while ($node) {
      if ($node === this.$datePicker || $node === this.$el) {
        return false;
      }
      $node = $node.parentNode;
    }
    return true;
  };

  DatePicker.prototype.getI18n = function () {
    var i18n = tinyDatePicker.langs[this.settings.lang || 'zh-CN'];
    if (!i18n) {
      throw new Error('Please check if ' + this.settings.lang + ' internationalization file is loaded!');
    }
    return i18n;
  };

  DatePicker.prototype.getFinalValue = function (key) {
    var i18n = this.getI18n();
    if (this.options[key] != null) {
      return this.options[key];
    }
    if (i18n[key] != null) {
      return i18n[key];
    }
    return this.settings[key];
  };

  DatePicker.prototype.remove = function () {
    if (this.$datePicker) {
      var parentElement = this.$datePicker.parentElement;
      parentElement.removeChild(this.$datePicker);
    }
  };

  DatePicker.prototype.destroy = function () {
    this.hide();
    // remove event listener
    this.removeEventListener();
    // remove dom
    this.remove();
    // remove data
    removeData(this, 'datepicker');
  };

  // ---------------- tiny datepicker  ----------------
  var tinyDatePicker = {};

  // i18n
  tinyDatePicker.langs = {
    'zh-CN': {
      days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      daysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      daysMin: ['日', '一', '二', '三', '四', '五', '六'],
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthsShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      today: '今天',
      clear: '清除',
      format: 'yyyy-mm-dd',
      yearTitle: 'yyyy年',
      monthTitle: 'mm月',
      titleExchange: false,
      weekStart: 1
    }
  };

  // init
  tinyDatePicker.init = function (selectors, options) {
    var elements = getElements(selectors);

    for (var i = 0, len = elements.length; i < len; i++) {
      new DatePicker(elements[i], options);
    }
  };

  // proxy
  tinyDatePicker.proxy = function (selectors, methods) {
    var elements = getElements(selectors);
    var args = Array.prototype.slice.call(arguments, 2);
    var res = [];

    for (var i = 0, len = elements.length; i < len; i++) {
      var datepicker = getData(elements[i], 'datepicker');

      if (datepicker) {
        res.push(datepicker[methods].apply(datepicker, args));
      }
    }

    return res;
  };

  // destroy
  tinyDatePicker.destroy = function (selectors) {
    this.proxy(selectors, 'destroy');
  };

  // show
  tinyDatePicker.show = function (selectors) {
    this.proxy(selectors, 'onShow');
  };

  // hide
  tinyDatePicker.hide = function (selectors) {
    this.proxy(selectors, 'hide');
  };

  // setDate
  tinyDatePicker.setDate = function (selectors, newDate) {
    this.proxy(selectors, 'setDate', newDate);
  };

  // getDate
  tinyDatePicker.getDate = function (selectors) {
    return this.proxy(selectors, 'getDate');
  };

  // clearDate
  tinyDatePicker.clearDate = function (selectors) {
    this.proxy(selectors, 'clearDate');
  };

  return tinyDatePicker;
}));
