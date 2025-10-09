
<template>
  <div class="element-gradient panel-section">
    <div class="panel-header">
      <div class="panel-title">
        <Icon name="gradient" class="panel-icon" />
        <span>Gradeiant</span>
      </div>
      <el-switch v-model="hasGradient" @change="toggleColorMask(hasGradient)" class="panel-switch"></el-switch>
    </div>
    
    <div v-if="hasGradient" class="panel-content mt-3">
      <!-- Gradient Type -->
      <div class="control-row">
        <div class="control-label">Type</div>
        <div class="style-options">
          <div 
            class="style-option" 
            :class="{ active: gradientType === 'linear' }"
            @click="updateGradientType('linear')"
          >
            <Icon name="line-solid" />
            <span>Linear</span>
          </div>
          <div 
            class="style-option" 
            :class="{ active: gradientType === 'radial' }"
            @click="updateGradientType('radial')"
          >
            <Icon name="circle" />
            <span>Radial</span>
          </div>
        </div>
      </div>
      
      <!-- Gradient Angle (for linear gradients) -->
      <div class="control-row" v-if="gradientType === 'linear'">
        <div class="control-label">Angle</div>
        <el-slider 
          class="control-input" 
          v-model="gradientAngle" 
          :min="0" 
          :max="359" 
          @change="updateGradient"
        ></el-slider>
      </div>
      
      <!-- Gradient Colors -->
      <div class="control-row">
        <div class="control-label">First color</div>
        <el-popover trigger="click" width="265">
          <template #reference>
            <div 
              class="color-preview-button control-input" 
              :style="{ backgroundColor: gradientColors[0] }"
            >
              <Icon name="color-picker" class="color-pick-icon" />
            </div>
          </template>
          <ColorPicker 
            :modelValue="gradientColors[0]" 
            @update:modelValue="(color) => updateGradientColor(0, color)"
          />
        </el-popover>
      </div>
      
      <div class="control-row">
        <div class="control-label">Second color</div>
        <el-popover trigger="click" width="265">
          <template #reference>
            <div 
              class="color-preview-button control-input" 
              :style="{ backgroundColor: gradientColors[1] }"
            >
              <Icon name="color-picker" class="color-pick-icon" />
            </div>
          </template>
          <ColorPicker 
            :modelValue="gradientColors[1]" 
            @update:modelValue="(color) => updateGradientColor(1, color)"
          />
        </el-popover>
      </div>
      
      <!-- Gradient Preview -->
      <div class="control-row">
        <div class="control-label">Preview</div>
        <div class="gradient-preview control-input" :style="{ background: gradientPreview }"></div>
      </div>
      
      <!-- Opacity -->
      <div class="control-row">
        <div class="control-label">Transparency</div>
        <el-slider 
          class="control-input" 
          v-model="maskAlpha" 
          :min="0" 
          :max="1" 
          :step="0.01" 
          @change="updateMaskAlpha"
        ></el-slider>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useTemplatesStore } from '@/store'
import { ImageElement } from '@/types/canvas'
import { filters, Image } from 'fabric'
import useCanvas from '@/views/Canvas/useCanvas'

const BlendColorFilter = 'BlendColor'
const templatesStore = useTemplatesStore()
const maskColor = ref('#000000')
const maskAlpha = ref(0.3)
const gradientType = ref('linear')
const gradientAngle = ref(90)
const gradientColors = ref(['#ffffff', '#000000'])

const mainStore = useMainStore()
const { canvasObject } = storeToRefs(mainStore)

const hasGradient = ref(false)
const handleElement = computed(() => canvasObject.value as Image)

const [canvas] = useCanvas()

// Create a preview of the gradient
const gradientPreview = computed(() => {
  if (gradientType.value === 'linear') {
    return `linear-gradient(${gradientAngle.value}deg, ${gradientColors.value[0]}, ${gradientColors.value[1]})`
  } else {
    return `radial-gradient(circle, ${gradientColors.value[0]}, ${gradientColors.value[1]})`
  }
})

// Initialize component based on current element state
onMounted(() => {
  if (!handleElement.value) return
  
  // Check if element already has a BlendColor filter
  const blendFilter = handleElement.value.filters?.find(filter => filter.type === BlendColorFilter)
  
  if (blendFilter) {
    hasGradient.value = true
    // @ts-ignore
    maskColor.value = blendFilter.color || '#000000'
    // @ts-ignore
    maskAlpha.value = blendFilter.alpha || 0.3
  }
})

