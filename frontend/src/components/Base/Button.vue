<template>
    <button type="button"
        class="flex items-center justify-center bg-primary-b1 hover:bg-opacity-90 bg-opacity-100 disabled:bg-primary-b2 disabled:cursor-not-allowed rounded-xl text-white text-base py-2"
        :disabled="props.disabled">
        <slot />
    </button>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    disabled: {
        default: false
    }
})
</script>