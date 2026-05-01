<script setup>
import { Motion } from 'motion-v'
import BlurText from '../components/BlurText.vue'
import PixelCard from '../components/PixelCard.vue'

const portalLinks = [
  { category: 'Web', links: [
    { label: 'YGKing.top', href: 'https://ygking.top/' },
    { label: 'OpenAI API', href: 'https://openai.ygking.top/' },
    { label: 'QQ Music API', href: 'https://api.ygking.top/' },
    { label: 'API Doc', href: 'https://doc.ygking.top/' },
    { label: 'Music Web', href: 'https://music.ygking.top/' },
    { label: 'Player', href: 'https://player.ygking.top/' },
    { label: 'DouYin Video', href: 'https://dy.ygking.top/' },
    { label: 'For You', href: 'http://say.ygking.top' },
  ]},
  { category: 'Proxy', links: [
    { label: 'Nekro Endpoint', href: 'https://edge.ygking.top' },
    { label: 'GitHub Proxy', href: 'https://github.ygking.top/' },
    { label: 'Any Proxy', href: 'https://vpn.ygking.top/' },
    { label: 'VPN', href: 'https://proxy.ygking.top/' },
  ]},
  { category: 'GitHub', links: [
    { label: 'tooplick', href: 'https://github.com/tooplick' },
    { label: 'GitHub Pages', href: 'https://tooplick.github.io/' },
  ]},
]

const blurFrom = { filter: 'blur(10px)', opacity: 0, y: -20 }
const blurKeyframes = {
  filter: ['blur(10px)', 'blur(4px)', 'blur(0px)'],
  opacity: [0, 0.4, 0.6],
  y: [-20, 3, 0],
}
const labelKeyframes = {
  filter: ['blur(10px)', 'blur(4px)', 'blur(0px)'],
  opacity: [0, 0.2, 0.3],
  y: [-20, 3, 0],
}

const getDelay = (gi) => {
  return { duration: 0.5, delay: 0.4 + gi * 0.15, ease: [0.25, 0.1, 0.25, 1] }
}
</script>

<template>
  <div class="portal">
    <section class="portal-section">
      <BlurText
        text="Portal"
        :delay="150"
        animate-by="words"
        direction="top"
        class-name="portal-title"
      />

      <PixelCard variant="blue" class-name="portal-card">
        <div class="card-inner">
          <div
            v-for="(group, gi) in portalLinks"
            :key="group.category"
            class="link-group"
          >
            <Motion
              tag="h2"
              class="section-label"
              :initial="blurFrom"
              :animate="labelKeyframes"
              :transition="{ duration: 0.5, delay: 0.3 + gi * 0.15, ease: [0.25, 0.1, 0.25, 1] }"
            >{{ group.category }}</Motion>
            <div class="link-items">
              <Motion
                v-for="(link, li) in group.links"
                tag="a"
                :key="link.label"
                :href="link.href"
                target="_blank"
                rel="noopener"
                class="link-item"
                :initial="blurFrom"
                :animate="blurKeyframes"
                :transition="getDelay(gi)"
              >{{ link.label }}</Motion>
            </div>
          </div>
        </div>
      </PixelCard>
    </section>
  </div>
</template>

<style scoped>
.portal {
  min-height: 100vh;
}

.portal-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  scroll-snap-align: start;
}

.portal-title {
  font-size: clamp(2rem, 5vw, 3.5rem) !important;
  margin-bottom: 3rem;
}

.portal-card {
  width: 100%;
  max-width: 500px;
  min-height: 330px;
  animation: fadeUp 0.6s ease both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-inner {
  padding: 2.5rem;
}

.link-group {
  margin-bottom: 2rem;
}

.link-group:last-child {
  margin-bottom: 0;
}

.section-label {
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 400;
  margin-bottom: 0.8rem;
}

.link-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.2rem;
}

.link-item {
  color: white;
  text-decoration: underline;
  text-underline-offset: 4px;
  font-size: 0.95rem;
  display: inline-block;
  will-change: transform, filter, opacity;
  transition: opacity 0.3s;
}

.link-item:hover {
  opacity: 0.7 !important;
}
</style>
