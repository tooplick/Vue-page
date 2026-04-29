<script setup>
import { computed, onMounted, onUnmounted, nextTick, useTemplateRef } from 'vue'
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
  textClassName: { type: String, default: '' }
})

const containerRef = useTemplateRef('containerRef')
let ctx = null

const splitText = computed(() => {
  const text = typeof props.children === 'string' ? props.children : ''
  return text.split(/(\s+)/).map((word, index) => ({
    text: word,
    isWhitespace: word.match(/^\s+$/) !== null,
    key: index
  }))
})

onMounted(async () => {
  await nextTick()
  const el = containerRef.value
  if (!el) return

  ctx = gsap.context(() => {
    const wordElements = el.querySelectorAll('.word')
    if (!wordElements.length) return

    gsap.set(el, { transformOrigin: '0% 50%', rotate: props.baseRotation })
    gsap.set(wordElements, { opacity: props.baseOpacity, willChange: 'opacity' })
    if (props.enableBlur) {
      gsap.set(wordElements, { filter: `blur(${props.blurStrength}px)` })
    }

    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          rotate: 0,
          duration: 1,
          ease: 'power2.out'
        })

        gsap.to(wordElements, {
          opacity: 1,
          stagger: 0.05,
          duration: 0.8,
          ease: 'power2.out'
        })

        if (props.enableBlur) {
          gsap.to(wordElements, {
            filter: 'blur(0px)',
            stagger: 0.05,
            duration: 0.8,
            ease: 'power2.out'
          })
        }
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
  <h2 ref="containerRef" :class="`my-5 ${containerClassName}`">
    <p :class="`leading-relaxed font-semibold ${textClassName}`" style="font-size: clamp(1.6rem, 4vw, 3rem)">
      <span v-for="(word, index) in splitText" :key="index" :class="word.isWhitespace ? '' : 'inline-block word'">
        {{ word.text }}
      </span>
    </p>
  </h2>
</template>
