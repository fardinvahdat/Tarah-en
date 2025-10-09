
<template>
  <div class="element-opacity">
    <div class="section">
      <div class="flex justify-between">
        <div class="section-header">Transparency</div>
        <div class="slider-value">{{ Math.round(opacity * 100) }}%</div>
      </div>
      <div class="slider-row">
        <el-slider 
          class="slider" 
          v-model="opacity" 
          :min="0" 
          :max="1" 
          :step="0.01" 
          @change="updateOpacity"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store'
import useCanvas from '@/views/Canvas/useCanvas'
const { canvasObject } = storeToRefs(useMainStore())

const opacity = ref<number>(canvasObject.value ? canvasObject.value.opacity : 1)

const updateOpacity = () => {
  const [ canvas ] = useCanvas()
  if (!canvasObject.value) return
  canvasObject.value.opacity = opacity.value
  canvas.renderAll()
}
</script>

<style lang="scss" scoped>
.element-opacity {
  @apply bg-gray-50 rounded-xl p-4;
}

.section {
  margin-bottom: 16px;
}

.section-header {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider {
  flex: 1;
}

.slider-value {
  min-width: 46px;
  font-size: 12px;
  color: #666;
  text-align: center;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 8px;
}
</style>
