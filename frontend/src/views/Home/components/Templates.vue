
<template>
    <div class="templates-container">
        <div class="section-header">
            <h1 class="section-title">قالب ها</h1>
            <div class="section-line"></div>
        </div>
        
        <ul class="templates-grid">
            <li v-for="(item, index) in templates" 
                :key="index" 
                @click="handleCickTemplate(item)"
                class="template-item"
                :style="{animationDelay: `${index * 0.1}s`}">
                <div class="template-content">
                    <img :src="item.image" :alt="item.title" class="template-image">
                    <div class="template-info">
                        <div class="template-title">{{ item.title }}</div>
                        <div class="template-badge">قالب</div>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { useTemplateStore } from '@/store'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const { handleGetTemplates } = useTemplateStore()
const router = useRouter()
const templates = ref([])

const handleCickTemplate = ({ width, height, id: templateID }) => {
    router.replace({
        path: `/studio`,
        query: {
            width,
            height,
            templateID
        }
    })
}

const getTemplates = async () => {
    try {
        templates.value = await handleGetTemplates(``)
    } catch (error) {
        console.log(error)
    }
}

onMounted(() => {
    getTemplates()
})
</script>

<style lang="scss" scoped>
.templates-container {
    // overflow: hidden;
    margin-bottom: 30px;
}

.section-header {
    margin-bottom: 20px;
}

.section-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
}

.section-line {
    height: 4px;
    width: 60px;
    background-color: $themeColor;
    border-radius: 2px;
    margin-top: 8px;
}

.templates-grid {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 8px 0 20px;
    gap: 16px;
    
    &::-webkit-scrollbar {
        height: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 10px;
        
        &:hover {
            background: #aaa;
        }
    }
}

.template-item {
    min-width: 70%;
    flex-shrink: 0;
    animation: scaleIn 0.6s ease forwards;
    opacity: 0;
    
    @media (min-width: 768px) {
        min-width: 33%;
    }
    
    @media (min-width: 1024px) {
        min-width: 20%;
    }
    
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
}

.template-content {
    background-color: white;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #eee;
    position: relative;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        border-color: $themeColor;
        
        .template-image {
            transform: scale(1.05);
        }
    }
}

.template-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
    transition: all 0.3s ease;
}

.template-info {
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.template-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
}

.template-badge {
    font-size: 10px;
    background-color: $themeColor;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
}
</style>
