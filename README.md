# 个人作品集网站 — TOOPLICK

> 前端开发期末作业

## 项目简介

本项目是一个基于 **Vue 3 + Vite** 构建的个人作品集（Portfolio）网站，用于展示个人项目、开源贡献及常用服务入口。网站采用深色极简风格，融合了多种 Web 动画技术（WebGL、GSAP、Canvas 2D、CSS 动画等），在视觉表现和交互体验上进行了较为深入的探索。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 |
| 构建工具 | Vite |
| 路由 | Vue Router |
| 3D 渲染 | Three.js |
| 动画 | GSAP |
| 动画 | motion-v |
| 3D 数学 | gl-matrix |
| Markdown | marked |

## 页面结构

| 路径 | 页面 |
|------|------|
| `/` | 首页 |
| `/projects` | 项目列表 |
| `/projects/:id` | 项目详情 |
| `/portal` | 服务门户 |
| `/:pathMatch(.*)*` | 404 |

```

## 运行方式

```bash
# 安装依赖
npm install

# 启动开发服务器（支持 HMR 热更新）
npm run dev

# 生产构建（输出到 dist/）
npm run build

# 预览生产构建
npm run preview
```

## 部署

项目已配置 `public/_redirects` 文件，支持 SPA 单页应用部署到 Cloudflare Pages / Netlify 等静态托管平台：

```
/*    /index.html   200
```

生产构建输出到 `dist/` 目录，直接上传即可。

## 总结

本项目通过一个完整的个人作品集网站，实践了以下前端开发技能：

1. **Vue 3 组合式 API** — `<script setup>`、响应式数据、生命周期钩子、路由守卫
2. **单页应用路由** — Vue Router 动态路由、路由监听、滚动行为控制
3. **WebGL / Three.js** — GLSL 着色器编写、WebGL 2 实例化渲染、3D 数学（矩阵、四元数）
4. **Canvas 2D 动画** — requestAnimationFrame 驱动的粒子系统和像素网格动画
5. **GSAP 动画库** — ScrollTrigger 滚动触发动画、SplitText 文字拆分动画
6. **第三方 API 集成** — GitHub API 实时数据获取与动画联动
7. **响应式设计与 CSS** — 滚动吸附、隐藏滚动条、全局暗色主题
8. **组件化开发** — 14 个可复用组件，涵盖 Canvas / WebGL / CSS / JS 多种渲染方案
