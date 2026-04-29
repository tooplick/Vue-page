<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import InfiniteMenu from '../components/InfiniteMenu.vue'
import { projects } from '../data/projects'

const router = useRouter()
const show = ref(false)

const menuItems = projects.map(p => ({
  image: p.image,
  link: `/projects/${p.id}`,
  title: p.title,
  description: p.description
}))

const handleClick = (item) => {
  if (item.link) router.push(item.link)
}

onMounted(() => {
  setTimeout(() => { show.value = true }, 100)
})
</script>

<template>
  <div class="projects">
    <div class="menu-wrap" :class="{ visible: show }">
      <InfiniteMenu :items="menuItems" :scale="2" @click="handleClick" />
    </div>
  </div>
</template>

<style scoped>
.projects {
  width: 100%;
  height: 100vh;
  position: relative;
}

.menu-wrap {
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.menu-wrap.visible {
  opacity: 1;
  transform: scale(1);
}
</style>
