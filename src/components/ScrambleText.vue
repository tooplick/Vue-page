<script setup>
import { ref, onMounted, onUnmounted, useTemplateRef } from 'vue'

const props = defineProps({
  radius: { type: Number, default: 100 },
  duration: { type: Number, default: 600 },
  scrambleChars: { type: String, default: '.:!@#$%^&*()_+-=' },
  className: { type: String, default: '' }
})

const rootRef = useTemplateRef('rootRef')
const displayText = ref('')
const originalText = ref('')
let handleMove = null

const scramble = (char) => {
  const chars = props.scrambleChars
  return chars[Math.floor(Math.random() * chars.length)]
}

onMounted(() => {
  const el = rootRef.value
  if (!el) return
  const slot = el.querySelector('.scramble-inner')
  if (!slot) return

  originalText.value = slot.textContent
  displayText.value = originalText.value

  const charPositions = []

  handleMove = (e) => {
    const rect = el.getBoundingClientRect()
    const chars = originalText.value.split('')
    let result = ''

    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === ' ') {
        result += ' '
        continue
      }

      // Approximate char position
      const charX = rect.left + (i / chars.length) * rect.width
      const charY = rect.top + rect.height / 2
      const dx = e.clientX - charX
      const dy = e.clientY - charY
      const dist = Math.hypot(dx, dy)

      if (dist < props.radius) {
        result += scramble(chars[i])
      } else {
        result += chars[i]
      }
    }

    slot.textContent = result

    // Restore after delay
    clearTimeout(slot._restoreTimer)
    slot._restoreTimer = setTimeout(() => {
      slot.textContent = originalText.value
    }, props.duration)
  }

  el.addEventListener('pointermove', handleMove)
})

onUnmounted(() => {
  const el = rootRef.value
  if (el && handleMove) {
    el.removeEventListener('pointermove', handleMove)
  }
})
</script>

<template>
  <div ref="rootRef" :class="`scramble-text ${className}`" style="cursor: default; user-select: none;">
    <span class="scramble-inner"><slot /></span>
  </div>
</template>
