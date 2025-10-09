
<template>
  <svg v-if="name === 'palette'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
    <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
    <circle cx="16.5" cy="10.5" r="1.5" fill="currentColor"/>
    <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
  </svg>
  <svg v-else-if="name === 'image'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
    <path d="M5 15L8 12L10 14L16 8L19 11V17C19 18.1046 18.1046 19 17 19H7C5.89543 19 5 18.1046 5 17V15Z" fill="currentColor" fill-opacity="0.5"/>
  </svg>
  <svg v-else-if="name === 'gradient'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
    <rect x="6" y="6" width="12" height="12" rx="6" fill="url(#gradientIcon)" />
    <defs>
      <linearGradient id="gradientIcon" x1="6" y1="6" x2="18" y2="18" gradientUnits="userSpaceOnUse">
        <stop stop-color="currentColor"/>
        <stop offset="1" stop-color="currentColor" stop-opacity="0.2"/>
      </linearGradient>
    </defs>
  </svg>
  <svg v-else-if="name === 'grid'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
  </svg>
  <svg v-else-if="name === 'texture'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3L9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M15 3L21 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M3 15L9 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M15 15L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M9 3L3 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M21 3L15 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M9 15L3 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M21 15L15 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
  <svg v-else-if="name === 'upload'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15V3M12 3L7 8M12 3L17 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3 15V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>
