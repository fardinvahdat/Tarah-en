
<template>
  <div class="panel-section mt-6" v-if="handleElement.type.toLowerCase() !== ElementNames.ARCTEXT">
    <div class="panel-title mb-3">Text mode</div>
    <div class="grid grid-cols-2 gap-2">
      <div>
        <el-tooltip placement="top" content="Rounding" :hide-after="0">
          <el-button class="full-button"
            :type="handleElement.type.toLowerCase() === ElementNames.ARCTEXT ? 'primary' : ''"
            @click="handleElementDeformation">
            <i class="handler-item iconfont icon-text-path" />
          </el-button>
        </el-tooltip>
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
  deformation: []
}>()

const handleElementDeformation = () => {
  emits('deformation')
}
</script>

<style lang="scss" scoped>
.panel-section {
  @apply bg-gray-50 p-4 rounded-xl;
}

.panel-title {
  @apply text-gray-700 font-semibold text-sm;
}

.full-button {
  width: 100%;

  .iconfont {
    font-size: 32px;
  }
}
</style>
