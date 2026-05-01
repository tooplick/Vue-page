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

**App shell** (`App.vue`): Wraps everything in `<ClickSpark>` → `<PixelSnow>` (fixed WebGL background) → top-right nav → `<router-view>`. Watches route changes to call `ScrollTrigger.refresh()`.

**Routes** (eagerly loaded, HTML5 history mode):
- `/` — Home with CSS scroll-snap (4 sections, each 100vh): SplitText hero, BlurText, BlurText, CTA
- `/projects` — Full-screen WebGL 2 icosahedron sphere menu (InfiniteMenu) with fade-in entrance
- `/projects/:id` — Project detail (two screens with scroll-snap): first screen has SplitText title, CountUp stars, BlurText description; second screen has contributions list (if any)
- `/portal` — Portal links in a PixelCard with pixel hover animation (blue variant). Title uses BlurText, category labels and links use `motion-v` Motion component with blur-in keyframes
- `/about` — Redirects to `/portal`
- `/:pathMatch(.*)*` — 404 (GlitchText)

**Project data**: Static in `src/data/projects.js`. Each project can have a `contributions` array with `{ pr, title, description }` entries. Images in `public/projects/`.

## Design Principles

- **No borders, no boxes** — minimalist text-only style
- **Underline links** with arrow indicators (→), no button borders
- **Navigation**: top-right corner, plain text, no background/border
- **Scroll-snap** on `html` element for full-page snapping
- **Scrollbar hidden** globally (`scrollbar-width: none` + `::-webkit-scrollbar`)

## Animation Libraries

| Library | Components | Notes |
|---------|-----------|-------|
| **Three.js** | `PixelSnow.vue` | GLSL shader snowfall, fixed background, pointer-events none |
| **GSAP + ScrollTrigger** | `SplitText`, `ScrollReveal` | Use `gsap.context()` for cleanup, `once: true`, scroller is window |
| **motion-v** | `BlurText.vue` | Vue port of Framer Motion, triggers on IntersectionObserver |
| **gl-matrix** | `InfiniteMenu.vue` | WebGL 2 instanced rendering, ArcballControl, texture atlasing |
| **Pure JS/CSS** | `ClickSpark`, `ScrambleText`, `CountUp`, `LogoLoop`, `GlitchText`, `PixelCard` | Canvas 2D, requestAnimationFrame, CSS keyframes |

## Key Patterns

- **GSAP components**: Split text → `gsap.set()` initial state → `ScrollTrigger({ once: true, onEnter })` → `gsap.to()` with stagger → `gsap.context().revert()` on unmount
- **WebGL cleanup**: InfiniteMenu uses `cancelAnimationFrame` + `WEBGL_lose_context` extension in `destroy()`. WorldMatrix must be initialized BEFORE `init()` since `onInit` callback triggers `run()`.
- **InfiniteMenu**: `alpha: true` for transparent canvas background. Scale prop controls camera distance and sphere size.
- **Scroll-snap**: `html { scroll-snap-type: y mandatory }`, sections use `scroll-snap-align: start; height: 100vh`
- **Route transitions**: App.vue watches `route.path` and calls `ScrollTrigger.refresh()` after nextTick + 150ms delay
- **GitHub API**: Project detail fetches live star counts from `https://api.github.com/repos/{owner}/{repo}`. CountUp auto-restarts animation when the `to` prop updates from the API response.
- **PixelCard**: Canvas-based pixel grid that appears on mouse enter and disappears on mouse leave. Variants: `default`, `blue`, `yellow`, `pink`. Ported from vue-bits (DavidHDev/vue-bits).

## Dependencies

`vue`, `vue-router`, `three`, `gsap`, `gl-matrix`, `motion-v`, `marked`
