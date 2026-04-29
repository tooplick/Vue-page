<script setup>
import GlitchText from '../components/GlitchText.vue'
</script>

<template>
  <div class="home">
    <GlitchText text="Pixel Snow" :speed="0.5" :enable-shadows="true" />
    <p class="subtitle">Vue + Three.js Background Effect</p>
    <div class="credits">
      Powered by <a href="https://vue-bits.dev" target="_blank">Vue Bits</a>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.7;
  letter-spacing: 0.1em;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
}

.credits {
  font-size: 0.9rem;
  opacity: 0.5;
}

.credits a {
  color: #ffffff;
  text-decoration: underline;
  transition: opacity 0.3s;
}

.credits a:hover {
  opacity: 0.8;
}
</style>
