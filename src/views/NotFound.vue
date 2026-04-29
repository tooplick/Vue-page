<script setup>
import GlitchText from '../components/GlitchText.vue'
</script>

<template>
  <div class="not-found">
    <GlitchText text="404" :speed="0.5" :enable-shadows="true" />
    <GlitchText text="Page Not Found" :speed="0.5" :enable-shadows="true"/>
    <router-link to="/" class="back-link">Back to Home</router-link>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
}

.back-link {
  color: #ffffff;
  text-decoration: none;
  font-size: 1rem;
  opacity: 0.5;
  padding: 0.6rem 1.5rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.back-link:hover {
  opacity: 1;
  border-color: #ffffff;
}
</style>
