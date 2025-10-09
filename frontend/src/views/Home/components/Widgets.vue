
<template>
    <Hero class="widget-hero">
        <div class="widget-content">
            <h2 class="widget-title">Design tools</h2>
            <p class="widget-subtitle">Use our advanced tools to better design</p>
            
            <div class="widget-cards">
                <div class="widget-card" v-for="(item, index) in widgetItems" :key="index">
                    <div class="widget-card-icon" :style="{backgroundColor: item.bgColor}">
                        <Icon :name="item.icon" />
                    </div>
                    <div class="widget-card-content">
                        <div class="widget-card-title">{{item.title}}</div>
                        <div class="widget-card-desc">{{item.description}}</div>
                    </div>
                </div>
            </div>
        </div>
    </Hero>
</template>

<script setup>
import Hero from '@/components/Base/Hero.vue'
import Icon from '@/components/Icon.vue'
import { ref } from 'vue'

const widgetItems = ref([
    {
        title: 'Remove the background',
        description: 'Easily delete the background of the images',
        icon: 'toolbar-menu-transparency',
        bgColor: 'rgba(41, 182, 246, 0.2)'
    },
    {
        title: 'Professional filters',
        description: 'Use a variety of filters for images',
        icon: 'filter',
        bgColor: 'rgba(124, 77, 255, 0.2)'
    },
    {
        title: 'Design with artificial intelligence',
        description: 'Use artificial intelligence for better design',
        icon: 'horizontal-flip',
        bgColor: 'rgba(236, 64, 122, 0.2)'
    },
    {
        title: 'Design of template',
        description: 'Use ready -made templates',
        icon: 'vertical-flip',
        bgColor: 'rgba(0, 200, 83, 0.2)'
    }
])
</script>

<style lang="scss" scoped>
.widget-hero {
    height: auto !important;
    min-height: 300px;
    padding: 30px;
    display: block !important;
}

.widget-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
}

.widget-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
}

.widget-subtitle {
    font-size: 16px;
    opacity: 0.85;
    margin-bottom: 30px;
}

.widget-cards {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 16px;
    width: 100%;
    max-width: 800px;
    
    @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
    }
}

.widget-card {
    background-color: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
        transform: translateY(-5px);
        background-color: rgba(255, 255, 255, 0.25);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    
    &-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        flex-shrink: 0;
    }
    
    &-content {
        flex-grow: 1;
    }
    
    &-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 4px;
    }
    
    &-desc {
        font-size: 12px;
        opacity: 0.85;
    }
}
</style>
