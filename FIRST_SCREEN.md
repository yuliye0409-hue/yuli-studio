# Yuli Studio / 第 01 屏

这一版只包含首屏开幕，不加载旧的作品区、键盘场景或旧 Hero。

## 01. 文字开幕

文件：`index.html` 与 `styles.css` 的 `01. OPENING LOGO`。

- 修改 `YULI` 或 `Studio`：编辑 `index.html` 的 `.launch__word` 和 `.launch__studio`。
- 改文字大小：编辑 `.launch__word` 与 `.launch__studio` 的 `font-size`。
- 改文字动画速度：编辑四个 `animation-delay`，或 `letter-in` / `studio-in` 的持续时间。

## 02. 蜂窝金属背景

文件：`styles.css` 的 `02. HONEYCOMB METAL FIELD`，底图为 `assets/second-background-4k.png`（由参考图生成的 3840×2160 资源）。

- 背景底色为纯黑；蜂窝纹理由 Canvas 实时绘制，只在鼠标拖尾经过的位置显示。
- 页面不再使用参考图中固定的银色斜向亮带，银色光效完全由鼠标轨迹实时生成。
- 改背景视差幅度：调整 `script.js` 中 `-.035` 和 `-.025`。
- 改蜂窝单元大小：调整 `script.js` 中 `radius` 的计算。
- 蜂窝纹理只绘制六边形线条，不填充单元内部；改线条深浅可调整 `drawHoneycombTexture()` 中的 `strokeStyle`。
- 改拖尾晕染范围：调整 `render()` 中的 `radius`、`blur` 和 `wobble`。

## 03. 幽灵光效

文件：`script.js` 的 `03. GHOST LIGHT CONTROLLER`。

- 这里没有可见的箭头光标；鼠标轨迹只作为背景光效路径使用。
- 鼠标移动会记录一串路径点，路径上的银色光效和蜂窝纹理同步显示。
- 路径点约 `1450ms` 后淡出，未经过区域回到纯黑背景。
- 改拖尾长度：调整 `script.js` 中的 `TRAIL_LIFE`。
- 改光带大小：调整 `render()` 内的 `radius`。
- 画布渲染使用当前设备像素比，最高限制为 3840×2160，避免大屏出现低清放大。

## 04. 开幕结束状态

文件：`script.js` 的 `04. LAUNCH CONTROLLER`。

- 改开幕时长：调整 `INTRO_DURATION`，单位是毫秒。
- 当前逻辑：开幕文字出现后，约 2.2 秒激活蜂窝背景、幽灵光标和四角信息。
- 点击 `SKIP INTRO`，或按 `Enter` / `Esc`，可直接结束开幕。

## 后续衔接

下一屏只需要在 `index.html` 的 `</main>` 后面增加一个新的 `<section>`，并用新编号独立处理，例如：

```html
<section class="work-screen" id="work">...</section>
```

第 01 屏不依赖后续作品区，可以单独调整和验收。

## 05. 作品展示屏

文件：`index.html`、`styles.css` 与 `work.js`。

- 作品素材统一放在 `assets/portfolio/`。
- 在 `.work-card` 上修改 `data-category`、`data-title`、`data-type`、`data-description` 和 `data-image`，即可添加或替换作品。
- `work.js` 负责筛选、卡片悬停视差、滚动揭示和项目详情弹层。
- 简历入口使用 `assets/portfolio/resume.pdf`，替换该文件即可更新下载内容。
