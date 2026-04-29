<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  speed: { type: Number, default: 0.5 },
  enableShadows: { type: Boolean, default: true },
  enableOnHover: { type: Boolean, default: false },
  className: { type: String, default: '' }
})

const inlineStyles = computed(() => ({
  '--after-duration': `${props.speed * 3}s`,
  '--before-duration': `${props.speed * 2}s`,
  '--after-shadow': props.enableShadows ? '-5px 0 red' : 'none',
  '--before-shadow': props.enableShadows ? '5px 0 cyan' : 'none'
}))
</script>

<template>
  <div
    :class="['glitch-text', { 'glitch-on-hover': enableOnHover }, className]"
    :style="inlineStyles"
    :data-text="text"
  >
    {{ text }}
  </div>
</template>

<style scoped>
.glitch-text {
  color: #ffffff;
  font-weight: 900;
  white-space: nowrap;
  position: relative;
  margin-inline: auto;
  user-select: none;
  cursor: pointer;
  font-size: clamp(2rem, 10vw, 8rem);
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  color: #ffffff;
  background: #0a0a0a;
  overflow: hidden;
  clip-path: inset(0 0 0 0);
}

/* Normal glitch animation */
.glitch-text:not(.glitch-on-hover)::after {
  left: 10px;
  text-shadow: var(--after-shadow, -10px 0 red);
  animation: animate-glitch var(--after-duration, 3s) infinite linear alternate-reverse;
}

.glitch-text:not(.glitch-on-hover)::before {
  left: -10px;
  text-shadow: var(--before-shadow, 10px 0 cyan);
  animation: animate-glitch var(--before-duration, 2s) infinite linear alternate-reverse;
}

/* Hover-only glitch */
.glitch-on-hover::before,
.glitch-on-hover::after {
  content: '';
  opacity: 0;
  animation: none;
}

.glitch-on-hover:hover::before {
  content: attr(data-text);
  opacity: 1;
  left: -10px;
  text-shadow: var(--before-shadow, 10px 0 cyan);
  animation: animate-glitch var(--before-duration, 2s) infinite linear alternate-reverse;
}

.glitch-on-hover:hover::after {
  content: attr(data-text);
  opacity: 1;
  left: 10px;
  text-shadow: var(--after-shadow, -10px 0 red);
  animation: animate-glitch var(--after-duration, 3s) infinite linear alternate-reverse;
}

@keyframes animate-glitch {
  0% { clip-path: inset(20% 0 50% 0); }
  5% { clip-path: inset(10% 0 60% 0); }
  10% { clip-path: inset(15% 0 55% 0); }
  15% { clip-path: inset(25% 0 35% 0); }
  20% { clip-path: inset(30% 0 40% 0); }
  25% { clip-path: inset(40% 0 20% 0); }
  30% { clip-path: inset(10% 0 60% 0); }
  35% { clip-path: inset(15% 0 55% 0); }
  40% { clip-path: inset(25% 0 35% 0); }
  45% { clip-path: inset(30% 0 40% 0); }
  50% { clip-path: inset(20% 0 50% 0); }
  55% { clip-path: inset(10% 0 60% 0); }
  60% { clip-path: inset(15% 0 55% 0); }
  65% { clip-path: inset(25% 0 35% 0); }
  70% { clip-path: inset(30% 0 40% 0); }
  75% { clip-path: inset(40% 0 20% 0); }
  80% { clip-path: inset(20% 0 50% 0); }
  85% { clip-path: inset(10% 0 60% 0); }
  90% { clip-path: inset(15% 0 55% 0); }
  95% { clip-path: inset(25% 0 35% 0); }
  100% { clip-path: inset(30% 0 40% 0); }
}
</style>
