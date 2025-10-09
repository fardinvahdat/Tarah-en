<template>
  <div class="flex">
    <Label class="w-[70px] h-[calc(100vh-20px)] z-10 bg-[#fff] my-[10px] rounded-l-lg shadow-lg" />
    <Menu />
    <!-- <Thumb class="w-[160px] h-full  flex-shrink-0 bg-[#fff] flex-col select-none hidden" /> -->
  </div>
</template>

<script lang="ts" setup>
import Label from "./Label/index.vue";
import Menu from "./Menu/index.vue";
// import Thumb from "./Thumb/index.vue";
</script>