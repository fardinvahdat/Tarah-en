<template>
  <div class="relative" v-if="props.elements.length">
    <div v-if="(props.elements?.length > 1)" class="w-full grid grid-cols-2 gap-4 mb-4">
      <el-tooltip placement="top" :hide-after="0" content="The highest">
        <button class="flex items-center justify-between py-3 px-1 layer-btn !w-full !h-max text-blue-100"
          @click="handleLayerChanged(LayerCommand.TOP)">
          <p class="text-[10px] pr-1">
            Highest layer
          </p>
          <Icon name="front" class="h-7 w-7" />
        </button>
      </el-tooltip>
      <el-tooltip placement="top" :hide-after="0" content="The lowest">
        <button class="flex items-center justify-between py-3 px-1 layer-btn !w-full !h-max text-blue-100"
          @click="handleLayerChanged(LayerCommand.BOTTOM)">
          <p class="text-[10px] pr-1">
            The lowest layer
          </p>
          <Icon name="bottom" class="h-7 w-7" />
        </button>
      </el-tooltip>
      <el-tooltip placement="top" :hide-after="0" content="Down">
        <button class="flex items-center justify-between py-3 px-1 layer-btn !w-full !h-max text-blue-100"
          @click="handleLayerChanged(LayerCommand.DOWN)">
          <p class="text-[10px] pr-1">
            The lower layer
          </p>
          <Icon name="backward" class="h-7 w-7" />
        </button>
      </el-tooltip>
      <el-tooltip placement="top" :hide-after="0" content="Top">
        <button class="flex items-center justify-between py-3 px-1 layer-btn !w-full !h-max text-blue-100"
          @click="handleLayerChanged(LayerCommand.UP)">
          <p class="text-[10px] pr-1">
            Higher layer
          </p>
          <Icon name="forward" class="h-7 w-7" />
        </button>
      </el-tooltip>
    </div>
    <ul>
      <li v-for="(element, index) in props.elements" :key="index">
        <LayerDraggableCom :index="props.index" :element="element" @layer-changed="handleLayerChanged" />
      </li>
    </ul>
  </div>
  <div v-else class="text-center mt-6">
    There was no layer!
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import type { SerializedObjectProps } from 'fabric'
import { storeToRefs } from 'pinia'
import { ElementNames } from '@/types/elements'
import { LayerCommand } from "@/types/elements";
import useHandleTool from "@/hooks/useHandleTool";
import useHandleElement from "@/hooks/useHandleElement";
import LayerDraggableSon from './LayerDraggableSon.vue'
import LayerDraggableCom from './LayerDraggableCom.vue'
import { useMainStore } from '@/store'
import useCanvas from "@/views/Canvas/useCanvas";
import { nextTick, computed } from 'vue';

const handleElement = computed(() => canvasObject.value)
const mainStore = useMainStore()
const { canvasObject } = storeToRefs(mainStore)
const { layerElement } = useHandleTool();
const { selectElement } = useHandleElement();

const emits = defineEmits(['layer-changed'])

const props = defineProps({
  elements: {
    type: Object as PropType<SerializedObjectProps[]>,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  }
})

// After layer changes, maintain selection of the active element
const handleLayerChanged = async (position: LayerCommand) => {
  const elementId = handleElement.value.id
  const res = await layerElement(position).then(() => {
    // This runs AFTER layerElement completes
    console.log("Layer operation finished");
    // Re-select the element to maintain selection after layer change
    if (elementId) {
      selectElement(elementId);
    }
  })
}
</script>

<style lang="scss" scoped>
.layer-draggable {
  overflow-y: scroll;
  overflow-x: hidden;
  height: calc(100% - 100px);
  width: 102%;
}

.layer-btn {
  background-color: #f5f5f5;
  color: #333;
  border-radius: 6px;
  height: 36px;
  width: 36px;
  transition: all 0.2s;
  border: none;

  &:hover {
    background-color: #e0e0e0;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
