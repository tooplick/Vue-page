<script setup>
import SplitText from '../components/SplitText.vue'
import ScrollFloat from '../components/ScrollFloat.vue'
import BlurText from '../components/BlurText.vue'
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="section hero">
      <div class="hero-content">
        <SplitText
          text="Tooplick"
          tag="h1"
          :delay="80"
          :duration="1"
          ease="power3.out"
          text-align="center"
          class-name="hero-title"
        />
        <BlurText
          text="Developer & Open Source Contributor"
          :delay="150"
          animate-by="words"
          direction="top"
          class-name="hero-sub"
        />
      </div>
      <div class="scroll-hint">
        <div class="scroll-arrow">&#8595;</div>
        <span>Scroll</span>
      </div>
    </section>

    <!-- ScrollFloat -->
    <section class="section">
      <ScrollFloat
        children="Building the Future"
        container-class-name="float-wrap"
        text-class-name="float-text"
        :animation-duration="1.2"
        ease="back.inOut(2)"
        :stagger="0.04"
      />
    </section>

    <!-- BlurText -->
    <section class="section">
      <div class="reveal-wrap">
        <BlurText
          text="I build tools, contribute to open source, and explore the intersection of AI and web technology."
          :delay="80"
          animate-by="words"
          direction="top"
          class-name="reveal-text"
        />
      </div>
    </section>

    <!-- CTA -->
    <section class="section section-cta">
      <div class="cta-box">
        <SplitText
          text="Explore My Work"
          tag="h2"
          :delay="60"
          :duration="1"
          ease="power3.out"
          text-align="center"
          class-name="cta-heading"
        />
        <p class="cta-desc">Check out the projects I've been working on</p>
        <router-link to="/projects" class="cta-btn">View Projects</router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
}

.section {
  height: 100vh;
  scroll-snap-align: start;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  position: relative;
}

/* Hero */
.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-title {
  margin-bottom: 1rem;
}

.hero-sub {
  font-size: clamp(1rem, 3vw, 1.4rem);
  opacity: 0.5;
  letter-spacing: 0.05em;
  font-weight: 300;
}

.scroll-hint {
  position: absolute;
  bottom: 2rem;
  opacity: 0.3;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  animation: bounce 2s infinite;
  text-align: center;
}

.scroll-arrow {
  font-size: 1.5rem;
  margin-bottom: 0.3rem;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

/* Float */
.float-wrap { text-align: center; }
.float-text {
  font-size: clamp(1.2rem, 4vw, 2.5rem) !important;
  font-weight: 600 !important;
  opacity: 0.8;
}

/* BlurText reveal */
.reveal-wrap { max-width: 650px; text-align: center; }
.reveal-text {
  font-size: clamp(1rem, 2.5vw, 1.3rem) !important;
  font-weight: 400 !important;
  opacity: 0.6;
  line-height: 2;
}

/* CTA */
.cta-box { text-align: center; }
.cta-heading {
  font-size: clamp(1.5rem, 4vw, 2.5rem) !important;
  font-weight: 300 !important;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
}
.cta-desc { opacity: 0.5; margin-bottom: 2rem; }
.cta-btn {
  display: inline-block;
  padding: 0.8em 2em;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
}
.cta-btn:hover { background: rgba(255, 255, 255, 0.1); border-color: white; }
</style>
