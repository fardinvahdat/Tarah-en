
<template>
  <div ref="wrapperRef" @mousedown="addDrawAreaFocus" v-contextmenu="contextMenus" v-click-outside="remDrawAreaFocus">
    <canvas ref="canvasRef" id="canvasRef" class="background-grid"></canvas>
    
    <!-- Optimized text editing dialog -->
    <TextEditDialog 
      v-model="isEditTextDialogVisible"
      :staged-text="stagedTextValue"
      @save="handleTextSave"
      @close="handleCloseEditTextDialog"
    />
    
    <!-- Canvas controls component -->
    <!-- <CanvasControls /> -->
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, computed, provide } from 'vue'
import { useFabricStore, useMainStore, useStudioStore } from '@/store'
import { contextMenus } from '@/configs/contextMenu'
import { initOptimizedEditor } from '@/views/Canvas/useOptimizedCanvas'
import useCanvas from "@/views/Canvas/useCanvas"
import useCanvasHotkey from '@/hooks/useCanvasHotkey'
import useCanvasPerformance from '@/hooks/useCanvasPerformance'
import CanvasControls from '@/components/Canvas/CanvasControls.vue'
import TextEditDialog from '@/components/Canvas/TextEditDialog.vue'

const fabricStore = useFabricStore()
const mainStore = useMainStore()
const studioStore = useStudioStore()

const { wrapperRef, canvasRef } = storeToRefs(fabricStore)
const { drawAreaFocus, canvasObject } = storeToRefs(mainStore)
const { isEditTextDialogVisible, stagedTextValue } = storeToRefs(studioStore)

const { keydownListener, keyupListener, pasteListener } = useCanvasHotkey()
const { cleanup } = useCanvasPerformance()

const handleElement = computed(() => canvasObject.value)

// Optimized image source for filters
const selectedImageSrc = computed(() => {
  if (handleElement.value?.type === 'image') {
    return handleElement.value.getSrc()
  }
  return null
})

provide('selectedImageSrc', selectedImageSrc)

const addDrawAreaFocus = () => {
  if (!drawAreaFocus.value) mainStore.setDrawAreaFocus(true)
}

const remDrawAreaFocus = () => {
  if (drawAreaFocus.value) mainStore.setDrawAreaFocus(false)
}

const handleTextSave = (newText: string) => {
  const [canvas] = useCanvas();

  if (!handleElement.value) return;

  // Save the previous text for history
  const prevText = handleElement.value.text;

  // Update the text value
  handleElement.value.set('text', newText);
  handleElement.value.exitEditing();

  // Only record in history if text actually changed
  if (prevText !== newText) {
    // Create snapshot for text change
    // addHistorySnapshot({
    //   type: SnapshotType.MODIFY,
    //   index: canvas._objects.indexOf(handleElement.value),
    //   target: handleElement.value.toObject(),
    //   property: 'text',
    //   oldValue: prevText,
    //   newValue: newText,
    //   action: 'textEdited'
    // });
  }

  canvas.requestRenderAll();
  handleCloseEditTextDialog()
}

const handleCloseEditTextDialog = () => {
  const [canvas] = useCanvas();
  isEditTextDialogVisible.value = false;
  canvas.requestRenderAll();
}

onMounted(async () => {
  const query = new URLSearchParams(window.location.search);
  const templateId = query.get('template');
  await initOptimizedEditor(templateId)
  
  document.addEventListener('keydown', keydownListener)
  document.addEventListener('keyup', keyupListener)
  window.addEventListener('blur', keyupListener)
  window.addEventListener('paste', pasteListener as any)
})

onUnmounted(() => {
  document.removeEventListener('keydown', keydownListener)
  document.removeEventListener('keyup', keyupListener)
  window.removeEventListener('blur', keyupListener)
  document.removeEventListener('paste', pasteListener as any)
  cleanup()
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
