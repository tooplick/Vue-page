# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site for "TOOPLICK" built with Vue 3 + Vite. No TypeScript — all `.vue` files use `<script setup>` with plain JavaScript. No testing, no linting config, no state management.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

## Architecture

**App shell** (`App.vue`): Wraps everything in `<ClickSpark>` → `<PixelSnow>` (fixed WebGL background) → navbar → `<router-view>`. Watches route changes to call `ScrollTrigger.refresh()`.

**Routes** (eagerly loaded, HTML5 history mode):
- `/` — Home (SplitText hero, ScrollFloat, ScrollReveal)
- `/projects` — WebGL 2 icosahedron sphere menu (InfiniteMenu)
- `/projects/:id` — Project detail (ScrambleText, CountUp stars)
- `/about` — Bio + tech logos (BlurText, LogoLoop)
- `/:pathMatch(.*)*` — 404 (GlitchText)

**Project data**: Static in `src/data/projects.js`. Images stored in `public/projects/`.

## Animation Libraries

| Library | Components | Notes |
|---------|-----------|-------|
| **Three.js** | `PixelSnow.vue` | GLSL shader snowfall, fixed background, pointer-events none |
| **GSAP + ScrollTrigger** | `SplitText`, `ScrollFloat`, `ScrollReveal` | Use `gsap.context()` for cleanup, `once: true` on ScrollTrigger, `ScrollTrigger.refresh()` on route change |
| **motion-v** | `BlurText.vue` | Vue port of Framer Motion, triggers on IntersectionObserver |
| **gl-matrix** | `InfiniteMenu.vue` | WebGL 2 instanced rendering, ArcballControl, texture atlasing |
| **Pure JS/CSS** | `ClickSpark`, `ScrambleText`, `CountUp`, `LogoLoop`, `GlitchText` | Canvas 2D, requestAnimationFrame, CSS keyframes |

## Key Patterns

- **GSAP components**: Split text → `gsap.set()` initial state → `ScrollTrigger({ once: true, onEnter })` → `gsap.to()` with stagger → `gsap.context().revert()` on unmount
- **WebGL cleanup**: InfiniteMenu uses `cancelAnimationFrame` + `WEBGL_lose_context` extension in `destroy()`. WorldMatrix must be initialized BEFORE `init()` since `onInit` callback triggers `run()`.
- **InfiniteMenu**: `alpha: true` for transparent canvas background. Scale prop controls camera distance and sphere size.
- **Route transitions**: App.vue watches `route.path` and calls `ScrollTrigger.refresh()` after nextTick + 150ms delay

## Dependencies

`vue`, `vue-router`, `three`, `gsap`, `gl-matrix`, `motion-v`
