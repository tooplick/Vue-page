<script setup>
import { ref, onMounted, onUnmounted, computed, watch, useTemplateRef } from 'vue'

class Pixel {
  constructor(canvas, context, x, y, color, speed, delay) {
    this.width = canvas.width
    this.height = canvas.height
    this.ctx = context
    this.x = x
    this.y = y
    this.color = color
    this.speed = (Math.random() * 0.8 + 0.1) * speed
    this.size = 0
    this.sizeStep = Math.random() * 0.4
    this.minSize = 0.5
    this.maxSizeInteger = 2
    this.maxSize = Math.random() * (this.maxSizeInteger - this.minSize) + this.minSize
    this.delay = delay
    this.counter = 0
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01
    this.isIdle = false
    this.isReverse = false
    this.isShimmer = false
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5
    this.ctx.fillStyle = this.color
    this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size)
  }

  appear() {
    this.isIdle = false
    if (this.counter <= this.delay) {
      this.counter += this.counterStep
      return
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true
    }
    if (this.isShimmer) {
      this.shimmer()
    } else {
      this.size += this.sizeStep
    }
    this.draw()
  }

  disappear() {
    this.isShimmer = false
    this.counter = 0
    if (this.size <= 0) {
      this.isIdle = true
      return
    }
    this.size -= 0.1
    this.draw()
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true
    } else if (this.size <= this.minSize) {
      this.isReverse = false
    }
    this.size += this.isReverse ? -this.speed : this.speed
  }
}

function getEffectiveSpeed(value, reducedMotion) {
  const throttle = 0.001
  if (value <= 0 || reducedMotion) return 0
  if (value >= 100) return 100 * throttle
  return value * throttle
}

const VARIANTS = {
  default: { gap: 5, speed: 35, colors: '#f8fafc,#f1f5f9,#cbd5e1' },
  blue: { gap: 10, speed: 25, colors: '#e0f2fe,#7dd3fc,#0ea5e9' },
  yellow: { gap: 3, speed: 20, colors: '#fef08a,#fde047,#eab308' },
  pink: { gap: 6, speed: 80, colors: '#fecdd3,#fda4af,#e11d48' }
}

const props = defineProps({
  variant: { type: String, default: 'default' },
  gap: { type: Number, default: undefined },
  speed: { type: Number, default: undefined },
  colors: { type: String, default: undefined },
  className: { type: String, default: '' }
})

const containerRef = useTemplateRef('containerRef')
const canvasRef = useTemplateRef('canvasRef')
const pixelsRef = ref([])
const animationRef = ref(null)
const timePreviousRef = ref(performance.now())
const reducedMotion = ref(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

const variantCfg = computed(() => VARIANTS[props.variant] || VARIANTS.default)
const finalGap = computed(() => props.gap ?? variantCfg.value.gap)
const finalSpeed = computed(() => props.speed ?? variantCfg.value.speed)
const finalColors = computed(() => props.colors ?? variantCfg.value.colors)

let resizeObserver = null

const initPixels = () => {
  if (!containerRef.value || !canvasRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const width = Math.floor(rect.width)
  const height = Math.floor(rect.height)
  const ctx = canvasRef.value.getContext('2d')

  canvasRef.value.width = width
  canvasRef.value.height = height
  canvasRef.value.style.width = `${width}px`
  canvasRef.value.style.height = `${height}px`

  const colorsArray = finalColors.value.split(',')
  const pxs = []
  for (let x = 0; x < width; x += finalGap.value) {
    for (let y = 0; y < height; y += finalGap.value) {
      const color = colorsArray[Math.floor(Math.random() * colorsArray.length)]
      const dx = x - width / 2
      const dy = y - height / 2
      const distance = Math.sqrt(dx * dx + dy * dy)
      const delay = reducedMotion.value ? 0 : distance
      pxs.push(new Pixel(canvasRef.value, ctx, x, y, color, getEffectiveSpeed(finalSpeed.value, reducedMotion.value), delay))
    }
  }
  pixelsRef.value = pxs
}

const doAnimate = (fnName) => {
  animationRef.value = requestAnimationFrame(() => doAnimate(fnName))
  const timeNow = performance.now()
  const timePassed = timeNow - timePreviousRef.value
  if (timePassed < 1000 / 60) return
  timePreviousRef.value = timeNow - (timePassed % (1000 / 60))

  const ctx = canvasRef.value?.getContext('2d')
  if (!ctx || !canvasRef.value) return

  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  let allIdle = true
  for (const pixel of pixelsRef.value) {
    pixel[fnName]()
    if (!pixel.isIdle) allIdle = false
  }
  if (allIdle && animationRef.value) cancelAnimationFrame(animationRef.value)
}

const handleAnimation = (name) => {
  if (animationRef.value !== null) cancelAnimationFrame(animationRef.value)
  animationRef.value = requestAnimationFrame(() => doAnimate(name))
}

watch([finalGap, finalSpeed, finalColors], initPixels)

onMounted(() => {
  initPixels()
  resizeObserver = new ResizeObserver(initPixels)
  if (containerRef.value) resizeObserver.observe(containerRef.value)
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
  if (animationRef.value !== null) cancelAnimationFrame(animationRef.value)
})

defineExpose({ handleAnimation })
</script>

<template>
  <div
    ref="containerRef"
    :class="['pixel-card', className]"
    @mouseenter="handleAnimation('appear')"
    @mouseleave="handleAnimation('disappear')"
  >
    <canvas ref="canvasRef" class="pixel-canvas" />
    <div class="pixel-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.pixel-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  transition: border-color 0.3s ease;
}

.pixel-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.pixel-canvas {
  display: block;
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

.pixel-content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}
</style>
