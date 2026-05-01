<script setup>
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
          <div v-for="group in portalLinks" :key="group.category" class="link-group">
            <h2 class="section-label">{{ group.category }}</h2>
            <div class="link-items">
              <a
                v-for="link in group.links"
                :key="link.label"
                :href="link.href"
                target="_blank"
                rel="noopener"
              >{{ link.label }}</a>
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
  margin-bottom: 3rem;
}

.portal-card {
  width: 100%;
  max-width: 500px;
  min-height: 330px;
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
  opacity: 0.4;
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

.link-items a {
  color: white;
  text-decoration: underline;
  text-underline-offset: 4px;
  font-size: 0.95rem;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.link-items a:hover {
  opacity: 1;
}
</style>
