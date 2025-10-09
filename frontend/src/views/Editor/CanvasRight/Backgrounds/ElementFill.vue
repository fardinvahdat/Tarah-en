<template>
  <div class="element-fill panel-section">
    <div class="panel-header">
      <div class="panel-title">
        <Icon name="fill" class="panel-icon" />
        <span>Coloring</span>
      </div>
    </div>

    <div class="fill-type-selector mt-4">
      <div class="grid grid-cols-3 gap-2">
        <template v-for="(item, index) in BackgroundFillMode" :key="index">
          <div class="fill-type-option" :class="{ 'active': elementFillType === item.id }"
            @click="handleFillTypeChange(item.id)">
            <div class="fill-type-icon">
              <Icon :name="getFillTypeIcon(item.id)" />
            </div>
            <div class="fill-type-label">{{ item.name }}</div>
          </div>
        </template>
      </div>
    </div>

    <!-- Solid Color Fill -->
    <div v-if="elementFillType === 0" class="fill-content mt-4">
      <el-popover trigger="click" :width="265">
        <template #reference>
          <div class="color-preview-button" :style="{ backgroundColor: elementFill }">
            <Icon name="color-picker" class="color-pick-icon" />
          </div>
        </template>
        <ColorPicker :modelValue="elementFill" @update:modelValue="updateFill" />
      </el-popover>
    </div>

    <!-- Image Pattern Fill -->
    <div v-if="elementFillType === 1" class="fill-content mt-4">
      <ElementPatterns class="mt-2" />
    </div>

    <!-- Gradient Fill -->
    <div v-if="elementFillType === 2" class="fill-content mt-4">
      <div class="gradient-preview" :style="{ backgroundImage: elementGradient }"></div>

      <div class="gradient-controls mt-4">
        <div class="background-gradient-body grid grid-cols-6 mb-4">
          <div class="gradient-content p-1" v-for="(item, nameIndex) in GradientColorLibs" :key="nameIndex"
            @click="changeGradientName(item.name)">
            <GradientFill :name="item.name" :type="elementGradientMode" :colors="item.colors" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 mb-3">
          <div class="gradient-type-selector">
            <div class="control-label mb-2">Gradiant type</div>
            <div class="type-options">
              <div class="type-option" :class="{ active: elementGradientMode === 'linear' }"
                @click="elementGradientMode = 'linear'; changeGradient()">
                <Icon name="line-solid" />
                <span>Linear</span>
              </div>
              <div class="type-option" v-if="!isArcText" :class="{ active: elementGradientMode === 'radial' }"
                @click="elementGradientMode = 'radial'; changeGradient()">
                <Icon name="circle" />
                <span>Radial</span>
              </div>
            </div>
          </div>
        </div>


        <!-- Gradient Angle (for linear gradients) -->
        <div class="control-row" v-if="elementGradientMode === 'linear'">
          <div class="control-label">Angle</div>
          <el-slider class="control-input" v-model="elementGradientAngle" :min="0" :max="359"
            @change="changeGradientAngle"></el-slider>
        </div>

        <div class="control-slider mb-3">
          <div class="control-slider-header">
            <span>Opacity</span>
            <span class="control-slider-value">{{ gradientOpacity.toFixed(2) }}</span>
          </div>
          <el-slider v-model="gradientOpacity" :min="0" :max="1" :step="0.01" @change="changeGradient" />
        </div>

        <div class="control-slider mb-3">
          <div class="control-slider-header">
            <span>Horizontal</span>
            <span class="control-slider-value">{{ gradientOffsetX.toFixed(2) }}</span>
          </div>
          <el-slider v-model="gradientOffsetX" :min="0" :max="1" :step="0.01" @change="changeGradient" />
        </div>

        <div class="control-slider mb-3">
          <div class="control-slider-header">
            <span>Vertical</span>
            <span class="control-slider-value">{{ gradientOffsetY.toFixed(2) }}</span>
          </div>
          <el-slider v-model="gradientOffsetY" :min="0" :max="1" :step="0.01" @change="changeGradient" />
        </div>

        <div class="gradient-colors grid grid-cols-2 gap-3">
          <div>
            <div class="text-xs mb-2 text-gray-500">رنگ اول</div>
            <el-popover trigger="click" :width="265">
              <template #reference>
                <div class="color-preview-button" :style="{ backgroundColor: elementGradientColors[0] }">
                  <Icon name="color-picker" class="color-pick-icon" />
                </div>
              </template>
              <ColorPicker :modelValue="elementGradientColors[0]"
                @update:modelValue="color => updateGradientColor(0, color)" />
            </el-popover>
          </div>

          <div>
            <div class="text-xs mb-2 text-gray-500">رنگ دوم</div>
            <el-popover trigger="click" :width="265">
              <template #reference>
                <div class="color-preview-button" :style="{ backgroundColor: elementGradientColors[1] }">
                  <Icon name="color-picker" class="color-pick-icon" />
                </div>
              </template>
              <ColorPicker :modelValue="elementGradientColors[1]"
                @update:modelValue="color => updateGradientColor(1, color)" />
            </el-popover>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useTemplatesStore } from '@/store'
