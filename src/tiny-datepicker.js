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
  function pad (str, char, len) {
    var _str = '' + str;
    var _len = _str.length;
    while (_len++ < len) {
      _str = char + _str;
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
  function merge (target, varArgs) {
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

  //  ---------------- datepicker  ----------------
  function DatePicker ($input, options) {
    this.$input = $input;
    this.$datePicker = null;
    this.state = {
      isVisible: false, // visible or invisible
      isMounted: false, // mounted or unmounted
      showStatus: 0, // 0 -> date, 1 -> month, 2 -> year
      weekData: [], // sunday, monday, tuesday, wednesday, thursday, friday, saturday
      dateData: [],
      monthData: [],
      yearData: [],
      day: null,
      date: null,
      month: null,
      year: null
    };
    this.initOptions(options);
    this.register();
  }

  DatePicker.prototype.initOptions = function (options) {
    var defaults = {
      value: '',
      readonly: false,
      disabled: false,
      editable: false,
      clearable: false,
      placeholder: '',
      name: '',
      format: 'yyyy-MM-dd',
      valueFormat: 'yyyy-MM-dd',
      language: ''
    };
    this.settings = merge(defaults, options);
  };

  DatePicker.prototype.register = function () {
    // bind event for show datepicker
    this.$input.addEventListener('focus', this.onShow.bind(this));
    // bind event for hide datepicker
    document.addEventListener('click', this.onHide.bind(this));
  };

  DatePicker.prototype.onShow = function () {
    if (this.state.isVisible) {
      return;
    }
    if (this.state.isMounted) {
      this.renderForShowStatus();
      this.show();
    } else {
      this.init();
    }
    this.place();
  };

  DatePicker.prototype.onHide = function (event) {
    var $target = event.target;
    if (this.state.isVisible && this.isValidClick($target)) {
      this.hide();
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

  DatePicker.prototype.place = function () {
    var inputRect = this.$input.getBoundingClientRect();
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

    if (winHeight < inputTop + datepickerHeight) {
      this.$datePicker.style.top = inputTop - datepickerHeight - inputHeight + scrollTop + 'px';
    } else {
      this.$datePicker.style.top = inputTop + inputHeight + scrollTop + 'px';
    }

    if (winWidth < inputLeft + datepickerWidth) {
      this.$datePicker.style.left = inputLeft - datepickerWidth + inputWidth + scrollLeft + 'px';
    } else {
      this.$datePicker.style.left = inputLeft + scrollLeft + 'px';
    }
  };

  DatePicker.prototype.init = function () {
    this.initData();
    this.initDom();
    this.render();
    this.initEvent();
  };

  DatePicker.prototype.initData = function () {
    this.initWeekData();
    this.initDateData();
    this.initMonthData();
    this.initYearData();
  };

  DatePicker.prototype.initWeekData = function () {
    this.state.weekData = [
      '日', '一', '二', '三', '四', '五', '六'
    ];
  };

  DatePicker.prototype.initDateData = function () {
    var thisYear = this.state.year;
    var thisMonth = this.state.month;

    if (!thisYear || !thisMonth) {
      var now = new Date();
      thisYear = now.getFullYear();
      thisMonth = now.getMonth() + 1;
    }

    var firstDateOfThisMonth = getFirstDateOfMonth(thisYear, thisMonth);
    var firstDayOfThisMonth = getFirstDayOfMonth(thisYear, thisMonth);
    thisMonth = firstDateOfThisMonth.getMonth() + 1;
    thisYear = firstDateOfThisMonth.getFullYear();

    var lastDateOfLastMonth = getLastDateOfLastMonth(thisYear, thisMonth);
    var dayCountOfLastMonth = getDayCountOfLastMonth(thisYear, thisMonth);
    var lastMonth = lastDateOfLastMonth.getMonth() + 1;
    var lastMonthOfYear = lastDateOfLastMonth.getFullYear();

    var dayCountOfThisMonth = getDayCountOfMonth(thisYear, thisMonth);

    var firstDateOfNextMonth = getFirstDateOfNextMonth(thisYear, thisMonth);
    var nextMonth = firstDateOfNextMonth.getMonth() + 1;
    var nextMonthOfYear = firstDateOfNextMonth.getFullYear();

    var dayCountOfWeek = 7;
    var rowCountOfDisplay = 6;

    // clear date data
    this.clearDateData();

    if (firstDayOfThisMonth === 0) {
      for (var i = dayCountOfWeek - 1; i >= 0; i--) {
        this.state.dateData.unshift({
          day: i,
          date: dayCountOfLastMonth + i - 6,
          month: lastMonth,
          year: lastMonthOfYear,
          classIndex: 1
        });
      }
      rowCountOfDisplay--;
    }

    for (var j = 0; j < dayCountOfWeek * rowCountOfDisplay; j++) {
      var date, month, Year;
      var classIndex = 0; // 0 -> available, 1 -> prev-month, 2 -> next-month

      if (j < firstDayOfThisMonth) { // last month
        date = dayCountOfLastMonth - firstDayOfThisMonth + j + 1;
        month = lastMonth;
        Year = lastMonthOfYear;
        classIndex = 1;
      } else if (j > dayCountOfThisMonth + firstDayOfThisMonth - 1) { // next month
        date = j - dayCountOfThisMonth - firstDayOfThisMonth + 1;
        month = nextMonth;
        Year = nextMonthOfYear;
        classIndex = 2;
      } else { // this month
        date = j - firstDayOfThisMonth + 1;
        month = thisMonth;
        Year = thisYear;
      }

      this.state.dateData.push({
        day: j % dayCountOfWeek,
        date: date,
        month: month,
        year: Year,
        classIndex: classIndex
      });
    }

    this.state.month = thisMonth;
    this.state.year = thisYear;
  };

  DatePicker.prototype.initMonthData = function () {
    var labels = [
      '一月', '二月', '三月', '四月',
      '五月', '六月', '七月', '八月',
      '九月', '十月', '十一月', '十二月'
    ];

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
    this.clearYearData();

    for (var i = 0; i < countOfYear; i++) {
      this.state.yearData.push(minYear + i);
    }
  };

  DatePicker.prototype.initDom = function () {
    var $view = [
      '<div class="tiny-datepicker__header">',
      '<button class="tiny-datepicker__btn tiny-datepicker__prev-btn tiny-datepicker__prev-year">&lt;&lt;</button>',
      '<button class="tiny-datepicker__btn tiny-datepicker__prev-btn tiny-datepicker__prev-month">&lt;</button>',
      '<span class="tiny-datepicker__header-label tiny-datepicker__show-year"></span>',
      '<span class="tiny-datepicker__header-label tiny-datepicker__show-month"></span>',
      '<button class="tiny-datepicker__btn tiny-datepicker__next-btn tiny-datepicker__next-year">&gt;&gt;</button>',
      '<button class="tiny-datepicker__btn tiny-datepicker__next-btn tiny-datepicker__next-month">&gt;</button>',
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
      '</div>'];

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
    var TD_CLASS_LIST = ['available', 'prev-month', 'next-month'];

    for (var i = 0, len = dateData.length; i < len; i++) {
      var data = dateData[i];

      if (i % countOfRow === 0) {
        $view.push('<tr>');
      }

      $view.push('<td class="' + TD_CLASS_LIST[data.classIndex] + '"><span>' + data.date + '</span></td>');

      if (i % countOfRow === countOfRow - 1) {
        $view.push('</tr>');
      }
    }

    this.$dateTable.querySelector('tbody').innerHTML = $view.join('');
  };

  DatePicker.prototype.reRenderDateData = function () {
    var dateData = this.state.dateData;
    var $tdArr = this.$dateTable.querySelectorAll('tbody tr td');
    var TD_CLASS_LIST = ['available', 'prev-month', 'next-month'];
    for (var i = 0, len = dateData.length; i < len; i++) {
      var data = dateData[i];
      var $td = $tdArr[i];
      $td.className = TD_CLASS_LIST[data.classIndex];
      $td.innerHTML = '<span>' + data.date + '</span>';
    }
    this.changeDateTableHeaderView();
  };

  DatePicker.prototype.renderMonthData = function () {
    var $view = [];
    var monthData = this.state.monthData;
    var countOfRow = 4;

    for (var i = 0, len = monthData.length; i < len; i++) {
      if (i % countOfRow === 0) {
        $view.push('<tr>');
      }

      $view.push('<td><span>' + monthData[i].label + '</span></td>');

      if (i % countOfRow === countOfRow - 1) {
        $view.push('</tr>');
      }
    }

    this.$monthTable.querySelector('tbody').innerHTML = $view.join('');
  };

  DatePicker.prototype.reRenderMonthData = function () {
    // view does not need to be changed
    this.changeMonthTableHeaderView();
  };

  DatePicker.prototype.renderYearData = function () {
    var $view = [];
    var yearData = this.state.yearData;
    var countOfRow = 4;
    var amount = 12;

    for (var i = 0; i < amount; i++) {
      if (i % countOfRow === 0) {
        $view.push('<tr>');
      }

      $view.push('<td><span>' + (yearData[i] || '') + '</span></td>');

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
      $td.innerHTML = '<span>' + data + '</span>';
    }
    this.changeYearTableHeaderView();
  };

  DatePicker.prototype.initEvent = function () {
    this.$showMonth.addEventListener('click', this.changeMonthView.bind(this));
    this.$showYear.addEventListener('click', this.changeYearView.bind(this));
    this.$prevYear.addEventListener('click', this.doPrevYear.bind(this));
    this.$prevMonth.addEventListener('click', this.doPrevMonth.bind(this));
    this.$nextMonth.addEventListener('click', this.doNextMonth.bind(this));
    this.$nextYear.addEventListener('click', this.doNextYear.bind(this));
    this.initChooseEvent();
  };

  DatePicker.prototype.initChooseEvent = function () {
    var $elArr = [this.$dateTable, this.$monthTable, this.$yearTable];
    var methodArr = ['onChooseDate', 'onChooseMonth', 'onChooseYear'];
    for (var i = 0, len1 = $elArr.length; i < len1; i++) {
      var $tdArr = $elArr[i].querySelectorAll('tbody tr td');
      for (var j = 0, len2 = $tdArr.length; j < len2; j++) {
        $tdArr[j].addEventListener('click', this[methodArr[i]].bind(this, j));
      }
    }
  };

  DatePicker.prototype.onChooseDate = function (index) {
    var data = this.state.dateData[index];
    var newDate = data.date;
    var newMonth = data.month;
    var newYear = data.year;
    this.state.date = newDate;
    this.state.month = newMonth;
    this.state.year = newYear;
    var value = newYear + '-' + newMonth + '-' + newDate;
    this.$input.value = value;
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
    this.$showYear.innerHTML = this.state.year + '年';
    this.$showMonth.innerHTML = pad(this.state.month, '0', 2) + '月';
  };

  DatePicker.prototype.changeMonthView = function () {
    this.changeView(1);
    this.renderForShowStatus();
  };

  DatePicker.prototype.changeMonthTableHeaderView = function () {
    if (!this.isMonthView()) {
      return;
    }
    this.$showYear.innerHTML = this.state.year + ' 年';
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
    var minYear = yearData[0]; var maxYear = yearData[yearData.length - 1];
    this.$showYear.innerHTML = minYear + ' 年 - ' + maxYear + ' 年';
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

  DatePicker.prototype.isDateView = function () {
    return this.state.showStatus === 0;
  };

  DatePicker.prototype.isMonthView = function () {
    return this.state.showStatus === 1;
  };

  DatePicker.prototype.isYearView = function () {
    return this.state.showStatus === 2;
  };

  DatePicker.prototype.clearDateData = function () {
    this.state.dateData = [];
  };

  DatePicker.prototype.clearYearData = function () {
    this.state.yearData = [];
  };

  DatePicker.prototype.getDom = function (selector) {
    return this.$datePicker.querySelector(selector);
  };

  DatePicker.prototype.isValidClick = function ($target) {
    var $node = $target;
    while ($node) {
      if ($node === this.$datePicker || $node === this.$input) {
        return false;
      }
      $node = $node.parentNode;
    }
    return true;
  };

  //  ---------------- tiny datepicker  ----------------
  var tinyDatePicker = {};

  tinyDatePicker.init = function (selectors, options) {
    var elements = document.querySelectorAll(selectors);
    for (var i = 0, len = elements.length; i < len; i++) {
      new DatePicker(elements[i], options);
    }
  };

  return tinyDatePicker;
}));
