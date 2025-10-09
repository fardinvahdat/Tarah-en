<template>
    <ul class="flex items-center justify-evenly h-full">
        <li class="w-8 h-8 flex items-center justify-center" @click="emits('trigger', 'layers')">
            <Icon name="toolbar-menu-layers" />
        </li>
    </ul>
</template>

<script setup>
const emits = defineEmits(['trigger'])
</script>