import { BackgroundFillMode, BackgroundFillGradientMode } from '@/configs/background'
import { GradientColorLibs } from '@/configs/colorGradient'
import { TextboxElement } from '@/types/canvas'
import { ElementNames, GradientCoords } from '@/types/elements'
import { Gradient } from 'fabric'
import useCanvas from '@/views/Canvas/useCanvas'
import ElementPatterns from '../Components/ElementPatterns.vue'
import GradientFill from './GradientFill.vue'

const templatesStore = useTemplatesStore()
const mainStore = useMainStore()
const [canvas] = useCanvas()
const { canvasObject } = storeToRefs(mainStore)

const handleElement = computed(() => canvasObject.value as TextboxElement)
const elementFillType = computed(() => {
  if (!handleElement.value) return 0
  return handleElement.value.fillType || 0
})

const elementFill = computed(() => {
  if (!handleElement.value) return '#000000'
  return handleElement.value.fill || '#000000'
})

const elementGradient = computed(() => {
  if (!handleElement.value?.fillGradient) return 'linear-gradient(90deg, #ffffff, #000000)'
  return handleElement.value.fillGradient
})

const elementGradientColors = ref<string[]>(['#ffffff', '#000000'])
const elementGradientMode = ref<string>('linear')
const elementGradientAngle = ref<number>(90)
const gradientOpacity = ref<number>(1)
const gradientOffsetX = ref<number>(0)
const gradientOffsetY = ref<number>(0)
const currentGradientName = ref<string>('')

onMounted(() => {
  parseGradient()
  initGradientValues()
})

watch(() => elementFill.value, () => {
  if (elementFillType.value === 0) {
    updateFillType(0)
  }
}, { deep: true })

watch(() => canvasObject.value, () => {
  parseGradient()
  initGradientValues()
}, { deep: true })

const isArcText = computed(() => {
  return handleElement.value.name == ElementNames.ARCTEXT
})

// Initialize gradient values from the current element
const initGradientValues = () => {
  if (!handleElement.value) return

  gradientOpacity.value = handleElement.value.opacity || 1

  if (handleElement.value.fill instanceof Gradient) {
    const gradient = handleElement.value.fill as Gradient

    elementGradientMode.value = gradient.type || 'linear'

    if (gradient.colorStops && gradient.colorStops.length >= 2) {
      elementGradientColors.value[0] = gradient.colorStops[0].color
      elementGradientColors.value[1] = gradient.colorStops[1].color
    }

    if (gradient.gradientRotate !== undefined) {
      elementGradientAngle.value = gradient.gradientRotate
    }

    if (gradient.offsetX !== undefined && handleElement.value.width) {
      gradientOffsetX.value = gradient.offsetX / handleElement.value.width
    }

    if (gradient.offsetY !== undefined && handleElement.value.height) {
      gradientOffsetY.value = gradient.offsetY / handleElement.value.height
    }
  }
}

