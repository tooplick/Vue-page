<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch, defineComponent, h } from 'vue'

const props = defineProps({
  logos: { type: Array, required: true },
  speed: { type: Number, default: 120 },
  direction: { type: String, default: 'left' },
  width: { type: [Number, String], default: '100%' },
  logoHeight: { type: Number, default: 60 },
  gap: { type: Number, default: 32 },
  pauseOnHover: { type: Boolean, default: true },
  fadeOut: { type: Boolean, default: false },
  fadeOutColor: { type: String, default: '' },
  scaleOnHover: { type: Boolean, default: false },
  ariaLabel: { type: String, default: 'Partner logos' },
  className: { type: String, default: '' }
})

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2
}

const containerRef = useTemplateRef('containerRef')
const trackRef = useTemplateRef('trackRef')
const seqRef = ref(null)

const seqWidth = ref(0)
const copyCount = ref(ANIMATION_CONFIG.MIN_COPIES)
const isHovered = ref(false)

let rafRef = null
let lastTimestampRef = null
const offsetRef = ref(0)
const velocityRef = ref(0)

const targetVelocity = computed(() => {
  const magnitude = Math.abs(props.speed)
  const directionMultiplier = props.direction === 'left' ? 1 : -1
  const speedMultiplier = props.speed < 0 ? -1 : 1
  return magnitude * directionMultiplier * speedMultiplier
})

const cssVariables = computed(() => ({
  '--logoloop-gap': `${props.gap}px`,
  '--logoloop-logoHeight': `${props.logoHeight}px`,
  ...(props.fadeOutColor && { '--logoloop-fadeColor': props.fadeOutColor })
}))

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  ...cssVariables.value
}))

const isNodeItem = (item) => 'node' in item

const getItemAriaLabel = (item) => {
  if (isNodeItem(item)) return item.ariaLabel ?? item.title
  return item.alt ?? item.title
}

const handleMouseEnter = () => {
  if (props.pauseOnHover) isHovered.value = true
}

const handleMouseLeave = () => {
  if (props.pauseOnHover) isHovered.value = false
}

const updateDimensions = async () => {
  await nextTick()
  const containerWidth = containerRef.value?.clientWidth ?? 0
  const sequenceWidth = seqRef.value?.getBoundingClientRect?.()?.width ?? 0

  if (sequenceWidth > 0) {
    seqWidth.value = Math.ceil(sequenceWidth)
    const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM
    copyCount.value = Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded)
    cleanupAnimation?.()
    cleanupAnimation = startAnimationLoop()
  }
}

let resizeObserver = null
const setupResizeObserver = () => {
  resizeObserver = new ResizeObserver(updateDimensions)
  if (containerRef.value) resizeObserver.observe(containerRef.value)
  if (seqRef.value) resizeObserver.observe(seqRef.value)
  updateDimensions()
  return () => { resizeObserver?.disconnect(); resizeObserver = null }
}

const setupImageLoader = () => {
  const images = seqRef.value?.querySelectorAll('img') ?? []
  if (images.length === 0) { updateDimensions(); return }

  let remainingImages = images.length
  const handleImageLoad = () => { remainingImages -= 1; if (remainingImages === 0) updateDimensions() }

  images.forEach(img => {
    if (img.complete) handleImageLoad()
    else { img.addEventListener('load', handleImageLoad, { once: true }); img.addEventListener('error', handleImageLoad, { once: true }) }
  })

  return () => { images.forEach(img => { img.removeEventListener('load', handleImageLoad); img.removeEventListener('error', handleImageLoad) }) }
}

const startAnimationLoop = () => {
  const track = trackRef.value
  if (!track) return

  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  if (seqWidth.value > 0) {
    offsetRef.value = ((offsetRef.value % seqWidth.value) + seqWidth.value) % seqWidth.value
    track.style.transform = `translate3d(${-offsetRef.value}px, 0, 0)`
  }

  if (prefersReduced) {
    track.style.transform = 'translate3d(0, 0, 0)'
    return () => { lastTimestampRef = null }
  }

  const animate = (timestamp) => {
    if (lastTimestampRef === null) lastTimestampRef = timestamp
    const deltaTime = Math.max(0, timestamp - lastTimestampRef) / 1000
    lastTimestampRef = timestamp

    const target = props.pauseOnHover && isHovered.value ? 0 : targetVelocity.value
    const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU)
    velocityRef.value += (target - velocityRef.value) * easingFactor

    if (seqWidth.value > 0) {
      let nextOffset = offsetRef.value + velocityRef.value * deltaTime
      nextOffset = ((nextOffset % seqWidth.value) + seqWidth.value) % seqWidth.value
      offsetRef.value = nextOffset
      track.style.transform = `translate3d(${-offsetRef.value}px, 0, 0)`
    }

    rafRef = requestAnimationFrame(animate)
  }

  rafRef = requestAnimationFrame(animate)
  return () => { if (rafRef !== null) { cancelAnimationFrame(rafRef); rafRef = null }; lastTimestampRef = null }
}

