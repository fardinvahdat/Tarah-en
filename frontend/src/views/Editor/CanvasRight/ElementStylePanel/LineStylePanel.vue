
<template>
  <div class="line-style-panel !p-0">
    <ElementPosition />
    <el-divider style="margin: 12px 0" />

    <div class="panel-section">
      <div class="panel-header mb-3">
        <div class="panel-title">
          <Icon name="line-solid" class="panel-icon" />
          <span>استایل خط</span>
        </div>
      </div>

      <div class="control-row">
        <div class="control-label">سبک</div>
        <div class="style-options">
          <div class="style-option" :class="{ active: lineStyle === 0 }" @click="lineStyle = 0; changeLineStyle()">
            <Icon name="line-solid" />
            <span>Uniform</span>
          </div>
          <div class="style-option" :class="{ active: lineStyle === 1 }" @click="lineStyle = 1; changeLineStyle()">
            <Icon name="line-dashed" />
            <span>Dashed</span>
          </div>
        </div>
      </div>

      <div class="control-row">
        <div class="control-label">Color</div>
        <el-popover trigger="click" width="265">
          <template #reference>
            <div class="color-preview-button" :style="{ backgroundColor: handleElement.stroke }">
              <Icon name="color-picker" class="color-pick-icon" />
            </div>
          </template>
          <ColorPicker :modelValue="handleElement.stroke" @update:modelValue="updateStrokeColor" />
        </el-popover>
      </div>

      <div class="control-slider">
        <div class="control-slider-header">
          <span>Thickness</span>
          <span class="control-slider-value">{{ handleElement.strokeWidth }}</span>
        </div>
        <el-slider v-model="handleElement.strokeWidth" :min="1" :max="20" @change="updateTemplateElement"></el-slider>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useMainStore, useTemplatesStore } from '@/store'
import useCanvas from '@/views/Canvas/useCanvas'
import { Polyline } from '@/extension/object/Polyline'
import { LineElement } from '@/types/canvas'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import ElementPosition from '../Components/ElementPosition.vue'
import ElementShadow from '../Components/ElementShadow.vue'
import ElementOpacity from '../Components/ElementOpacity.vue'
import { LinePoint } from '@/types/elements'

const mainStore = useMainStore()
const templatesStore = useTemplatesStore()
const { canvasObject } = storeToRefs(mainStore)
const [canvas] = useCanvas()
const handleElement = computed(() => canvasObject.value as Polyline)
const hasShadow = computed(() => handleElement.value.shadow ? true : false)
const lineStyle = ref<number>(handleElement.value.strokeDashArray ? 1 : 0)

// Set initial stroke style based on dash array
watch(() => canvasObject.value, () => {
  if (handleElement.value?.strokeDashArray) {
    lineStyle.value = 1
  } else {
    lineStyle.value = 0
  }
}, { immediate: true })

const updateStrokeColor = (color: string) => {
  if (!handleElement.value) return
  handleElement.value.stroke = color
  updateTemplateElement({ stroke: color })
}

const changeLineStyle = () => {
  if (!handleElement.value) return
  const strokeDashArray = lineStyle.value === 1 ? [6, 6] : null
  handleElement.value.set({ strokeDashArray })
  updateTemplateElement({ strokeDashArray })
}

const changeLineMode = (value: LinePoint, mode: 'start' | 'end') => {
  handleElement.value.setLineMode(value, mode)
  let options: Record<string, any> = { 'startStyle': value }
  if (mode === 'end') {
    options = { 'endStyle': value }
  }
  updateTemplateElement(options)
}

const updateTemplateElement = (options: Record<string, any>) => {
  canvas.renderAll()
  templatesStore.modifedElement(handleElement.value, options)
}
</script>

<style lang="scss" scoped>
.line-style-panel {
  @apply bg-white rounded-xl p-4;
}

.panel-section {
  @apply bg-gray-50 p-4 rounded-xl;
}

.panel-header {
  @apply flex items-center justify-between;
}

.panel-title {
  @apply flex items-center gap-2 font-semibold text-gray-800;
}

.panel-icon {
  @apply text-primary-default;
}

.control-row {
  @apply mb-4;

  &:last-child {
    @apply mb-0;
  }
}

.control-label {
  @apply mb-2 text-sm text-gray-600;
}

.style-options {
  @apply grid grid-cols-2 gap-2 mb-4;
}

.style-option {
  @apply flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-gray-200 cursor-pointer transition-all duration-200 hover:border-primary-default;

  &.active {
    @apply border-primary-default bg-blue-50;
  }
}

.color-preview-button {
  @apply w-full h-12 rounded-xl flex items-center justify-center cursor-pointer border border-gray-200 transition-all duration-200 hover:shadow-md;
}

.color-pick-icon {
  @apply text-white drop-shadow-md;
}

.control-slider {
  @apply mt-4;
}

.control-slider-header {
  @apply flex justify-between text-sm text-gray-600 mb-1;
}

.control-slider-value {
  @apply min-w-[24px] px-2 py-1 bg-gray-100 text-xs rounded-md text-center;
}

:deep(.el-divider) {
  background-color: #f0f0f0;
}

:deep(.el-slider__bar) {
  @apply bg-primary-default;
}

:deep(.el-slider__button) {
  @apply border-primary-default;
}
</style>
