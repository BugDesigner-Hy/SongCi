# 宋词卡片 · Songci Card

[![Live Demo](https://img.shields.io/badge/Live%20Demo-bugdesigner--hy.github.io%2FSongCi-6CA6CD?style=flat-square)](https://bugdesigner-hy.github.io/SongCi/)
[![License: MIT](https://img.shields.io/badge/License-MIT-e16c6c?style=flat-square)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?style=flat-square)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646cff?style=flat-square)](https://vitejs.dev/)

> 把一首唐诗或宋词，一键排成一张可以保存、可以分享的水墨诗卡。

**🔗 在线预览：<https://bugdesigner-hy.github.io/SongCi/>**（手机浏览效果最佳）

一个纯前端的诗歌卡片生成器。输入诗名、朝代、作者与正文，页面以传统诗笺的版式渲染；
底部叠加分层波动的水波背景，配色取中国传统色；点击诗句可随时改写，点右上角导出按钮
即可把当前画面保存为高清 PNG。

## 功能特性

- **诗卡排版**：唐诗居中排布，宋词按空行自动分段；字号随总字数自适应，长调自动缩小
- **动态水波**：SVG 多层正弦波逐帧动画，振幅与基线逐层递减，形成远近层次
- **传统配色**：内置一组中国传统色（靛蓝、黛绿、藕荷、鹅黄等），点击波浪随机换色
- **随时改词**：点击诗句弹出输入框，支持唐诗 / 宋词一键切换，自动清理行内空格
- **导出图片**：基于 html2canvas 按设备像素比导出 PNG，导出前等待字体加载完成
- **移动端适配**：整屏卡片式布局，锁定页面滚动，贴合手机阅读与截图习惯

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | Vue 3（`<script setup>` 组合式 API） |
| 构建 | Vite 4 + `@vitejs/plugin-vue` |
| 路由 | Vue Router 4（hash 模式，便于静态托管） |
| 导出 | html2canvas 1.4 |
| 图形 | 原生 SVG 路径动画（requestAnimationFrame） |
| 字体 | 京華老宋体（KingHwa OldSong，免费商用） |

## 快速开始

```bash
npm install
npm run dev      # 本地开发
npm run build    # 构建，产物输出到 dist/
npm run serve    # 预览构建结果
```

## 目录结构

```
src/
├─ components/
│  ├─ PoemCard.vue   # 诗卡：标题、正文、朝代 / 作者标签，宋词分段与字号自适应
│  ├─ WaveBg.vue     # 水波背景：多层 SVG 正弦波 + 随机换色
│  └─ InputBox.vue   # 内容录入：类型 / 朝代 / 诗名 / 作者 / 正文
├─ views/Home.vue    # 整屏页面：弹窗、提交处理、PNG 导出
├─ router/index.js   # 单页路由
├─ assets/
│  ├─ fonts.css      # @font-face 声明
│  └─ songti.ttf     # 京華老宋体字体文件
└─ main.js
```

## 部署

推送 `main` 即触发 GitHub Actions 自动构建并发布到 GitHub Pages：

<https://bugdesigner-hy.github.io/SongCi/>

项目页发布在 `/SongCi/` 子路径下，因此 `vite.config.js` 在构建时把 `base` 设为 `'/SongCi/'`，
开发服务器仍使用 `'/'`。若改用自定义域名或用户名站点（`bugdesigner-hy.github.io`），
需要把构建时的 `base` 改回 `'/'`。

路由使用 hash 模式，无需额外的 404 回退配置，子路径下刷新、直达均正常。

## 授权说明

- **字体**：界面字体采用**京華老宋体**（KingHwa OldSong）。作者声明免费商用，可嵌入软件与网页，
  但**不可单独作为字体文件出售**，请勿修改字形或传播改版文件。
  字体文件较大（约 35 MB），如仅需本地调试可自行替换为系统字体。
- **代码**：采用 [MIT License](LICENSE)，可自由使用、修改、分发与商用，保留版权声明即可。
- **范围**：MIT 仅覆盖源代码；字体遵循作者自身的授权声明，两者相互独立。
