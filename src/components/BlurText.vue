<script setup>
import { Motion } from 'motion-v'
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  delay: { type: Number, default: 200 },
  className: { type: String, default: '' },
  animateBy: { type: String, default: 'words' },
  direction: { type: String, default: 'top' },
  threshold: { type: Number, default: 0.1 },
  rootMargin: { type: String, default: '0px' },
  animationFrom: { type: Object, default: null },
  animationTo: { type: Array, default: null },
  easing: { type: Function, default: (t) => t },
  stepDuration: { type: Number, default: 0.35 },
  onAnimationComplete: { type: Function, default: null }
})

const emit = defineEmits(['animation-complete'])

const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))])
  const keyframes = {}
  keys.forEach(k => {
    keyframes[k] = [from[k], ...steps.map(s => s[k])]
  })
  return keyframes
}

const inView = ref(false)
const rootRef = useTemplateRef('rootRef')
let observer = null

onMounted(() => {
  if (!rootRef.value) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        inView.value = true
        observer?.unobserve(rootRef.value)
      }
    },
    { threshold: props.threshold, rootMargin: props.rootMargin }
  )
  observer.observe(rootRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

const elements = computed(() => props.animateBy === 'words' ? props.text.split(' ') : props.text.split(''))

const defaultFrom = computed(() =>
  props.direction === 'top'
    ? { filter: 'blur(10px)', opacity: 0, y: -50 }
    : { filter: 'blur(10px)', opacity: 0, y: 50 }
)

const defaultTo = computed(() => [
  {
    filter: 'blur(5px)',
    opacity: 0.5,
    y: props.direction === 'top' ? 5 : -5
  },
  {
    filter: 'blur(0px)',
    opacity: 1,
    y: 0
  }
])

const fromSnapshot = computed(() => props.animationFrom ?? defaultFrom.value)
const toSnapshots = computed(() => props.animationTo ?? defaultTo.value)

const stepCount = computed(() => toSnapshots.value.length + 1)
const totalDuration = computed(() => props.stepDuration * (stepCount.value - 1))
const times = computed(() =>
  Array.from({ length: stepCount.value }, (_, i) => (stepCount.value === 1 ? 0 : i / (stepCount.value - 1)))
)

const getTransition = (index) => ({
  duration: totalDuration.value,
  times: times.value,
  delay: (index * props.delay) / 1000,
  ease: props.easing
})

const handleAnimationComplete = (index) => {
  if (index === elements.value.length - 1) {
    if (props.onAnimationComplete) props.onAnimationComplete()
    emit('animation-complete')
  }
}
</script>

<template>
  <p ref="rootRef" class="blur-text" :class="className">
    <Motion
      v-for="(segment, index) in elements"
      :key="index"
      tag="span"
      :initial="fromSnapshot"
      :animate="inView ? buildKeyframes(fromSnapshot, toSnapshots) : fromSnapshot"
      :transition="getTransition(index)"
      @animation-complete="handleAnimationComplete(index)"
      style="display: inline-block; will-change: transform, filter, opacity"
    >
      {{ segment === ' ' ? ' ' : segment }}
      <template v-if="animateBy === 'words' && index < elements.length - 1">&nbsp;</template>
    </Motion>
  </p>
</template>
