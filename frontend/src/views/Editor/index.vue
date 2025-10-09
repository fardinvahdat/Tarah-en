<template>
  <div class="relative">
    <Computer :isLoading="isLoading" />
    
    <!-- Performance Monitoring Widget -->
    <PerformanceWidget v-if="false" />
  </div>
</template>

<script lang="ts" setup>
import Computer from '@/views/Editor/computer.vue'
import PerformanceWidget from '@/components/Performance/PerformanceWidget.vue'
import { useEditorInitialization } from './components/EditorInitialization'
import { useEditorEventHandlers } from './components/EditorEventHandlers'

import { useMainStore } from '@/store'
import { storeToRefs } from 'pinia'
import { LocalStorageDiscardedKey, WorkSpaceCommonType } from '@/configs/canvas'
import { globalErrorHandler } from '@/utils/globalErrorHandler'
import { mobileReloadPrevention, initMobileReloadPrevention } from '@/utils/mobileReloadPrevention'
import { canvasMemoryManager } from '@/utils/canvasMemoryManager'

const { databaseId } = storeToRefs(useMainStore())

// Initialize error handling and mobile protection
globalErrorHandler.init()
initMobileReloadPrevention()
canvasMemoryManager.init()

// More intelligent beforeunload handling instead of always returning false
if (import.meta.env.MODE === 'production') {
  window.onbeforeunload = (event) => {
    // Check if we actually have unsaved changes
    const hasUnsavedChanges = document.querySelector('.canvas-container')?.hasAttribute('data-modified')
    if (hasUnsavedChanges) {
      return 'شما تغییرات ذخیره نشده دارید. آیا مطمئن هستید؟'
    }
    return null // Allow normal navigation
  }
}


const { isLoading, initializeEditor } = useEditorInitialization()
const { setupFabricEventListeners } = useEditorEventHandlers()

onMounted(async () => {
  try {
    await initializeEditor()
    setupFabricEventListeners()
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 300);
  }
})

// When the application is logged out, record the database ID of this indexedDB in localStorage for clearing the database later
window.addEventListener('unload', () => {
  const discardedDB = localStorage.getItem(LocalStorageDiscardedKey)
  const discardedDBList: string[] = discardedDB ? JSON.parse(discardedDB) : []
  discardedDBList.push(databaseId.value)
  const newDiscardedDB = JSON.stringify(discardedDBList)
  localStorage.setItem(LocalStorageDiscardedKey, newDiscardedDB)
})


</script>
<style lang="scss" scoped>
.full-size {
  height: 100%;
  width: 100%;
}

.background-grid {
  --offsetX: 0px;
  --offsetY: 0px;
  --size: 8px;
  --color: #dedcdc;
  // background-image:
  //   linear-gradient(45deg, var(--color) 25%, transparent 0, transparent 75%, var(--color) 0),
  //   linear-gradient(45deg, var(--color) 25%, transparent 0, transparent 75%, var(--color) 0);
  // background-position: var(--offsetX) var(--offsetY), calc(var(--size) + var(--offsetX)) calc(var(--size) + var(--offsetY));
  // background-size: calc(var(--size) * 2) calc(var(--size) * 2);
}
</style>
<style>
.el-dialog.edit-text .el-dialog__header {
  padding: 0 !important;
  background: transparent;
}

.el-dialog.edit-text .el-dialog__body {
  height: 100%;
  background: transparent;
}

.el-dialog {
  box-shadow: none !important;
}
</style>
