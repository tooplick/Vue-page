<script setup>
import { useRouter } from 'vue-router'
import InfiniteMenu from '../components/InfiniteMenu.vue'
import { projects } from '../data/projects'

const router = useRouter()

const menuItems = projects.map(p => ({
  image: p.image,
  link: `/projects/${p.id}`,
  title: p.title,
  description: p.description
}))

const handleClick = (item) => {
  if (item.link) router.push(item.link)
}
</script>

<template>
  <div class="projects">
    <InfiniteMenu :items="menuItems" :scale="2" @click="handleClick" />
  </div>
</template>

<style scoped>
.projects {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>
