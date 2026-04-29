<script setup>
import BlurText from '../components/BlurText.vue'
import LogoLoop from '../components/LogoLoop.vue'

const techLogos = [
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg', alt: 'Vue.js', href: 'https://vuejs.org' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', alt: 'JavaScript', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', alt: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', alt: 'Python', href: 'https://www.python.org' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', alt: 'Node.js', href: 'https://nodejs.org' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', alt: 'React', href: 'https://react.dev' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', alt: 'Docker', href: 'https://www.docker.com' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', alt: 'Git', href: 'https://git-scm.com' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg', alt: 'Linux', href: 'https://www.linux.org' },
  { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg', alt: 'Nginx', href: 'https://nginx.org' }
]
</script>

<template>
  <div class="about">
    <section class="about-section">
      <BlurText
        text="About Me"
        :delay="150"
        animate-by="words"
        direction="top"
        class-name="about-title"
      />

      <div class="about-content">
        <div class="about-card">
          <BlurText
            text="Developer & Open Source Contributor"
            :delay="100"
            animate-by="words"
            direction="bottom"
            class-name="card-title"
          />
          <p class="about-text">
            I'm a developer passionate about building tools and contributing to open source projects.
            I work with Vue, Python, and Node.js, and I'm particularly interested in the intersection
            of AI and web technology.
          </p>
          <p class="about-text">
            When I'm not coding, you can find me exploring new technologies, writing on my blog,
            or contributing to the developer community.
          </p>
        </div>
      </div>
    </section>

    <section class="tech-section">
      <h2 class="section-label">Tech Stack</h2>
      <LogoLoop
        :logos="techLogos"
        :speed="80"
        :logo-height="48"
        :gap="40"
        :pause-on-hover="true"
        :scale-on-hover="true"
        direction="left"
      />
    </section>

    <section class="links-section">
      <h2 class="section-label">Find Me</h2>
      <div class="links-grid">
        <a href="https://github.com/tooplick" target="_blank" rel="noopener" class="link-card">
          <span class="link-icon">&#9679;</span>
          <span class="link-label">GitHub</span>
          <span class="link-url">github.com/tooplick</span>
        </a>
        <a href="https://ygking.top/" target="_blank" rel="noopener" class="link-card">
          <span class="link-icon">&#9998;</span>
          <span class="link-label">Blog</span>
          <span class="link-url">ygking.top</span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about {
  min-height: 100vh;
  padding: 4rem 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.about-section {
  margin-bottom: 4rem;
  text-align: center;
}

.about-title {
  margin-bottom: 2rem;
}

.about-content {
  max-width: 600px;
  margin: 0 auto;
}

.about-card {
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  text-align: left;
}

.card-title {
  margin-bottom: 1.5rem;
}

.about-text {
  opacity: 0.7;
  line-height: 1.8;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.about-text:last-child {
  margin-bottom: 0;
}

.tech-section {
  margin-bottom: 4rem;
}

.section-label {
  text-align: center;
  font-size: 0.85rem;
  opacity: 0.4;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 2rem;
  font-weight: 400;
}

.links-section {
  margin-bottom: 2rem;
}

.links-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 500px) {
  .links-grid {
    grid-template-columns: 1fr;
  }
}

.link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-decoration: none;
  color: white;
  transition: all 0.3s;
}

.link-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.link-icon {
  font-size: 1.5rem;
  opacity: 0.7;
}

.link-label {
  font-size: 1rem;
  font-weight: 600;
}

.link-url {
  font-size: 0.8rem;
  opacity: 0.4;
}
</style>
