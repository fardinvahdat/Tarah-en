<template>
  <el-config-provider>

    <!-- Dialog Manager Component -->
    <DialogManager />

    <!-- Main Application Layout -->
    <div class="bg-light-l1 min-h-screen">
      <router-view />
    </div>

    <!-- PWA Components -->
    <PWANotifications />
    <PWAIntegration />

    <!-- File Handler Component -->
    <FileHandler ref="fileHandlerRef" />
  </el-config-provider>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore, useProcessStore, useTemplateStore, useWorkspaceStore, useRoleStore } from '@/store'
import PWANotifications from '@/components/PWA/PWANotifications.vue'
import PWAIntegration from '@/components/PWA/PWAIntegration.vue'
import DialogManager from '@/components/Dialog/DialogManager.vue'
import FileHandler from '@/components/File/FileHandler.vue'

// Optimized store usage - only destructure what we need


const fileHandlerRef = ref(null)

// PWA initialization on app load
const initializePWA = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    window.deferredPrompt = e
  })
}


onMounted(async () => {
  // Initialize PWA features
  initializePWA()

  // Initialize user session
  try {
    const authStore = useAuthStore()
    authStore.getUser()
  } catch (error) {
    console.error('Failed to initialize user session:', error)
  }
})
</script>

<style>
body {
  font-family: "";
}
</style>

<style lang="scss">
#app {
  height: 100%;
}
</style>

<style scoped>
:deep(#app .el-divider .el-divider--horizontal) {
  margin: 12px 0;
}
</style>
