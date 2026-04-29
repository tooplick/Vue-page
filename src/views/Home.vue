<script setup>
import SplitText from '../components/SplitText.vue'
import ScrollFloat from '../components/ScrollFloat.vue'
import ScrollReveal from '../components/ScrollReveal.vue'
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <SplitText
        text="TOOPLICK"
        tag="h1"
        :delay="80"
        :duration="1"
        ease="power3.out"
        text-align="center"
        class-name="hero-title"
      />
      <p class="hero-sub">Developer & Open Source Contributor</p>
      <div class="scroll-hint">
        <div class="scroll-arrow">&#8595;</div>
        <span>Scroll</span>
      </div>
    </section>

    <!-- ScrollFloat -->
    <section class="section section-float">
      <ScrollFloat
        children="Building the Future"
        container-class-name="float-wrap"
        text-class-name="float-text"
        :animation-duration="1.2"
        ease="back.inOut(2)"
        :stagger="0.04"
      />
    </section>

    <!-- ScrollReveal -->
    <section class="section section-reveal">
      <ScrollReveal
        children="I build tools, contribute to open source, and explore the intersection of AI and web technology."
        :enable-blur="true"
        :base-opacity="0.1"
        :base-rotation="3"
        :blur-strength="4"
        container-class-name="reveal-wrap"
        text-class-name="reveal-text"
      />
    </section>

    <!-- CTA -->
    <section class="section section-cta">
      <div class="cta-box">
        <h2 class="cta-heading">Explore My Work</h2>
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

/* Hero */
.hero {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  position: relative;
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

/* Sections */
.section {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.float-wrap { text-align: center; }
.float-text {
  font-size: clamp(1.2rem, 4vw, 2.5rem) !important;
  font-weight: 600 !important;
  opacity: 0.8;
}

.reveal-wrap { max-width: 650px; text-align: center; }
.reveal-text {
  font-size: clamp(1rem, 2.5vw, 1.3rem) !important;
  font-weight: 400 !important;
  opacity: 0.6;
  line-height: 2;
}

/* CTA */
.section-cta { min-height: 50vh; }
.cta-box { text-align: center; }
.cta-heading {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 300;
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
