/* eslint-env jest */
const diyDatePicker = require('../src/diy-date-picker.js');

describe('diy-date-picker', function () {
  beforeEach(function () {
    document.body.innerHTML = '';
    document.querySelectorAll('.diy-date-picker__wrapper').forEach(function (node) {
      node.parentNode.removeChild(node);
    });
  });

  afterEach(function () {
    document.body.innerHTML = '';
    document.querySelectorAll('.diy-date-picker__wrapper').forEach(function (node) {
      node.parentNode.removeChild(node);
    });
  });

  test('init sets and gets date with default format', function () {
    document.body.innerHTML = '<input id="dp" />';
    diyDatePicker.init('#dp');

    diyDatePicker.setDate('#dp', new Date(2019, 7, 15));
    expect(diyDatePicker.getDate('#dp')[0].getFullYear()).toBe(2019);
    expect(diyDatePicker.getDate('#dp')[0].getMonth()).toBe(7);
    expect(diyDatePicker.getDate('#dp')[0].getDate()).toBe(15);
    expect(document.getElementById('dp').value).toBe('2019-08-15');

    diyDatePicker.destroy('#dp');
  });

  test('re-init destroys previous instance', function () {
    document.body.innerHTML = '<input id="dp" />';
    diyDatePicker.init('#dp');
    diyDatePicker.show('#dp');

    expect(document.querySelectorAll('.diy-date-picker__wrapper').length).toBe(1);

    diyDatePicker.init('#dp');
    diyDatePicker.show('#dp');

    expect(document.querySelectorAll('.diy-date-picker__wrapper').length).toBe(1);

    diyDatePicker.destroy('#dp');
  });

  test('init accepts NodeList with multiple elements', function () {
    document.body.innerHTML = '<input class="dp" /><input class="dp" />';
    var nodeList = document.querySelectorAll('.dp');

    diyDatePicker.init(nodeList);
    diyDatePicker.setDate(nodeList, new Date(2020, 0, 1));

    expect(diyDatePicker.getDate(nodeList).length).toBe(2);
    expect(document.querySelectorAll('.dp')[0].value).toBe('2020-01-01');
    expect(document.querySelectorAll('.dp')[1].value).toBe('2020-01-01');

    diyDatePicker.destroy(nodeList);
  });

  test('throws when container has no input', function () {
    document.body.innerHTML = '<div id="wrapper"></div>';

    expect(function () {
      diyDatePicker.init('#wrapper');
    }).toThrow('diy-date-picker: input element is required.');
  });

  test('parses manual input according to format on blur', function () {
    document.body.innerHTML = '<input id="dp" />';
    diyDatePicker.init('#dp', { format: 'mm/dd/yyyy' });

    var input = document.getElementById('dp');
    input.focus();
    input.value = '08/15/2019';
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    var date = diyDatePicker.getDate('#dp')[0];
    expect(date.getFullYear()).toBe(2019);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(15);

    diyDatePicker.destroy('#dp');
  });

  test('marks december dates as prev-month when viewing january', function () {
    document.body.innerHTML = '<input id="dp" />';
    diyDatePicker.init('#dp');

    diyDatePicker.setDate('#dp', new Date(2024, 0, 10));
    diyDatePicker.show('#dp');

    var prevMonthCells = document.querySelectorAll('.diy-date-picker__date-table td.prev-month');
    expect(prevMonthCells.length).toBeGreaterThan(0);

    var hasDecember31AsPrevMonth = Array.from(document.querySelectorAll('.diy-date-picker__date-table td')).some(function (td) {
      return td.textContent === '31' && td.classList.contains('prev-month');
    });
    expect(hasDecember31AsPrevMonth).toBe(true);

    diyDatePicker.destroy('#dp');
  });

  test('en-US locale can be registered and used', function () {
    diyDatePicker.langs['en-US'] = {
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      today: 'Today',
      clear: 'Clear',
      format: 'mm/dd/yyyy',
      monthTitle: 'MM',
      yearTitle: 'yyyy',
      titleExchange: true,
      weekStart: 0
    };

    document.body.innerHTML = '<input id="dp" />';
    diyDatePicker.init('#dp', { lang: 'en-US', format: 'mm/dd/yyyy' });
    diyDatePicker.setDate('#dp', new Date(2019, 7, 15));

    expect(document.getElementById('dp').value).toBe('08/15/2019');

    diyDatePicker.destroy('#dp');
  });
});
