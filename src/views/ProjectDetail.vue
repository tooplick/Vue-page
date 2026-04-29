<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ScrambleText from '../components/ScrambleText.vue'
import ScrollReveal from '../components/ScrollReveal.vue'
import CountUp from '../components/CountUp.vue'
import { projects } from '../data/projects'

const route = useRoute()

const project = computed(() => {
  return projects.find(p => p.id === route.params.id)
})

const stars = ref(0)

async function fetchStars(link) {
  if (!link) return
  try {
    const parts = link.replace('https://github.com/', '').split('/')
    if (parts.length < 2) return
    const res = await fetch(`https://api.github.com/repos/${parts[0]}/${parts[1]}`)
    if (!res.ok) return
    const data = await res.json()
    stars.value = data.stargazers_count
  } catch {
    // fallback to static value
  }
}

watch(project, (p) => {
  if (p) {
    stars.value = p.stars || 0
    fetchStars(p.link)
  }
}, { immediate: true })
</script>

<template>
  <div class="project-detail" v-if="project">
    <div class="detail-header">
      <ScrambleText
        :radius="120"
        :duration="1.5"
        :speed="0.6"
        scramble-chars=".:~!@#$%"
        class-name="detail-title"
      >
        {{ project.title }}
      </ScrambleText>

      <div class="detail-tags">
        <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>

    <div class="detail-content">
      <div class="detail-info">
        <div class="stars-section">
          <div class="stars-label">GitHub Stars</div>
          <div class="stars-number">
            <CountUp
              :to="stars"
              :duration="2"
              :delay="0.3"
              separator=","
              class-name="stars-count"
            />
            <span class="stars-suffix">&#9733;</span>
          </div>
        </div>

        <ScrollReveal
          :children="project.description"
          :enable-blur="true"
          :base-opacity="0.1"
          :base-rotation="2"
          :blur-strength="3"
          container-class-name="detail-desc"
          text-class-name="detail-desc-text"
        />

        <div class="detail-actions">
          <a :href="project.link" target="_blank" rel="noopener" class="btn-github">
            View on GitHub
          </a>
          <router-link to="/projects" class="btn-back">&#8592; All Projects</router-link>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <h2>Project not found</h2>
    <router-link to="/projects" class="btn-back">&#8592; Back to Projects</router-link>
  </div>
</template>

<style scoped>
.project-detail {
  min-height: 100vh;
  padding: 4rem 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.detail-header {
  text-align: center;
  margin-bottom: 3rem;
}

.detail-title {
  margin-bottom: 1rem;
}

.detail-tags {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.tag {
  padding: 0.3em 0.8em;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: 0.8rem;
  opacity: 0.6;
}

.detail-content {
  max-width: 600px;
  margin: 0 auto;
}

.stars-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: center;
}

.stars-label {
  font-size: 0.85rem;
  opacity: 0.5;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.stars-number {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.stars-count {
  font-size: 3rem;
  font-weight: 900;
  font-family: monospace;
}

.stars-suffix {
  font-size: 2rem;
  color: #fbbf24;
}

.detail-desc {
  margin-bottom: 2rem;
}

.detail-desc-text {
  font-size: 1rem !important;
  font-weight: 400 !important;
  opacity: 0.7;
  line-height: 1.8;
}

.detail-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-github {
  padding: 0.7em 1.5em;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-github:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-back {
  padding: 0.7em 1.5em;
  color: white;
  text-decoration: none;
  opacity: 0.5;
  font-size: 0.9rem;
  transition: opacity 0.3s;
}

.btn-back:hover {
  opacity: 1;
}

.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
</style>
