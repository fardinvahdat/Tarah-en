<template>
    <div class="flex gap-2 md:flex-row flex-col-reverse relative">
        <SideBar class="md:w-[400px] w-full md:relative fixed md:bottom-0 bottom-12 left-0" />
        <Wrapper />
    </div>
</template>

<script lang="ts" setup>
import SideBar from '@/components/Base/SideBar.vue'
import Wrapper from './components/Wrapper.vue'
</script>