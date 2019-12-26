# tiny-datepicker

一个用原生的 JavaScript 实现的小巧日期选择器 tiny-datepicker。

## 兼容性

## 演示

## 安装

## 快速开始

以下是受支持的HTML标签的示例。它们本身不会提供日期选择器功能，您需要在该标签上实例化日期选择器。

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
weekStart | number | 0 | 配置一周的开始。0（星期天）到6（星期六）。
zIndex | number | 2019 | 日期选择器显示时其css中z-index属性的值。

## 方法

### init

这是 `tiny-datepicker` 的初始化方法，它接受两个参数：`selectors` 和 `options`。

```javascript
tinyDatePicker.init('#datepicker', {
  clearable: true
});
```

其中，`selectors` 参数可以是有效的 `css` 选择器字符串，也可以是 `NodeList` 的实例，也可以是 `HTMLCollection` 的实例，也可以是 `HTMLElement` 的实例。`options` 就是上述提到的 options 配置。

> **注意：** 以下所有方法中的参数 `selectors` 定义和 `init` 方法中定义的一致。

### destroy

这是 `tiny-datepicker` 的销毁方法，它接受一个参数：`selectors`。

```javascript
tinyDatePicker.destroy('#datepicker');
```

### show

这是 `tiny-datepicker` 的显示方法，它接受一个参数：`selectors`。

```javascript
tinyDatePicker.show('#datepicker');
```

### hide

这是 `tiny-datepicker` 的隐藏方法，它接受一个参数：`selectors`。

```javascript
tinyDatePicker.hide('#datepicker');
```

### setDate

这是 `tiny-datepicker` 的设置日期方法，它接受两个参数：`selectors` 和 `newDate`。`newDate` 可以是合法的 `Date` 的实例，也可以是数字类型的时间戳（`timestamp`） ，也可以能被 `new Date` 正确解析的日期字符串。

```javascript
tinyDatePicker.setDate('#datepicker', '2019-08-15');
```

### getDate

这是 `tiny-datepicker` 的获取日期方法，它接受一个参数：`selectors` 。这里需要强调的是，该函数返回的是一个日期数组，里面包含的是可能是多个 `selectors` 返回的日期；如果 `selectors` 实例只有一个，那么返回的日期数组长度为1.

```javascript
tinyDatePicker.setDate('#datepicker');
```

### clearDate

这是 `tiny-datepicker` 的清除日期方法，它接受一个参数：`selectors` 。

```javascript
tinyDatePicker.clearDate('#datepicker');
```

## 皮肤

## 国际化

## 参考

## 许可证

MIT