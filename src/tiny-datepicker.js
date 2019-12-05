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

  //  ---------------- datepicker  ----------------
  function DatePicker (el, options) {
    this.$el = el;
    this.$datePicker = null;
    this.state = {
      showStatus: 0, // 0 -> date, 1 -> month, 2 -> year
      dateData: [],
      monthData: [],
      yearData: [],
      date: null,
      month: null,
      year: null
    };
  }

  DatePicker.prototype.init = function () {
    this.initData();
    this.initRender();
    this.initEvent();
  };

  DatePicker.prototype.initData = function () {
    this.initDateData();
    this.initMonthData();
    this.initYearData();
  };

  DatePicker.prototype.initDateData = function (year, month) {
    var thisYear = year;
    var thisMonth = month;

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

    // clear
    this.clearData();

    if (firstDayOfThisMonth === 0) {
      for (var i = 6; i >= 0; i--) {
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
      var date, tmpMonth, tmpYear;
      var classIndex = 0; // 0 -> available, 1 -> prev-month, 2 -> next-month

      if (j < firstDayOfThisMonth) { // last month
        date = dayCountOfLastMonth - firstDayOfThisMonth + j + 1;
        tmpMonth = lastMonth;
        tmpYear = lastMonthOfYear;
        classIndex = 1;
      } else if (j > dayCountOfThisMonth + firstDayOfThisMonth - 1) { // next month
        date = j - dayCountOfThisMonth - firstDayOfThisMonth + 1;
        tmpMonth = nextMonth;
        tmpYear = nextMonthOfYear;
        classIndex = 2;
      } else { // this month
        date = j - firstDayOfThisMonth + 1;
        tmpMonth = thisMonth;
        tmpYear = thisYear;
      }

      this.state.dateData.push({
        day: j % dayCountOfWeek,
        date: date,
        month: tmpMonth,
        year: tmpYear,
        classIndex: classIndex
      });
    }

    this.state.month = thisMonth;
    this.state.year = thisYear;
  };

  DatePicker.prototype.initMonthData = function () {
    this.state.monthData = [
      '一月', '二月', '三月', '四月',
      '五月', '六月', '七月', '八月',
      '九月', '十月', '十一月', '十二月'
    ];
  };

  DatePicker.prototype.initYearData = function () {

  };

  DatePicker.prototype.initView = function () {
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
      '<thead>',
      '<tr>',
      '<th>日</th>',
      '<th>一</th>',
      '<th>二</th>',
      '<th>三</th>',
      '<th>四</th>',
      '<th>五</th>',
      '<th>六</th>',
      '</tr>',
      '</thead>',
      '<tbody>',
      '</tbody>',
      '</table>',
      '<table class="tiny-datepicker__table tiny-datepicker__year-table" style="display:none">',
      '<tbody>',
      '<tr><td>2010</td><td>2011</td><td>2012</td><td>2013</td></tr>',
      '<tr><td>2014</td><td>2015</td><td>2016</td><td>2017</td></tr>',
      '<tr><td>2018</td><td>2019</td><td></td><td></td></tr>',
      '</tbody>',
      '</table>',
      '<table class="tiny-datepicker__table tiny-datepicker__month-table" style="display: none">',
      '<tbody>',
      '<tr><td>一月</td><td>二月</td><td>三月</td><td>四月</td></tr>',
      '<tr><td>五月</td><td>六月</td><td>七月</td><td>八月</td></tr>',
      '<tr><td>九月</td><td>十月</td><td>十一月</td><td>十二月</td></tr>',
      '</tbody>',
      '</table>',
      '</div>'].join('');
    return $view;
  };

  DatePicker.prototype.initRender = function () {
    this.$datePicker = document.createElement('div');
    this.$datePicker.className = 'tiny-datepicker__wrapper';
    this.$datePicker.innerHTML = this.initView();
    this.renderDateData();
    document.body.appendChild(this.$datePicker);
  };

  DatePicker.prototype.initEvent = function () {
    this.$datePicker.querySelector('.tiny-datepicker__year-table').addEventListener('click', this.changeYearView.bind(this));
    this.$datePicker.querySelector('.tiny-datepicker__month-table').addEventListener('click', this.changeMonthView.bind(this));
    this.$datePicker.querySelector('.tiny-datepicker__prev-year').addEventListener('click', this.doPrevYear.bind(this));
    this.$datePicker.querySelector('.tiny-datepicker__prev-month').addEventListener('click', this.doPrevMonth.bind(this));
    this.$datePicker.querySelector('.tiny-datepicker__next-month').addEventListener('click', this.doNextMonth.bind(this));
    this.$datePicker.querySelector('.tiny-datepicker__next-year').addEventListener('click', this.doNextYear.bind(this));
  };

  DatePicker.prototype.renderDateData = function () {
    var $view = [];
    var dateData = this.state.dateData;
    var year = this.state.year;
    var month = this.state.month;
    var tdClassList = ['available', 'prev-month', 'next-month'];

    for (var i = 0, len = dateData.length; i < len; i++) {
      var data = dateData[i];

      if (i % 7 === 0) {
        $view.push('<tr>');
      }

      $view.push('<td class="' + tdClassList[data.classIndex] + '"><span>' + data.date + '</span></td>');

      if (i % 7 === 6) {
        $view.push('</tr>');
      }
    }
    this.$datePicker.querySelector('.tiny-datepicker__show-year').innerHTML = year + '年';
    this.$datePicker.querySelector('.tiny-datepicker__show-month').innerHTML = pad(month, '0', 2) + '月';
    this.$datePicker.querySelector('tbody').innerHTML = $view.join('');
  };

  DatePicker.prototype.changeYearView = function () {
    this.changeView(2);
  };

  DatePicker.prototype.changeMonthView = function () {
    this.changeView(1);
  };

  DatePicker.prototype.changeView = function (showStatus) {
    this.state.showStatus = showStatus;
    switch (showStatus) {
    case 0:
      break;
    case 1:
      break;
    case 2:
      break;
    }
  };

  DatePicker.prototype.doPrevMonth = function () {
    this.initDateData(this.state.year, this.state.month - 1);
    this.renderDateData();
  };

  DatePicker.prototype.doNextMonth = function () {
    this.initDateData(this.state.year, this.state.month + 1);
    this.renderDateData();
  };

  DatePicker.prototype.doPrevYear = function () {
    this.initDateData(this.state.year - 1, this.state.month);
    this.renderDateData();
  };

  DatePicker.prototype.doNextYear = function () {
    this.initDateData(this.state.year + 1, this.state.month);
    this.renderDateData();
  };

  DatePicker.prototype.clearData = function () {
    this.state.dateData = [];
  };

  //  ---------------- tiny datepicker  ----------------
  var tinyDatePicker = {};

  tinyDatePicker.init = function (selectors, options) {
    var elements = document.querySelectorAll(selectors);
    for (var i = 0, len = elements.length; i < len; i++) {
      new DatePicker(elements[0], options);
    }
  };

  new DatePicker().init();

  return tinyDatePicker;
}));
