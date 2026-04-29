<script setup>
import { onMounted, onUnmounted, watch, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(SplitText, ScrambleTextPlugin)

const props = defineProps({
  radius: { type: Number, default: 100 },
  duration: { type: Number, default: 1.2 },
  speed: { type: Number, default: 0.5 },
  scrambleChars: { type: String, default: '.:' },
  className: { type: String, default: '' },
  style: { type: Object, default: () => ({}) }
})

const rootRef = useTemplateRef('rootRef')

let splitText = null
let handleMove = null

const initializeScrambleText = () => {
  if (!rootRef.value) return

  const pElement = rootRef.value.querySelector('p')
  if (!pElement) return

  splitText = new SplitText(pElement, {
    type: 'chars',
    charsClass: 'inline-block will-change-transform'
  })

  splitText.chars.forEach(el => {
    const c = el
    gsap.set(c, { attr: { 'data-content': c.innerHTML } })
  })

  handleMove = (e) => {
    if (!splitText) return

    splitText.chars.forEach(el => {
      const c = el
      const { left, top, width, height } = c.getBoundingClientRect()
      const dx = e.clientX - (left + width / 2)
      const dy = e.clientY - (top + height / 2)
      const dist = Math.hypot(dx, dy)

      if (dist < props.radius) {
        gsap.to(c, {
          overwrite: true,
          duration: props.duration * (1 - dist / props.radius),
          scrambleText: {
            text: c.dataset.content || '',
            chars: props.scrambleChars,
            speed: props.speed
          },
          ease: 'none'
        })
      }
    })
  }

  rootRef.value.addEventListener('pointermove', handleMove)
}

const cleanup = () => {
  if (rootRef.value && handleMove) {
    rootRef.value.removeEventListener('pointermove', handleMove)
  }
  if (splitText) {
    splitText.revert()
    splitText = null
  }
  handleMove = null
}

onMounted(() => {
  initializeScrambleText()
})

onUnmounted(() => {
  cleanup()
})

watch([() => props.radius, () => props.duration, () => props.speed, () => props.scrambleChars], () => {
  cleanup()
  initializeScrambleText()
})
</script>

<template>
  <div ref="rootRef" :class="`scramble-text ${className}`" :style="style">
    <p><slot></slot></p>
  </div>
</template>
