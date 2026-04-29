<script setup>
import { computed, onMounted, onUnmounted, watch, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  children: { type: String, default: '' },
  containerClassName: { type: String, default: '' },
  textClassName: { type: String, default: '' },
  animationDuration: { type: Number, default: 1 },
  ease: { type: String, default: 'back.inOut(2)' },
  scrollStart: { type: String, default: 'center bottom+=50%' },
  scrollEnd: { type: String, default: 'bottom bottom-=40%' },
  stagger: { type: Number, default: 0.03 }
})

const containerRef = useTemplateRef('containerRef')
let scrollTriggerInstance = null

const splitText = computed(() => {
  const text = typeof props.children === 'string' ? props.children : ''
  return text.split('')
})

const initializeAnimation = () => {
  const el = containerRef.value
  if (!el) return

  const charElements = el.querySelectorAll('.char')

  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
  }

  const tl = gsap.fromTo(
    charElements,
    {
      willChange: 'opacity, transform',
      opacity: 0,
      yPercent: 120,
      scaleY: 2.3,
      scaleX: 0.7,
      transformOrigin: '50% 0%'
    },
    {
      duration: props.animationDuration,
      ease: props.ease,
      opacity: 1,
      yPercent: 0,
      scaleY: 1,
      scaleX: 1,
      stagger: props.stagger,
      scrollTrigger: {
        trigger: el,
        start: props.scrollStart,
        end: props.scrollEnd,
        scrub: true
      }
    }
  )

  scrollTriggerInstance = tl.scrollTrigger || null
}

onMounted(() => {
  initializeAnimation()
})

onUnmounted(() => {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
  }
})

watch(
  [() => props.children, () => props.animationDuration, () => props.ease, () => props.scrollStart, () => props.scrollEnd, () => props.stagger],
  () => { initializeAnimation() },
  { deep: true }
)
</script>

<template>
  <h2 ref="containerRef" :class="`overflow-hidden ${containerClassName}`">
    <span
      :class="`inline-block text-center leading-relaxed font-black ${textClassName}`"
      style="font-size: clamp(1.6rem, 8vw, 10rem)"
    >
      <span v-for="(char, index) in splitText" :key="index" class="inline-block char">
        {{ char === ' ' ? ' ' : char }}
      </span>
    </span>
  </h2>
</template>
