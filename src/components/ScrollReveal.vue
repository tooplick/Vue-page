<script setup>
import { computed, onMounted, onUnmounted, watch, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  children: { type: String, default: '' },
  enableBlur: { type: Boolean, default: true },
  baseOpacity: { type: Number, default: 0.1 },
  baseRotation: { type: Number, default: 3 },
  blurStrength: { type: Number, default: 4 },
  containerClassName: { type: String, default: '' },
  textClassName: { type: String, default: '' },
  rotationEnd: { type: String, default: 'bottom bottom' },
  wordAnimationEnd: { type: String, default: 'bottom bottom' }
})

const containerRef = useTemplateRef('containerRef')
let scrollTriggerInstances = []

const splitText = computed(() => {
  const text = typeof props.children === 'string' ? props.children : ''
  return text.split(/(\s+)/).map((word, index) => ({
    text: word,
    isWhitespace: word.match(/^\s+$/) !== null,
    key: index
  }))
})

const initializeAnimation = () => {
  const el = containerRef.value
  if (!el) return

  scrollTriggerInstances.forEach(trigger => trigger.kill())
  scrollTriggerInstances = []

  const rotationTl = gsap.fromTo(
    el,
    { transformOrigin: '0% 50%', rotate: props.baseRotation },
    {
      ease: 'none',
      rotate: 0,
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: props.rotationEnd,
        scrub: true
      }
    }
  )

  if (rotationTl.scrollTrigger) {
    scrollTriggerInstances.push(rotationTl.scrollTrigger)
  }

  const wordElements = el.querySelectorAll('.word')

  const opacityTl = gsap.fromTo(
    wordElements,
    { opacity: props.baseOpacity, willChange: 'opacity' },
    {
      ease: 'none',
      opacity: 1,
      stagger: 0.05,
      scrollTrigger: {
        trigger: el,
        start: 'top bottom-=20%',
        end: props.wordAnimationEnd,
        scrub: true
      }
    }
  )

  if (opacityTl.scrollTrigger) {
    scrollTriggerInstances.push(opacityTl.scrollTrigger)
  }

  if (props.enableBlur) {
    const blurTl = gsap.fromTo(
      wordElements,
      { filter: `blur(${props.blurStrength}px)` },
      {
        ease: 'none',
        filter: 'blur(0px)',
        stagger: 0.05,
        scrollTrigger: {
          trigger: el,
          start: 'top bottom-=20%',
          end: props.wordAnimationEnd,
          scrub: true
        }
      }
    )

    if (blurTl.scrollTrigger) {
      scrollTriggerInstances.push(blurTl.scrollTrigger)
    }
  }
}

onMounted(() => {
  initializeAnimation()
})

onUnmounted(() => {
  scrollTriggerInstances.forEach(trigger => trigger.kill())
})

watch(
  [() => props.children, () => props.enableBlur, () => props.baseRotation, () => props.baseOpacity, () => props.rotationEnd, () => props.wordAnimationEnd, () => props.blurStrength],
  () => { initializeAnimation() },
  { deep: true }
)
</script>

<template>
  <h2 ref="containerRef" :class="`my-5 ${containerClassName}`">
    <p :class="`leading-relaxed font-semibold ${textClassName}`" style="font-size: clamp(1.6rem, 4vw, 3rem)">
      <span v-for="(word, index) in splitText" :key="index" :class="word.isWhitespace ? '' : 'inline-block word'">
        {{ word.text }}
      </span>
    </p>
  </h2>
</template>
