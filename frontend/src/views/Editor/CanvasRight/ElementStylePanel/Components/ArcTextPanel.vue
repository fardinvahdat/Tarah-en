
<template>
  <div class="panel-section mt-6" v-show="handleElement.type.toLowerCase() === ElementNames.ARCTEXT">
    <div class="panel-title mb-3">Arc settings</div>
    
    <div class="element-slider">
      <div class="section">
        <div class="flex justify-between">
          <div class="section-header">Angle</div>
          <div class="slider-value">{{ (handleElement as ArcText).radius }}°</div>
        </div>
        <div class="slider-row">
          <el-slider class="slider" :min="66" :max="1000" :step="1" 
            :model-value="(handleElement as ArcText).radius"
            @change="changeArcTextRadius" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'
import { Textbox } from 'fabric'
import { ElementNames } from '@/types/elements'
import { ArcText } from '@/extension/object/ArcText'

const props = defineProps<{
  handleElement: Textbox | ArcText
}>()

const emits = defineEmits<{
  radiusChange: [val: number]
}>()

const changeArcTextRadius = (val: number) => {
  emits('radiusChange', val)
}
</script>

<style lang="scss" scoped>
.panel-section {
  @apply bg-gray-50 p-4 rounded-xl;
}

.panel-title {
  @apply text-gray-700 font-semibold text-sm;
}

.element-slider {
  @apply bg-gray-50 rounded-xl p-4;
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