let cleanupResize
let cleanupImages
let cleanupAnimation

const cleanup = () => { cleanupResize?.(); cleanupImages?.(); cleanupAnimation?.() }

onMounted(async () => {
  await nextTick()
  setTimeout(() => {
    cleanupResize = setupResizeObserver()
    cleanupImages = setupImageLoader()
  }, 10)
})

onUnmounted(() => { cleanup() })

watch([() => props.logos, () => props.gap, () => props.logoHeight], async () => {
  await nextTick()
  cleanupImages?.()
  cleanupImages = setupImageLoader()
}, { deep: true })

const LogoContent = defineComponent({
  name: 'LogoContent',
  props: { item: { type: Object, required: true }, scaleOnHover: { type: Boolean, default: false } },
  setup(props) {
    return () => {
      const baseClasses = ['inline-flex items-center']
      if (props.scaleOnHover) baseClasses.push('logo-loop-scale-hover')

      if (isNodeItem(props.item)) {
        return h('span', { class: baseClasses.join(' '), innerHTML: props.item.node })
      } else {
        const imgClasses = ['logo-loop-img']
        if (props.scaleOnHover) imgClasses.push('logo-loop-scale-hover')
        return h('img', {
          class: imgClasses.join(' '),
          src: props.item.src,
          alt: props.item.alt ?? '',
          title: props.item.title,
          loading: 'lazy',
          draggable: false
        })
      }
    }
  }
})
</script>

<template>
  <div
    ref="containerRef"
    :class="['logo-loop-container', className]"
    :style="containerStyle"
    role="region"
    :aria-label="ariaLabel"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <template v-if="fadeOut">
      <div class="logo-loop-fade logo-loop-fade-left" />
      <div class="logo-loop-fade logo-loop-fade-right" />
    </template>

    <div ref="trackRef" class="logo-loop-track">
      <ul
        v-for="copyIndex in copyCount"
        :key="`copy-${copyIndex - 1}`"
        class="logo-loop-seq"
        role="list"
        :aria-hidden="copyIndex > 1"
        :ref="el => { if (copyIndex === 1) seqRef = el }"
      >
        <li
          v-for="(item, itemIndex) in logos"
          :key="`${copyIndex - 1}-${itemIndex}`"
          :class="['logo-loop-item', scaleOnHover && 'logo-loop-item-hover']"
          role="listitem"
        >
          <a
            v-if="item.href"
            class="logo-loop-link"
            :href="item.href"
            :aria-label="getItemAriaLabel(item) || 'logo link'"
            target="_blank"
            rel="noreferrer noopener"
          >
            <LogoContent :item="item" :scale-on-hover="scaleOnHover" />
          </a>
          <LogoContent v-else :item="item" :scale-on-hover="scaleOnHover" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.logo-loop-container {
  position: relative;
  overflow-x: hidden;
}

.logo-loop-fade {
  position: absolute;
  inset-y: 0;
  z-index: 1;
  pointer-events: none;
  width: clamp(24px, 8%, 120px);
}

.logo-loop-fade-left {
  left: 0;
  background: linear-gradient(to right, var(--logoloop-fadeColor, #0a0a0a) 0%, transparent 100%);
}

.logo-loop-fade-right {
  right: 0;
  background: linear-gradient(to left, var(--logoloop-fadeColor, #0a0a0a) 0%, transparent 100%);
}

.logo-loop-track {
  display: flex;
  width: max-content;
  will-change: transform;
  user-select: none;
}

.logo-loop-seq {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

.logo-loop-item {
  flex: none;
  margin-right: var(--logoloop-gap, 32px);
  font-size: var(--logoloop-logoHeight, 28px);
  line-height: 1;
}

.logo-loop-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  border-radius: 4px;
  transition: opacity 0.2s;
}

.logo-loop-link:hover {
  opacity: 0.8;
}

.logo-loop-img {
  height: var(--logoloop-logoHeight, 28px);
  width: auto;
  display: block;
  object-fit: contain;
  pointer-events: none;
}

.logo-loop-scale-hover {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-loop-item-hover:hover .logo-loop-scale-hover {
  transform: scale(1.2);
}
</style>
