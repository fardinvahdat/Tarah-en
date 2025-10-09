
<template>
  <div class="panel-section mt-6" v-if="showTextArrangementOptions">
    <div class="panel-title mb-3">Text settings</div>
    <div class="grid grid-cols-2 gap-2 w-full">
      <el-tooltip placement="top" content="Horizontal" :hide-after="0">
        <el-button @click="handleElementArrange(false)" :type="elementGrapheme ? 'primary' : ''">
          <Icon name="text-horizontal" />
        </el-button>
      </el-tooltip>
      <el-tooltip placement="top" content="Vertical" :hide-after="0">
        <el-button @click="handleElementArrange(true)" :type="!elementGrapheme ? 'primary' : ''">
          <Icon name="text-vertical" />
        </el-button>
      </el-tooltip>
      <el-tooltip placement="top" content="Reduce the distance of the letters" :hide-after="0">
        <el-button @click="handleElementCharSpacing('-')">
          <Icon name="indent-left" />
        </el-button>
      </el-tooltip>
      <el-tooltip placement="top" content="Increase the interval of letters" :hide-after="0">
        <el-button @click="handleElementCharSpacing('+')">
          <Icon name="indent-right" />
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, defineEmits } from 'vue'
import { Textbox } from 'fabric'
import { ElementNames } from '@/types/elements'
import { ArcText } from '@/extension/object/ArcText'

const props = defineProps<{
  handleElement: Textbox | ArcText
}>()

const emits = defineEmits<{
  arrangeElement: [status: boolean]
  charSpacing: [mode: '+' | '-']
}>()

const elementGrapheme = computed(() => 
  props.handleElement.type.toLowerCase() !== ElementNames.VERTICALTEXT
)

const showTextArrangementOptions = computed(() => {
  const elementType = props.handleElement.type.toLowerCase();
  return elementType !== ElementNames.ARCTEXT && elementType !== ElementNames.VERTICALTEXT;
})

const handleElementArrange = (status: boolean) => {
  emits('arrangeElement', status)
}

const handleElementCharSpacing = (mode: '+' | '-') => {
  emits('charSpacing', mode)
}
</script>

<style lang="scss" scoped>
.panel-section {
  @apply bg-gray-50 p-4 rounded-xl;
}

.panel-title {
  @apply text-gray-700 font-semibold text-sm;
}
</style>
