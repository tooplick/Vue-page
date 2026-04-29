<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  text: { type: String, required: true },
  className: { type: String, default: '' },
  delay: { type: Number, default: 80 },
  duration: { type: Number, default: 1 },
  ease: { type: String, default: 'power3.out' },
  tag: { type: String, default: 'p' },
  textAlign: { type: String, default: 'center' }
})

const elRef = ref(null)
let ctx = null

onMounted(async () => {
  await nextTick()
  if (!elRef.value) return

  ctx = gsap.context(() => {
    const chars = elRef.value.querySelectorAll('.split-char')
    if (!chars.length) return

    gsap.set(chars, { opacity: 0, y: 50 })

    ScrollTrigger.create({
      trigger: elRef.value,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration: props.duration,
          ease: props.ease,
          stagger: props.delay / 1000
        })
      }
    })

    ScrollTrigger.refresh()
  }, elRef.value)
})

onUnmounted(() => {
  ctx && ctx.revert()
})

const chars = props.text.split('')
</script>

<template>
  <component :is="tag" ref="elRef" :class="`split-parent ${className}`" :style="{ textAlign }">
    <span
      v-for="(char, i) in chars"
      :key="i"
      class="inline-block split-char"
      :style="{ willChange: 'transform, opacity' }"
    >{{ char === ' ' ? ' ' : char }}</span>
  </component>
</template>
