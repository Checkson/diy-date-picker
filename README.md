# tiny-datepicker

一个用原生的 JavaScript 实现的、轻量的日期选择器。

## 兼容性

IE10及以上。

> 因为 IE9 中的 table 标签中的 innerHTML 属性是只读的，但是 tiny-datepicker 中大量用到 innerHTML 属性作为写入的操作，考虑到 IE9 迟早都会被淘汰，所以该插件并没有打算兼容 IE9。

## 演示

略。

## 安装

```shell
$ npm install tiny-datepicker --save
```

或者

```shell
$ yarn add tiny-datepicker
```

## 快速开始

以下是受支持的HTML标签的示例。它们本身不会提供日期选择器功能，您需要利用该标签，初始化日期选择器。

### input

这是一个最简单的示例：当input框聚焦、被点击或者被tab聚焦时，都会显示日期选择器。

```html
<input class="input-control" id="datePicker"/>

<script>
  tinyDatePicker.init('#datePicker');
</script>
```

### component

有时候开发者可能需要对一个多标签组合的input组件封装成日期选择器，我们可以：

```html
<div class="input-group">
  <input class="input-control" id="datePicker"/>
  <i class="icon icon-date"></i>
</div>

<script>
  tinyDatePicker.init('.input-group');
</script>
```

> **注意：** input组件中必须包含input标签，因为它是日期选择器必须关联的标签。

## 选项

名称 | 类型 | 默认值 | 描述 
:--- |:--- |:--- |:--- 
clearable | boolean | false | 是否显示“今天”和“清除”按钮
daysOfWeekDisabled | array | [] | 一周中需要禁用的几天，值为0（星期日）到6（星期六）。
disabledDate | function | null | 应该被禁用的日期，参数为当前日期，返回 boolean 值。
defaultValue | Date,number,string | null | 第一次打开日期选择器默认显示的日期。
format | string | yyyy-mm-dd | input标签中的值显示格式。
lang | string | zh-CN | 语言，默认是简体中文。
showWeekDays | boolean | true | 是否把工作日的名称显示在视图中。
templates | object | null | 年份和月份切换图标模版配置。
weekStart | number | 0 | 配置一周的开始，0（星期天）到6（星期六）。
zIndex | number | 2019 | 日期选择器显示时其css中z-index属性的值。

## 方法

### init

初始化日期选择器的方法，它接受两个参数：`selectors` 和 `options`。

```javascript
tinyDatePicker.init('#datepicker', {
  clearable: true
});
```

其中，`selectors` 参数可以是有效的 `css` 选择器字符串，也可以是 `NodeList` 的实例，也可以是 `HTMLCollection` 的实例，也可以是 `HTMLElement` 的实例。`options` 就是上述提到的 options 配置。

> **注意：** 以下所有方法中的参数 `selectors` 定义和 `init` 方法中定义的一致。

### destroy

销毁日期选择器的方法，它接受一个参数：`selectors`。

```javascript
tinyDatePicker.destroy('#datepicker');
```

### show

显示日期选择器的方法，它接受一个参数：`selectors`。

```javascript
tinyDatePicker.show('#datepicker');
```

### hide

隐藏日期选择器的方法，它接受一个参数：`selectors`。

```javascript
tinyDatePicker.hide('#datepicker');
```

### setDate

设置日期的方法，它接受两个参数：`selectors` 和 `newDate`。`newDate` 可以是合法的 `Date` 的实例，也可以是数字类型的时间戳（`timestamp`） ，也可以能被 `new Date` 正确解析的日期字符串。

```javascript
tinyDatePicker.setDate('#datepicker', '2019-08-15');
```

### getDate

获取日期的方法，它接受一个参数：`selectors` 。这里需要强调的是，该函数返回的是一个日期数组，里面包含的是可能是多个 `selectors` 返回的日期；如果 `selectors` 实例只有一个，那么返回的日期数组长度为1.

```javascript
tinyDatePicker.setDate('#datepicker');
```

### clearDate

清除日期的方法，它接受一个参数：`selectors` 。

```javascript
tinyDatePicker.clearDate('#datepicker');
```

## 皮肤

略。

## 国际化

该插件支持国际化。默认是简体中文（zh-CN）。其他可以用的翻译可以在 dist/locales 目录中找到，只需在插件之后引入您想要的语言环境即可。想要添加新的语言，只需要在全局对象 tinyDatePicker.langs 中添加一个语言键值即可。例如：

```javascript
;(function (global) {
  global.tinyDatePicker.langs['zh-CN'] = {
    days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    daysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    daysMin: ['日', '一', '二', '三', '四', '五', '六'],
    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthsShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    today: '今天',
    clear: '清除',
    format: 'yyyy-mm-dd',
    monthTitle: 'mm月',
    yearTitle: 'yyyy年',
    titleExchange: false,
    weekStart: 1
  };
}(window || self));
```

若该目录没有您想要的语言，可以提交添加语言合并的分支，或者在 [issues](https://github.com/Checkson/tiny-datepicker/issues) 提出，作者会及时跟进。

## 参考

- [DatePicker组件开发](https://www.imooc.com/learn/820)
- [bootstrap-datepicker](https://github.com/uxsolutions/bootstrap-datepicker)
- [element-UI/date-picker](https://element.eleme.io/#/zh-CN/component/date-picker)

## 许可证

MIT