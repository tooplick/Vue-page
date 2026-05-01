<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, useTemplateRef } from 'vue'

const props = defineProps({
  to: { type: Number, required: true },
  from: { type: Number, default: 0 },
  direction: { type: String, default: 'up' },
  delay: { type: Number, default: 0 },
  duration: { type: Number, default: 2 },
  className: { type: String, default: '' },
  startWhen: { type: Boolean, default: true },
  separator: { type: String, default: '' },
  onStart: { type: Function, default: null },
  onEnd: { type: Function, default: null }
})

const emit = defineEmits(['start', 'end'])

const elementRef = useTemplateRef('elementRef')
const currentValue = ref(props.direction === 'down' ? props.to : props.from)
const isInView = ref(false)
const animationId = ref(null)
const hasStarted = ref(false)

let intersectionObserver = null

const damping = 20 + 40 * (1 / props.duration)
const stiffness = 100 * (1 / props.duration)

let velocity = 0
let startTime = 0

const formatNumber = (value) => {
  const options = {
    useGrouping: !!props.separator,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }
  const formattedNumber = Intl.NumberFormat('en-US', options).format(Number(value.toFixed(0)))
  return props.separator ? formattedNumber.replace(/,/g, props.separator) : formattedNumber
}

const updateDisplay = () => {
  if (elementRef.value) {
    elementRef.value.textContent = formatNumber(currentValue.value)
  }
}

const springAnimation = (timestamp) => {
  if (!startTime) startTime = timestamp

  const target = props.direction === 'down' ? props.from : props.to
  const current = currentValue.value

  const displacement = target - current
  const springForce = displacement * stiffness
  const dampingForce = velocity * damping
  const acceleration = springForce - dampingForce

  velocity += acceleration * 0.016
  currentValue.value += velocity * 0.016

  updateDisplay()

  if (Math.abs(displacement) > 0.01 || Math.abs(velocity) > 0.01) {
    animationId.value = requestAnimationFrame(springAnimation)
  } else {
    currentValue.value = target
    updateDisplay()
    animationId.value = null
    if (props.onEnd) props.onEnd()
    emit('end')
  }
}

const startAnimation = () => {
  if (hasStarted.value || !isInView.value || !props.startWhen) return
  hasStarted.value = true
  if (props.onStart) props.onStart()
  emit('start')

  setTimeout(() => {
    startTime = 0
    velocity = 0
    animationId.value = requestAnimationFrame(springAnimation)
  }, props.delay * 1000)
}

const setupIntersectionObserver = () => {
  if (!elementRef.value) return
  intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !isInView.value) {
        isInView.value = true
        startAnimation()
      }
    },
    { threshold: 0, rootMargin: '0px' }
  )
  intersectionObserver.observe(elementRef.value)
}

const cleanup = () => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
  }
  if (intersectionObserver) {
    intersectionObserver.disconnect()
    intersectionObserver = null
  }
}

watch(
  [() => props.from, () => props.to, () => props.direction],
  () => {
    currentValue.value = props.direction === 'down' ? props.to : props.from
    updateDisplay()
    hasStarted.value = false
    if (isInView.value && props.startWhen) {
      nextTick(() => startAnimation())
    }
  },
  { immediate: true }
)

watch(
  () => props.startWhen,
  () => {
    if (props.startWhen && isInView.value && !hasStarted.value) {
      startAnimation()
    }
  }
)

onMounted(() => {
  updateDisplay()
  setupIntersectionObserver()
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <span ref="elementRef" :class="className" />
</template>
