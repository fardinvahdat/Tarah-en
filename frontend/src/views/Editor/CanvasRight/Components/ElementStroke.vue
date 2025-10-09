<template>
  <div class="element-stroke panel-section">
    <div class="panel-header">
      <div class="panel-title">
        <Icon name="circle-dashed" class="panel-icon" />
        <span>Stroke</span>
      </div>
      <el-switch v-model="openStroke" @change="toggleStroke()" class="panel-switch"></el-switch>
    </div>

    <div v-if="openStroke" class="panel-content mt-3">
      <!-- Stroke Style -->
      <div class="control-row">
        <div class="control-label">Style</div>
        <div class="style-options">
          <div class="style-option" :class="{ active: strokeStyle === 0 }"
            @click="strokeStyle = 0; updateStrokeStyle()">
            <Icon name="line-solid" />
            <span>Uniform</span>
          </div>
          <div class="style-option" :class="{ active: strokeStyle === 1 }"
            @click="strokeStyle = 1; updateStrokeStyle()">
            <Icon name="line-dashed" />
            <span>Dashed</span>
          </div>
        </div>
      </div>

      <!-- Stroke Join Style -->
      <div class="control-row">
        <div class="control-label">Connect</div>
        <div class="join-style-options">
          <div v-for="option in joinStyleOptions" :key="option.value" class="join-style-option"
            :class="{ active: handleElement.strokeLineJoin === option.value }"
            @click="updateStrokeLineJoin(option.value)">
            <img :src="option.icon" :alt="option.label" class="join-style-icon" />
            <span class="join-style-label">{{ option.label }}</span>
          </div>
        </div>
      </div>

      <!-- Stroke Color -->
      <div class="control-row">
        <div class="control-label">Color</div>
        <el-popover trigger="click" width="265">
          <template #reference>
            <div class="color-preview-button control-input" :style="{ backgroundColor: handleElement.stroke }">
              <Icon name="color-picker" class="color-pick-icon" />
            </div>
          </template>
          <ColorPicker :modelValue="handleElement.stroke" @update:modelValue="updateStrokeColor" />
        </el-popover>
      </div>

      <!-- Stroke Width -->
      <div class="control-slider">
        <div class="control-slider-header">
          <span>Thickness</span>
          <span class="control-slider-value">{{ handleElement.strokeWidth }}</span>
        </div>
        <el-slider class="slider" v-model="handleElement.strokeWidth" :min="1" :max="20"
          @change="updateStrokeWidth"></el-slider>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useTemplatesStore } from '@/store'
import { TextboxElement } from '@/types/canvas'
import useCanvas from '@/views/Canvas/useCanvas'

const props = defineProps({
  hasStroke: {
    type: Boolean,
    required: true,
  },
})

const mainStore = useMainStore()
const templatesStore = useTemplatesStore()
const [canvas] = useCanvas()
const { canvasObject } = storeToRefs(mainStore)

const handleElement = computed(() => canvasObject.value as TextboxElement)
const openStroke = ref(props.hasStroke)
const strokeStyle = ref(0)

// Line join style options with visualizations
const joinStyleOptions = [
  {
    value: 'bevel',
    label: 'Bevel',
    icon: '/icons/bevel-join.svg'
  },
  {
    value: 'round',
    label: 'Round',
    icon: '/icons/round-join.svg'
  },
  {
    value: 'miter',
    label: 'Miter',
    icon: '/icons/miter-join.svg'
  }
]

onMounted(() => {
  openStroke.value = props.hasStroke
  // Set initial stroke style based on dash array
  if (handleElement.value && handleElement.value.strokeDashArray) {
    strokeStyle.value = 1
  } else {
    strokeStyle.value = 0
  }
})

// Watch for changes to the element's stroke dash array
watch(() => handleElement.value?.strokeDashArray, (newVal) => {
  if (newVal) {
    strokeStyle.value = 1
  } else {
    strokeStyle.value = 0
  }
}, { deep: true })

const updateStrokeColor = (stroke: string) => {
  if (!handleElement.value) return
  handleElement.value.set({ stroke })
  templatesStore.modifedElement(handleElement.value, { stroke })
  canvas.renderAll()
}

const updateStrokeWidth = (strokeWidth: number) => {
  if (!handleElement.value) return
  handleElement.value.set({ strokeWidth })
  templatesStore.modifedElement(handleElement.value, { strokeWidth })
  canvas.renderAll()
}

const updateStrokeLineJoin = (strokeLineJoin: string) => {
  if (!handleElement.value) return
  handleElement.value.set({ strokeLineJoin })
  templatesStore.modifedElement(handleElement.value, { strokeLineJoin })
  canvas.renderAll()
}

const updateStrokeStyle = () => {
  if (!handleElement.value) return
  const strokeDashArray = strokeStyle.value === 1 ? [6, 6] : null
  handleElement.value.set({ strokeDashArray })
  templatesStore.modifedElement(handleElement.value, { strokeDashArray })
  canvas.renderAll()
}

const toggleStroke = () => {
  if (!handleElement.value) return
  const stroke = openStroke.value ? (!handleElement.value.stroke ? '#000' : handleElement.value.stroke) : ''
  const strokeWidth = openStroke.value ? (!handleElement.value.strokeWidth ? 1 : handleElement.value.strokeWidth) : 0
  const paintFirst = openStroke.value ? 'stroke' : 'fill'
  handleElement.value.set({ stroke, strokeWidth, paintFirst })
  templatesStore.modifedElement(handleElement.value, { stroke, strokeWidth, paintFirst })
  canvas.renderAll()
}
</script>

<style lang="scss" scoped>
.element-stroke {
  @apply bg-gray-50 rounded-xl p-4;
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

.panel-content {
  @apply bg-white p-4 rounded-xl;
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

.control-input {
  @apply w-full;
}

.style-options {
  @apply grid grid-cols-2 gap-2;
}

.style-option {
  @apply flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-200 cursor-pointer transition-all duration-300 hover:translate-y-[-3px] hover:border-primary-default;

  &.active {
    @apply border-primary-default bg-blue-50;
  }
}

.join-style-options {
  @apply w-full grid grid-cols-3 gap-2;
}

.join-style-option {
  @apply flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-200 cursor-pointer transition-all duration-300 hover:translate-y-[-3px] hover:border-primary-default;

  &.active {
    @apply border-primary-default bg-blue-50;
  }
}

.join-style-icon {
  @apply w-8 h-8 mb-1;
}

.join-style-label {
  @apply text-xs text-gray-600;
}

.color-preview-button {
  @apply h-10 rounded-xl flex items-center justify-center cursor-pointer border border-gray-200 transition-all duration-300 hover:translate-y-[-3px] hover:shadow-md;
}

.color-pick-icon {
  @apply text-white drop-shadow-sm;
}

.control-slider {
  @apply mt-4;
}

.control-slider-header {
  @apply flex justify-between text-sm text-gray-600 mb-2;
}

.control-slider-value {
  @apply min-w-[24px] px-2 py-1 bg-gray-100 text-xs rounded-md text-center;
}

:deep(.el-switch.is-checked .el-switch__core) {
  @apply bg-primary-default border-primary-default;
}

:deep(.el-slider__runway) {
  @apply my-2;
}

:deep(.el-slider__bar) {
  @apply bg-primary-default;
}

:deep(.el-slider__button) {
  @apply border-primary-default;
}
</style>
