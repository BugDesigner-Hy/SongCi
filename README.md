# 砚边

[![Live Demo](https://img.shields.io/badge/Live%20Demo-bugdesigner--hy.github.io%2FSongCi-6CA6CD?style=flat-square)](https://bugdesigner-hy.github.io/SongCi/)
[![License: MIT](https://img.shields.io/badge/License-MIT-e16c6c?style=flat-square)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?style=flat-square)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646cff?style=flat-square)](https://vitejs.dev/)

> 坐在砚边，把一首唐诗、宋词或元曲，排成一张可以留下的诗笺。

**在线预览：<https://bugdesigner-hy.github.io/SongCi/>**

砚边是一张整屏诗笺。可以从开源词库里选一首唐诗、宋词或元曲，也可以自己写。
换一首或自动换诗时，三种体裁随机出现：唐诗横排，宋词竖排，元曲横排。
朝代和作者落在一枚红色小印上。底部水波在中国传统色之间慢慢渐变，左上角的标记跟着主色走。
可以收藏整首或其中一句，也可以复制词句，或把整张画面保存成图片。

## 功能

- **词库**：唐诗三百首、宋词三百首、元曲小令，可搜索后点选；没有想要的可以自己写
- **换诗**：更求一首，或听其自更。唐诗、宋词、元曲随机出现。旧诗打散淡去，新诗再聚拢过来
- **排版**：唐诗一行一句，宋词按上下阕，元曲按小令断句。换诗时唐诗、元曲默认横排，宋词默认竖排。手动改过的横竖会保持到下一次换诗；从词库里自己点选的，仍沿用当前横竖
- **收藏**：整首可藏入箧中。点一句未收藏的句子，句旁出现葫芦，可只藏这一句；竖排时葫芦在句子上方。已收藏的句子有一条红线，双击该句即可撤下
- **落款**：朝代与作者共用一枚红印。离开时红底先褪、字再走；出现时字先到位，红底再渗开
- **水波**：多层波浪在天青、天水碧、竹青、缃色、杏黄、藕色、雪青、群青之间缓慢渐变。左上角标记与最前面一层波浪同色
- **色笺**：右下角竖排标出当前主色，衬一张素纸签。只在颜色真正变换时出现
- **工具栏**：首次打开是收起的，之后记住收起或铺开
- **复制与保存**：复制带题名和落款的词句；图片文件名为「诗词名-朝代-作者」
- **新标签页**：可打包成 Chrome / Edge 扩展，用砚边替换空白新标签页

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | Vue 3（`<script setup>` 组合式 API） |
| 构建 | Vite 4 + `@vitejs/plugin-vue` |
| 路由 | Vue Router 4（hash 模式，便于静态托管） |
| 导出 | html2canvas 1.4 |
| 图形 | 原生 SVG 路径动画（requestAnimationFrame） |
| 字体 | 京華老宋体（KingHwa OldSong，免费商用） |
| 词库 | [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry)（MIT） |

## 快速开始

```bash
npm install
npm run dev       # 本地开发
npm run build     # 构建网站，产物输出到 dist/
npm run build:ext # 构建浏览器扩展，产物输出到 extension/（不纳入版本库）
npm run serve     # 预览网站构建结果
```

## 目录结构

```
src/
├─ components/
│  ├─ PoemCard.vue   # 诗笺：横竖排、落款红印
│  ├─ WaveBg.vue     # 水波：传统色渐变，右下角色笺
│  └─ InputBox.vue   # 词库选择与手写
├─ views/Home.vue    # 整屏页面：工具栏、复制、保存图片
├─ utils/typeset.js  # 唐诗、宋词、元曲的断行与分片
├─ data/library.json # 精简后的词库
├─ router/index.js   # 单页路由
├─ assets/
│  ├─ fonts.css      # @font-face 声明
│  └─ songti.ttf     # 京華老宋体字体文件
└─ main.js
```

## 部署

推送 `main` 即触发 GitHub Actions 自动构建并发布到 GitHub Pages：

<https://bugdesigner-hy.github.io/SongCi/>

页面名称是砚边。站点仍发布在 `/SongCi/` 子路径下，因此 `vite.config.js` 在构建时把 `base` 设为 `'/SongCi/'`，
开发服务器仍使用 `'/'`。若改用自定义域名或用户名站点（`bugdesigner-hy.github.io`），
需要把构建时的 `base` 改回 `'/'`。

路由使用 hash 模式，无需额外的 404 回退配置，子路径下刷新、直达均正常。

### 浏览器新标签页

`npm run build:ext` 使用相对路径，把扩展写到 `extension/`。在 Chrome 或 Edge 打开扩展管理页，打开开发者模式，选择「加载未打包的扩展程序」，指向这个目录。之后用新标签页（Ctrl+T）打开的是砚边。已经恢复的旧标签不会被替换。扩展代码有改动时，需重新构建并在扩展页点一次重新加载。

## 授权说明

- **字体**：界面字体采用**京華老宋体**（KingHwa OldSong）。作者声明免费商用，可嵌入软件与网页，
  但**不可单独作为字体文件出售**，请勿修改字形或传播改版文件。
  字体文件较大（约 35 MB），如仅需本地调试可自行替换为系统字体。
- **词库**：诗句选自 chinese-poetry，采用 MIT。
- **代码**：采用 [MIT License](LICENSE)，可自由使用、修改、分发与商用，保留版权声明即可。
- **范围**：MIT 仅覆盖源代码；字体遵循作者自身的授权声明，两者相互独立。
