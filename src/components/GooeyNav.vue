<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  items: { type: Array, required: true },
  animationTime: { type: Number, default: 600 },
  particleCount: { type: Number, default: 15 },
  particleDistances: { type: Array, default: () => [90, 10] },
  particleR: { type: Number, default: 100 },
  timeVariance: { type: Number, default: 300 },
  colors: { type: Array, default: () => [1, 2, 3, 1, 2, 3, 1, 4] }
})

const emit = defineEmits(['navigate'])
const route = useRoute()

const containerRef = useTemplateRef('containerRef')
const navRef = useTemplateRef('navRef')
const filterRef = useTemplateRef('filterRef')
const textRef = useTemplateRef('textRef')

const activeIndex = ref(0)

// Sync active index with route
const syncActiveWithRoute = () => {
  const idx = props.items.findIndex(item => item.href === route.path)
  if (idx !== -1) activeIndex.value = idx
}

let resizeObserver = null

const noise = (n = 1) => n / 2 - Math.random() * n

const getXY = (distance, pointIndex, totalPoints) => {
  const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180)
  return [distance * Math.cos(angle), distance * Math.sin(angle)]
}

const createParticle = (i, t, d, r) => {
  const rotate = noise(r / 10)
  return {
    start: getXY(d[0], props.particleCount - i, props.particleCount),
    end: getXY(d[1] + noise(7), props.particleCount - i, props.particleCount),
    time: t,
    scale: 1 + noise(0.2),
    color: props.colors[Math.floor(Math.random() * props.colors.length)],
    rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
  }
}

const makeParticles = (element) => {
  const d = props.particleDistances
  const r = props.particleR
  const bubbleTime = props.animationTime * 2 + props.timeVariance
  element.style.setProperty('--time', `${bubbleTime}ms`)
  for (let i = 0; i < props.particleCount; i++) {
    const t = props.animationTime * 2 + noise(props.timeVariance * 2)
    const p = createParticle(i, t, d, r)
    element.classList.remove('active')
    setTimeout(() => {
      const particle = document.createElement('span')
      const point = document.createElement('span')
      particle.classList.add('particle')
      particle.style.setProperty('--start-x', `${p.start[0]}px`)
      particle.style.setProperty('--start-y', `${p.start[1]}px`)
      particle.style.setProperty('--end-x', `${p.end[0]}px`)
      particle.style.setProperty('--end-y', `${p.end[1]}px`)
      particle.style.setProperty('--time', `${p.time}ms`)
      particle.style.setProperty('--scale', `${p.scale}`)
      particle.style.setProperty('--color', `var(--color-${p.color}, white)`)
      particle.style.setProperty('--rotate', `${p.rotate}deg`)
      point.classList.add('point')
      particle.appendChild(point)
      element.appendChild(particle)
      requestAnimationFrame(() => { element.classList.add('active') })
      setTimeout(() => { try { element.removeChild(particle) } catch {} }, t)
    }, 30)
  }
}

const updateEffectPosition = (element) => {
  if (!containerRef.value || !filterRef.value || !textRef.value) return
  const containerRect = containerRef.value.getBoundingClientRect()
  const pos = element.getBoundingClientRect()
  const styles = {
    left: `${pos.x - containerRect.x}px`,
    top: `${pos.y - containerRect.y}px`,
    width: `${pos.width}px`,
    height: `${pos.height}px`
  }
  Object.assign(filterRef.value.style, styles)
  Object.assign(textRef.value.style, styles)
  textRef.value.innerText = element.innerText
}

const handleClick = (e, index) => {
  const liEl = e.currentTarget.parentElement
  activeIndex.value = index
  updateEffectPosition(liEl)
  if (filterRef.value) {
    filterRef.value.querySelectorAll('.particle').forEach(p => filterRef.value.removeChild(p))
  }
  if (textRef.value) {
    textRef.value.classList.remove('active')
    void textRef.value.offsetWidth
    textRef.value.classList.add('active')
  }
  if (filterRef.value) makeParticles(filterRef.value)
  emit('navigate', props.items[index])
}

const handleKeyDown = (e, index) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    const liEl = e.currentTarget.parentElement
    if (liEl) handleClick({ currentTarget: liEl }, index)
  }
}

watch(activeIndex, async () => {
  await nextTick()
  if (!navRef.value || !containerRef.value) return
  const activeLi = navRef.value.querySelectorAll('li')[activeIndex.value]
  if (activeLi) {
    updateEffectPosition(activeLi)
    textRef.value?.classList.add('active')
  }
})

