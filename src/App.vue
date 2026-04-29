<script setup>
import { watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PixelSnow from './components/PixelSnow.vue'
import ClickSpark from './components/ClickSpark.vue'

const route = useRoute()

watch(() => route.path, async () => {
  await nextTick()
  setTimeout(() => { ScrollTrigger.refresh() }, 150)
})
</script>

<template>
  <ClickSpark
    spark-color="#ffffff"
    :spark-size="10"
    :spark-radius="15"
    :spark-count="8"
    :duration="400"
    easing="ease-out"
  >
    <div class="app">
      <PixelSnow
        color="#ffffff"
        :flake-size="0.01"
        :min-flake-size="1.25"
        :pixel-resolution="200"
        :speed="1.25"
        :density="0.3"
        :direction="125"
        :brightness="1"
        variant="snowflake"
      />

      <nav class="nav-bar">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/projects" class="nav-link">Projects</router-link>
        <router-link to="/about" class="nav-link">About</router-link>
      </nav>

      <div class="content">
        <router-view />
      </div>
    </div>
  </ClickSpark>
</template>

<style scoped>
.app {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.nav-bar {
  position: fixed;
  top: 1.5rem;
  right: 2rem;
  z-index: 100;
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #ffffff;
}

.content {
  position: relative;
  z-index: 1;
}
</style>
