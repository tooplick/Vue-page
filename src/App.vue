<script setup>
import PixelSnow from './components/PixelSnow.vue'
import ClickSpark from './components/ClickSpark.vue'
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

.content {
  position: relative;
  z-index: 1;
}
</style>
