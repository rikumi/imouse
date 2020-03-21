# IMouse

~~你的这台电脑，不再是电脑。~~[[1](https://www.apple.com/ipad-pro/)]

![](https://img.shields.io/npm/v/imouse) ![](https://img.shields.io/github/last-commit/rikumi/imouse)

## 介绍

PC（含 Mac）GUI 的世界中，几十年没有改变的设计有两个：一个是窗口，另一个是鼠标指针。传统的鼠标指针设计固然高效，但它经常引起我们的无端思考：为什么是一个箭头？为什么链接的指针是一个手？为什么箭头往左歪？

新 iPad Pro 的触摸板体验（参见[这篇文章](https://sspai.com/post/59569)）让我们眼前一亮，其中就包含了对鼠标指针的重新思考。也许这不是比传统鼠标指针更好的设计，但至少是推翻它的一次大胆尝试。

IMouse 是一个 Web 前端小插件，只需动动手指，就能在你的页面上引入这样的鼠标效果。

## 在线体验

[https://rikumi.github.io/](https://rikumi.github.io/)

## 已实现功能

- 普通圆形鼠标指针（带毛玻璃效果）；
- 选择文字时变为垂直光标（不支持悬浮在文字上方时变为垂直光标）；
- 悬浮在链接上方时框住链接，支持自定义代表链接的 selector；
- 按下时缩小变色效果；
- 指针颜色、大小、动画时长等基本参数定制。

## 已知问题

- 不支持自动切换深色/浅色光标；
- 会卡在 `iframe` 外侧（跨域 `iframe` 由于浏览器限制无法支持；非跨域 `iframe` 需要通信，暂不实现）；
- 在较大的链接元素上 hover 体验不佳。

## 引入方式

- NPM 引入：

```js
import IMouse from 'imouse';

IMouse.init(options);
```

- Script 引入：

首先下载 [imouse.js](https://raw.githubusercontent.com/rikumi/imouse/master/dist/index.js) 并下发。

```html
<script src="imouse.js"></script>
<script>
    window.addEventListener('DOMContentLoaded', () => IMouse.default.init(options));
</script>
```

## 文档

### `IMouse.init(options: IMouseProps): IMouse` 

初始化 IMouse 并指定参数。

| 属性 | 类型 | 默认值 | 描述 |
| - | - | - | - |
| defaultBackgroundColor | string | `'rgba(30, 111, 255, .1)'` | 非 hover 默认状态下的光标背景颜色，CSS 格式 |
| activeBackgroundColor | string | `'rgba(30, 111, 255, .2)'` | 非 hover 按下状态下的光标背景颜色，CSS 格式 |
| defaultSize | number | `20` | 非 hover 默认状态下的光标直径 |
| activeSize | number | `15` | 非 hover 按下状态下的光标直径 |
| hoverPadding | number | `8` | hover 状态下的光标 padding 大小 |
| activePadding | number | `4` | hover 按下状态下的光标 padding 大小 |
| hoverRadius | number | `8` | hover 状态下的光标圆角半径 |
| activeRadius | number | `4` | hover 按下状态下的光标圆角半径 |
| selectionWidth | number | `3` | 文字选择状态下的光标宽度 |
| selectionHeight | number | `40` | 文字选择状态下的光标高度 |
| selectionRadius | number | `2` | 文字选择状态下的光标圆角半径 |
| hoverSelector | string | `'a, button, input[type="button"], input[type="checkbox"], input[type="radio"], input[type="file"], input[type="submit"]'` | 允许 hover 的元素，CSS 选择器格式 |
| normalTransitionDuration | number | `200` | 非 hover 状态下的动效时长，单位 ms |
| hoverTransitionDuration | number | `50` | 值越大，甩动光标时发生的抖动越强烈 |
| blurRadius | number | `10` | 非 hover 状态下的光标毛玻璃半径 |
| glowRadius | number | `200` | hover 状态下的光标发光点半径 |
| style | React.CSSProperties | `{}` | 光标的附加样式 |
| zIndex | number | `10000` | Z 轴层级 |

## `IMouse#destroy()`

销毁 IMouse 实例并恢复原始鼠标指针。