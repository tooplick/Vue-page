<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SplitText from '../components/SplitText.vue'
import BlurText from '../components/BlurText.vue'
import CountUp from '../components/CountUp.vue'
import ScrollReveal from '../components/ScrollReveal.vue'
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
    // fallback
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
    <section class="detail-main">
      <div class="detail-header">
        <SplitText
          :text="project.title"
          tag="h1"
          :delay="80"
          :duration="1"
          ease="power3.out"
          text-align="center"
          class-name="detail-title"
        />

        <div class="detail-tags">
          <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div class="stars-row">
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

      <div class="detail-body">
        <BlurText
          :text="project.description"
          :delay="100"
          animate-by="words"
          direction="top"
          class-name="detail-desc"
        />
      </div>

      <div class="detail-actions">
        <router-link to="/projects" class="btn-link btn-back">
          All Projects
        </router-link>
        <a :href="project.link" target="_blank" rel="noopener" class="btn-link">
          GitHub
        </a>
      </div>

      <div v-if="project.contributions?.length" class="scroll-hint">scroll</div>
    </section>

    <section v-if="project.contributions?.length" class="detail-contribs">
      <h2 class="contrib-label">My Contributions</h2>
      <ul class="contrib-list">
        <li v-for="c in project.contributions" :key="c.pr">
          <a :href="c.pr" target="_blank" rel="noopener">{{ c.title }}</a>
          <span class="contrib-desc">{{ c.description }}</span>
        </li>
      </ul>
    </section>
  </div>

  <div v-else class="not-found">
    <h2>Project not found</h2>
    <router-link to="/projects" class="btn-link">Back to Projects</router-link>
  </div>
</template>

<style scoped>
.project-detail {
  min-height: 100vh;
}

.detail-main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
  scroll-snap-align: start;
}

.detail-header {
  margin-bottom: 2rem;
}

.detail-title {
  margin-bottom: 1rem;
}

.detail-tags {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.tag {
  font-size: 0.8rem;
  opacity: 0.4;
  letter-spacing: 0.05em;
}

.stars-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.stars-count {
  font-size: 2.5rem;
  font-weight: 200;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

.stars-suffix {
  font-size: 1.5rem;
  color: #fbbf24;
}

.detail-body {
  max-width: 600px;
  margin-bottom: 2.5rem;
}

.detail-desc {
  font-size: 1rem !important;
  opacity: 0.6;
  line-height: 1.8;
}

.detail-actions {
  display: flex;
  gap: 2rem;
}

.detail-contribs {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: left;
  scroll-snap-align: start;
}

.contrib-label {
  font-size: 0.85rem;
  opacity: 0.4;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 400;
  margin-bottom: 1.2rem;
  text-align: center;
}

.contrib-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 600px;
}

.contrib-list li {
  margin-bottom: 1rem;
}

.contrib-list a {
  color: white;
  text-decoration: underline;
  text-underline-offset: 4px;
  font-size: 0.95rem;
  transition: opacity 0.3s;
}

.contrib-list a:hover {
  opacity: 0.6;
}

.contrib-desc {
  display: block;
  opacity: 0.5;
  font-size: 0.85rem;
  line-height: 1.6;
  margin-top: 0.2rem;
}

.btn-link {
  color: white;
  text-decoration: underline;
  text-underline-offset: 4px;
  font-size: 0.95rem;
  transition: opacity 0.3s;
}

.btn-link:hover {
  opacity: 0.6;
}

.btn-back {
  opacity: 0.5;
}

.btn-back:hover {
  opacity: 0.8;
}

.scroll-hint {
  position: absolute;
  bottom: 2rem;
  opacity: 0.3;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  animation: bounce 2s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
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
