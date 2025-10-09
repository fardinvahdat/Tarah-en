<template>
    <div
        class="p-2 md:bg-white w-full rounded-2xl shadow-xl border-[1px] border-gray-200 overflow-y-auto max-h-[calc(100vh-20px)] grid gap-10">
        <Header />
        <Hero class="scale-in">
            <div class="text-white text-lg md:text-4xl flex flex-col items-center gap-3 hero-container">
                <div class="tracking-wide hero-title">امروز قصد طراحی چی رو داری؟</div>
                <div class="text-base font-light opacity-90 hero-subtitle">ابزار طراحی حرفه‌ای برای همه</div>
                <div class="hero-particles"></div>
            </div>
        </Hero>
        <Workspaces class="fade-in" />
    </div>
</template>

<script setup>
import Header from '@/components/Base/Header.vue';
import Hero from '@/components/Base/Hero.vue'
import Workspaces from "./Workspaces.vue"
import { onMounted } from 'vue';

onMounted(() => {
    // Create particles for the hero section
    const heroContainer = document.querySelector('.hero-container');
    const particlesContainer = document.querySelector('.hero-particles');

    if (heroContainer && particlesContainer) {
        for (let i = 0; i < 50; i++) {
            createParticle(particlesContainer);
        }
    }
});

function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    // Random position, size, and animation delay
    const size = Math.random() * 5 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.opacity = Math.random() * 0.6 + 0.2;
    particle.style.animationDelay = `${Math.random() * 5}s`;
    particle.style.animationDuration = `${Math.random() * 10 + 10}s`;

    container.appendChild(particle);
}
</script>

<style scoped>
.hero-title {
    animation: textGlow 2s infinite alternate;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    position: relative;
    z-index: 10;
}

.hero-subtitle {
    animation: fadeInUp 1s ease-out 0.5s forwards;
    opacity: 0;
    transform: translateY(10px);
    position: relative;
    z-index: 10;
}

.hero-container {
    position: relative;
    overflow: hidden;
}

.hero-particles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
}

.particle {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    animation: floatParticle linear infinite;
    pointer-events: none;
}

@keyframes textGlow {
    0% {
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
    }

    100% {
        text-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 0.9;
        transform: translateY(0);
    }
}

@keyframes floatParticle {
    0% {
        transform: translateY(0) rotate(0deg);
    }

    100% {
        transform: translateY(-100px) rotate(360deg);
    }
}
</style>
