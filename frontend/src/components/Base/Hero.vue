
<template>
    <div class="hero-container">
        <div class="hero-particles"></div>
        <slot />
    </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    // Create animated particle effect
    const container = document.querySelector('.hero-particles');
    if (!container) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties
        const size = Math.random() * 6 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 10;
        const opacity = Math.random() * 0.5 + 0.1;
        
        // Apply styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.opacity = opacity;
        
        container.appendChild(particle);
    }
});
</script>

<style lang="scss" scoped>
.hero-container {
    background: linear-gradient(172deg, #00c4cc 5%, #5a32fa 55%, #7d2ae8 105%);
    height: 200px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center;
    overflow: hidden;
    position: relative;
    box-shadow: 0 10px 30px rgba(90, 50, 250, 0.2);
    transition: all 0.3s ease;
    
    &:hover {
        transform: scale(1.01);
        box-shadow: 0 15px 35px rgba(90, 50, 250, 0.3);
    }
    
    @media (max-width: 768px) {
        height: 150px;
    }
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 50% 30%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%);
        pointer-events: none;
    }
    
    .hero-particles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 1;
    }
    
    .particle {
        position: absolute;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        pointer-events: none;
        animation: floatUp linear infinite;
    }
    
    ::v-deep > * {
        position: relative;
        z-index: 2;
    }
}

@keyframes floatUp {
    0% {
        transform: translateY(0) translateX(0) scale(1);
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        transform: translateY(-100px) translateX(20px) scale(0);
        opacity: 0;
    }
}
</style>