// Update mask color
const updateMaskColor = (color: string) => {
  maskColor.value = color
  changeImageFilter()
}

// Update mask alpha/opacity
const updateMaskAlpha = () => {
  changeImageFilter()
}

// Update gradient type (linear or radial)
const updateGradientType = (type: string) => {
  gradientType.value = type as 'linear' | 'radial'
  updateGradient()
}

// Update gradient color at specific index
const updateGradientColor = (index: number, color: string) => {
  gradientColors.value[index] = color
  updateGradient()
}

// Update gradient based on current settings
const updateGradient = () => {
  // Generate a CSS gradient
  let gradientCSS = ''
  
  if (gradientType.value === 'linear') {
    gradientCSS = `linear-gradient(${gradientAngle.value}deg, ${gradientColors.value[0]}, ${gradientColors.value[1]})`
  } else {
    gradientCSS = `radial-gradient(circle, ${gradientColors.value[0]}, ${gradientColors.value[1]})`
  }
  
  // Apply the gradient as a fill pattern
  if (handleElement.value) {
    // For now, we'll use the blend filter as a workaround
    // In a real implementation, you might want to create a proper gradient fill
    const averageColor = blendColors(gradientColors.value[0], gradientColors.value[1])
    maskColor.value = averageColor
    changeImageFilter()
  }
}

// Apply filter to image
const changeImageFilter = () => {
  if (!handleElement.value) return
  
  const blendFilter = new filters.BlendColor({
    color: maskColor.value,
    mode: 'add',
    alpha: maskAlpha.value
  })
  
  // Remove any existing BlendColor filters
  handleElement.value.filters = handleElement.value.filters?.filter(obj => obj.type !== BlendColorFilter) || []
  
  // Add the new filter
  // @ts-ignore
  handleElement.value.filters.push(blendFilter)
  
  // Apply filters and update the canvas
  handleElement.value.applyFilters()
  canvas.renderAll()
  
  // Save changes to the template
  templatesStore.modifedElement(handleElement.value, { filters: handleElement.value.filters })
}

// Toggle the color mask on/off
const toggleColorMask = (status: boolean) => {
  if (!handleElement.value) return
  
  if (status) {
    // Add the filter
    changeImageFilter()
  } else {
    // Remove the filter
    handleElement.value.filters = handleElement.value.filters?.filter(obj => obj.type !== BlendColorFilter) || []
    handleElement.value.applyFilters()
    canvas.renderAll()
    
    // Save changes to the template
    templatesStore.modifedElement(handleElement.value, { filters: handleElement.value.filters })
  }
}

// Helper function to blend two colors
const blendColors = (color1: string, color2: string): string => {
  // Parse hex colors
  const r1 = parseInt(color1.slice(1, 3), 16)
  const g1 = parseInt(color1.slice(3, 5), 16)
  const b1 = parseInt(color1.slice(5, 7), 16)
  
  const r2 = parseInt(color2.slice(1, 3), 16)
  const g2 = parseInt(color2.slice(3, 5), 16)
  const b2 = parseInt(color2.slice(5, 7), 16)
  
  // Average the colors
  const r = Math.round((r1 + r2) / 2)
  const g = Math.round((g1 + g2) / 2)
  const b = Math.round((b1 + b2) / 2)
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.element-gradient {
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
  @apply flex items-center mb-4 gap-3;
  
  &:last-child {
    @apply mb-0;
  }
}

.control-label {
  @apply w-16 text-sm text-gray-600;
}

.control-input {
  @apply flex-1;
}

.style-options {
  @apply flex-1 grid grid-cols-2 gap-2;
}

.style-option {
  @apply flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-200
    cursor-pointer transition-all duration-200 hover:border-primary-default;
  
  &.active {
    @apply border-primary-default bg-blue-50;
  }
}

.color-preview-button {
  @apply h-10 rounded-xl flex items-center justify-center cursor-pointer border border-gray-200
    transition-all duration-200 hover:shadow-md;
}

.color-pick-icon {
  @apply text-white drop-shadow-md;
}

.gradient-preview {
  @apply h-10 rounded-xl border border-gray-200;
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