// Parse gradient string to extract colors, angle, and type
const parseGradient = () => {
  if (!handleElement.value?.fillGradient) return

  const gradientStr = handleElement.value.fillGradient

  try {
    // Parse gradient type (linear or radial)
    elementGradientMode.value = gradientStr.includes('linear') ? 'linear' : 'radial'

    // Parse angle for linear gradients
    if (elementGradientMode.value === 'linear') {
      const angleMatch = gradientStr.match(/\((\d+)deg/)
      if (angleMatch && angleMatch[1]) {
        elementGradientAngle.value = parseInt(angleMatch[1])
      }
    }

    // Parse colors
    const colorMatches = gradientStr.match(/(#[a-f\d]{3,8}|rgba?\([^)]+\))/gi)
    if (colorMatches && colorMatches.length >= 2) {
      elementGradientColors.value[0] = colorMatches[0]
      elementGradientColors.value[1] = colorMatches[1]
    }
  } catch (error) {
    console.error('Error parsing gradient:', error)
  }
}

// Update fill type
const handleFillTypeChange = (type: number) => {
  updateFillType(type)
}

const updateFillType = (fillType: number) => {
  if (!handleElement.value) return

  templatesStore.modifedElement(handleElement.value, { fillType })

  if (fillType === 0) {
    // Solid color
    templatesStore.modifedElement(handleElement.value, { fill: elementFill.value })
  } else if (fillType === 2) {
    // Gradient
    generateGradient()
  }

  canvas.renderAll()
}

// Update solid fill color
const updateFill = (color: string) => {
  if (!handleElement.value) return

  templatesStore.modifedElement(handleElement.value, {
    fill: color,
    color: color
  })

  canvas.renderAll()
}

// Update gradient color
const updateGradientColor = (index: number, color: string) => {
  elementGradientColors.value[index] = color
  generateGradient()
}

// Change gradient name/preset
const changeGradientName = (gradientName: string) => {
  const gradientColorLib = GradientColorLibs.filter((item) => item.name === gradientName)[0]
  if (gradientColorLib) {
    currentGradientName.value = gradientName
    if (gradientColorLib.colors && gradientColorLib.colors.length >= 2) {
      elementGradientColors.value[0] = gradientColorLib.colors[0].color
      elementGradientColors.value[1] = gradientColorLib.colors[1].color
    }
    generateGradient()
  }
}

// Change gradient type (linear/radial)
const changeGradient = () => {
  generateGradient()
}

// Change gradient angle
const changeGradientAngle = () => {
  generateGradient()
}

// Calculate the position after the gradient angle
const rotateRectangle = (width: number, height: number, angle: number) => {
  const proportion = (angle % 180) / 180
  let x1 = width * proportion
  let x2 = width - x1
  const y1 = angle <= 180 ? 0 : height
  const y2 = height - y1
  if (angle >= 180) {
    [x2, x1] = [x1, x2]
  }
  // Returns the rotated coordinates
  return { x1, y1, x2, y2 }
}

// Generate gradient string and apply to element
const generateGradient = () => {
  if (!handleElement.value) return

  const width = handleElement.value.width || 100
  const height = handleElement.value.height || 100
  let coords: GradientCoords = { x1: 0, y1: 0, x2: width, y2: 0 }

  if (elementGradientMode.value !== "linear") {
    coords = { r1: 0, r2: height / 2, x1: width / 2, y1: height / 2, x2: width / 2, y2: height / 2 }
  } else {
    coords = rotateRectangle(width, height, elementGradientAngle.value)
  }

  const rotateCos = Math.cos((elementGradientAngle.value * Math.PI) / 180.0)
  const rotateSin = Math.sin((elementGradientAngle.value * Math.PI) / 180.0)

  const gradientColorStops = [
    { offset: 0, color: elementGradientColors.value[0] },
    { offset: 1, color: elementGradientColors.value[1] }
  ]

  const gradient = new Gradient({
    type: elementGradientMode.value,
    colorStops: gradientColorStops,
    coords: coords,
    offsetX: gradientOffsetX.value * width,
    offsetY: gradientOffsetY.value * height,
    gradientUnits: "pixels",
    gradientTransform: [rotateCos, rotateSin, -1 * rotateSin, rotateCos, 0, 0],
  })

  // Store the rotation angle for later use
  gradient.gradientRotate = elementGradientAngle.value

  // Generate CSS gradient for preview
  let fillGradient = ''
  if (elementGradientMode.value === 'linear') {
    fillGradient = `linear-gradient(${elementGradientAngle.value}deg, ${elementGradientColors.value[0]}, ${elementGradientColors.value[1]})`
  } else {
    fillGradient = `radial-gradient(circle, ${elementGradientColors.value[0]}, ${elementGradientColors.value[1]})`
  }

  templatesStore.modifedElement(handleElement.value, {
    fill: gradient,
    fillGradient,
    opacity: gradientOpacity.value
  })

  canvas.renderAll()
}

// Get appropriate icon for fill type
const getFillTypeIcon = (id: number) => {
  switch (id) {
    case 0: return 'color-fill'
    case 1: return 'image'
    case 2: return 'gradient'
    default: return 'color-fill'
  }
}
</script>

<style lang="scss" scoped>
.element-fill {
  @apply bg-gray-50 rounded-xl p-4;
}

.panel-header {
  @apply flex items-center justify-between mb-2;
}

.panel-title {
  @apply flex items-center gap-2 font-semibold text-gray-800;
}

.panel-icon {
  @apply text-primary-default;
}

.fill-type-selector {
  @apply w-full;
}

.fill-type-option {
  @apply flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-white border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-primary-default hover:!translate-y-[-3px];

  &.active {
    @apply border-primary-default bg-blue-50 shadow-sm;
  }
}

.fill-type-icon {
  @apply text-xl mb-1;
}

.fill-type-label {
  @apply text-xs text-gray-600;
}

.fill-content {
  @apply w-full;
}

.color-preview-button {
  @apply w-full h-12 rounded-xl flex items-center justify-center cursor-pointer border border-gray-200 transition-all duration-300 hover:shadow-md hover:!translate-y-[-3px];
}

.color-pick-icon {
  @apply text-white drop-shadow-md;
}

.gradient-preview {
  @apply w-full h-12 rounded-xl border border-gray-200;
}

.background-gradient-body {
  @apply max-h-40 overflow-y-auto rounded-xl;
}

.gradient-content {
  @apply flex justify-center cursor-pointer transition-all duration-300;

  &:hover {
    @apply transform -translate-y-1;
  }
}

.control-label {
  @apply text-sm text-gray-600;
}

.type-options {
  @apply grid grid-cols-2 gap-2;
}

.type-option {
  @apply flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-200 cursor-pointer transition-all duration-300 hover:border-primary-default hover:!translate-y-[-3px];

  &.active {
    @apply border-primary-default bg-blue-50;
  }
}

.control-slider {
  @apply w-full;
}

.control-slider-header {
  @apply flex justify-between text-sm text-gray-600 mb-1;
}

.control-slider-value {
  @apply min-w-[46px] text-xs bg-gray-100 px-2 py-1 rounded-md text-center;
}

:deep(.el-select),
:deep(.el-input__wrapper),
:deep(.el-input-number) {
  @apply rounded-xl;
}

:deep(.el-input-number .el-input__wrapper) {
  @apply rounded-xl;
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