// Watch route changes
watch(() => route.path, () => { syncActiveWithRoute() })

onMounted(() => {
  syncActiveWithRoute()
  nextTick(() => {
    if (!navRef.value || !containerRef.value) return
    const activeLi = navRef.value.querySelectorAll('li')[activeIndex.value]
    if (activeLi) {
      updateEffectPosition(activeLi)
      textRef.value?.classList.add('active')
    }
    resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.value?.querySelectorAll('li')[activeIndex.value]
      if (currentActiveLi) updateEffectPosition(currentActiveLi)
    })
    resizeObserver.observe(containerRef.value)
  })
})

onUnmounted(() => { if (resizeObserver) resizeObserver.disconnect() })
</script>

<template>
  <div>
    <div class="gooey-nav-container" ref="containerRef">
      <nav class="gooey-nav-nav">
        <ul ref="navRef" class="gooey-nav-list">
          <li
            v-for="(item, index) in items"
            :key="index"
            :class="['gooey-nav-item', { active: activeIndex === index }]"
          >
            <a
              :href="item.href"
              @click.prevent="e => handleClick(e, index)"
              @keydown="e => handleKeyDown(e, index)"
              class="gooey-nav-link"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>
      <span class="effect filter" ref="filterRef" />
      <span class="effect text" ref="textRef" />
    </div>
  </div>
</template>

<style scoped>
.gooey-nav-container { position: relative; }
.gooey-nav-nav { display: flex; position: relative; transform: translate3d(0, 0, 0.01px); }
.gooey-nav-list { display: flex; gap: 2rem; list-style: none; padding: 0 1rem; margin: 0; position: relative; z-index: 3; color: white; text-shadow: 0 1px 1px hsl(205deg 30% 10% / 0.2); }
.gooey-nav-item { border-radius: 9999px; position: relative; cursor: pointer; transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease; box-shadow: 0 0 0.5px 1.5px transparent; color: white; }
.gooey-nav-link { outline: none; padding: 0.6em 1em; display: inline-block; text-decoration: none; color: inherit; }
</style>

<style>
.effect { position: absolute; opacity: 1; pointer-events: none; display: grid; place-items: center; z-index: 1; }
.effect.text { color: white; transition: color 0.3s ease; }
.effect.text.active { color: black; }
.effect.filter { filter: blur(7px) contrast(100) blur(0); mix-blend-mode: lighten; }
.effect.filter::before { content: ''; position: absolute; inset: -75px; z-index: -2; background: black; }
.effect.filter::after { content: ''; position: absolute; inset: 0; background: white; transform: scale(0); opacity: 0; z-index: -1; border-radius: 9999px; }
.effect.active::after { animation: pill 0.3s ease both; }
@keyframes pill { to { transform: scale(1); opacity: 1; } }
.particle, .point { display: block; opacity: 0; width: 20px; height: 20px; border-radius: 9999px; transform-origin: center; }
.particle { --time: 5s; position: absolute; top: calc(50% - 8px); left: calc(50% - 8px); animation: particle calc(var(--time)) ease 1 -350ms; }
.point { background: var(--color); opacity: 1; animation: point calc(var(--time)) ease 1 -350ms; }
@keyframes particle { 0% { transform: rotate(0deg) translate(calc(var(--start-x)), calc(var(--start-y))); opacity: 1; animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45); } 70% { transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2)); opacity: 1; animation-timing-function: ease; } 85% { transform: rotate(calc(var(--rotate) * 0.66)) translate(calc(var(--end-x)), calc(var(--end-y))); opacity: 1; } 100% { transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5)); opacity: 1; } }
@keyframes point { 0% { transform: scale(0); opacity: 0; animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45); } 25% { transform: scale(calc(var(--scale) * 0.25)); } 38% { opacity: 1; } 65% { transform: scale(var(--scale)); opacity: 1; animation-timing-function: ease; } 85% { transform: scale(var(--scale)); opacity: 1; } 100% { transform: scale(0); opacity: 0; } }
li.active { color: black; text-shadow: none; }
li.active::after { opacity: 1; transform: scale(1); }
li::after { content: ''; position: absolute; inset: 0; border-radius: 8px; background: white; opacity: 0; transform: scale(0); transition: all 0.3s ease; z-index: -1; }
</style>
