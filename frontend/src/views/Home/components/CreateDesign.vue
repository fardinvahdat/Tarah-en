
<template>
    <ul class="design-grid">
        <li v-for="(item, index) in menuOptions" :key="index" class="design-item">
            <a href="javascript:void(0)" class="design-link" @click="handleNavigation(item.width, item.height)">
                <div class="design-icon" :style="`color:${item.color};background-color:${item.color}30`">
                    <Icon :name="item.icon" class="icon" />
                </div>
                <div class="design-info">
                    <p class="design-title">{{ item.title }}</p>
                    <p class="design-dimensions">{{ item.height }} * {{ item.width }}</p>
                </div>
            </a>
        </li>
    </ul>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import { useCreateDesignStore } from '@/store'

const store = useCreateDesignStore()
const menuOptions = store.menuOptions
const router = useRouter()

const handleNavigation = (width, height) => {
    router.replace({
        path: `/studio`,
        query: {
            width,
            height,
        }
    })
}
</script>

<style scoped lang="scss">
.design-grid {
    margin-top: 6px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    
    @media (min-width: 768px) {
        grid-template-columns: repeat(5, 1fr);
    }
}

.design-item {
    animation: fadeIn 0.5s ease forwards;
    transform: translateY(20px);
    opacity: 0;
    
    @for $i from 1 through 20 {
        &:nth-child(#{$i}) {
            animation-delay: #{$i * 0.05}s;
        }
    }
}

.design-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 16px 8px;
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
        background-color: #f9f9f9;
        transform: translateY(-5px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
        
        .icon {
            transform: scale(1.2);
        }
        
        .design-title {
            color: var(--el-color-primary);
        }
    }
}

.design-icon {
    height: 56px;
    width: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
    
    .icon {
        font-size: 24px;
        transition: all 0.3s ease;
    }
}

.design-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.design-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    transition: color 0.3s ease;
}

.design-dimensions {
    font-size: 12px;
    color: #777;
    font-weight: 500;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
