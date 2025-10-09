<template>
    <div class="loading-spinner">
        <div class="spinner" :style="`border-top:4px solid ${props.color}`"></div>
    </div>
</template>

<script setup>
const props = defineProps({
    color: {
        default: '#1a70ff'
    }
})
</script>

<style scoped>
.loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>