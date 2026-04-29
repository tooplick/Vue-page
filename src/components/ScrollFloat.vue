<script setup>
import { computed, onMounted, onUnmounted, nextTick, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  children: { type: String, default: '' },
  containerClassName: { type: String, default: '' },
  textClassName: { type: String, default: '' },
  animationDuration: { type: Number, default: 1 },
  ease: { type: String, default: 'back.inOut(2)' },
  stagger: { type: Number, default: 0.03 }
})

const containerRef = useTemplateRef('containerRef')
let ctx = null

const splitText = computed(() => {
  const text = typeof props.children === 'string' ? props.children : ''
  return text.split('')
})

onMounted(async () => {
  await nextTick()
  const el = containerRef.value
  if (!el) return

  ctx = gsap.context(() => {
    const charElements = el.querySelectorAll('.char')
    if (!charElements.length) return

    gsap.set(charElements, {
      opacity: 0,
      yPercent: 120,
      scaleY: 2.3,
      scaleX: 0.7,
      transformOrigin: '50% 0%'
    })

    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(charElements, {
          duration: props.animationDuration,
          ease: props.ease,
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          stagger: props.stagger
        })
      }
    })

    ScrollTrigger.refresh()
  }, el)
})

onUnmounted(() => {
  ctx && ctx.revert()
})
</script>

<template>
  <h2 ref="containerRef" :class="`overflow-hidden ${containerClassName}`">
    <span
      :class="`inline-block text-center leading-relaxed font-black ${textClassName}`"
      style="font-size: clamp(1.6rem, 8vw, 10rem)"
    >
      <span v-for="(char, index) in splitText" :key="index" class="inline-block char">
        {{ char === ' ' ? ' ' : char }}
      </span>
    </span>
  </h2>
</template>
