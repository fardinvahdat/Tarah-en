<template>
  <div class="layer-pool-container" @click.stop="cancelElement">
    <div class="layer-actions-toolbar">
      <el-tooltip placement="top" :hide-after="0" content="The highest">
        <button class="layer-action-btn" @click="handleLayerAction(LayerCommand.TOP)">
          <Icon name="front" /> 
        </button>
      </el-tooltip>
      <el-tooltip placement="top" :hide-after="0" content="The lowest">
        <button class="layer-action-btn" @click="handleLayerAction(LayerCommand.BOTTOM)">
          <Icon name="bottom" />
        </button>
      </el-tooltip>
      <el-tooltip placement="top" :hide-after="0" content="Down">
        <button class="layer-action-btn" @click="handleLayerAction(LayerCommand.DOWN)">
          <Icon name="backward" />
        </button>
      </el-tooltip>
      <el-tooltip placement="top" :hide-after="0" content="Top">
        <button class="layer-action-btn" @click="handleLayerAction(LayerCommand.UP)">
          <Icon name="forward" />
        </button>
      </el-tooltip>
    </div>
    <div class="layer-list-container">
      <template v-if="layerObjects.length">
        <LayerDraggableSelf :elements="layerObjects" :index="0" @layer-changed="handleLayerChanged" />
      </template>
      <div v-else class="empty-layers-message">
        There was no layer!
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, unref } from "vue";
import { storeToRefs } from "pinia";
import { useMainStore, useTemplatesStore } from "@/store";
import { ElementNames } from "@/types/elements";
import { WorkSpaceThumbType } from "@/configs/canvas";
import { LayerCommand } from "@/types/elements";
import LayerDraggableSelf from "./LayerComponents/LayerDraggableSelf.vue";
import useHandleElement from "@/hooks/useHandleElement";
import useHandleTool from "@/hooks/useHandleTool";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import useCanvas from "@/views/Canvas/useCanvas";
import { Snapshot, SnapshotType } from "@/types/history";

// Search Keywords
const keywords = ref('');

const templatesStore = useTemplatesStore();
const mainStore = useMainStore();
const { currentTemplate } = storeToRefs(templatesStore);
const { canvasObject } = storeToRefs(mainStore);
const { cancelElement, selectElement } = useHandleElement();
const { layerElement } = useHandleTool();
const { addHistorySnapshot } = useHistorySnapshot();
const [canvas] = useCanvas();

const handleElement = computed(() => canvasObject.value);

const layerObjects = computed(() => {
  const _keywords = unref(keywords)
  if (!_keywords) return currentTemplate.value.objects.filter(
    (item) => !WorkSpaceThumbType.includes(item.id) && item.type.toLowerCase() !== ElementNames.REFERENCELINE
  )
  return currentTemplate.value.objects.filter(
    (item) => !WorkSpaceThumbType.includes(item.id) && item.type.toLowerCase() !== ElementNames.REFERENCELINE && item.type.toLowerCase().includes(_keywords)
  )
});

// Handle layer command with selection preservation
const handleLayerAction = (command: LayerCommand) => {

  if (!handleElement.value) return;

  const elementId = handleElement.value.id;

  // Create snapshot before changing the layer
  addHistorySnapshot({
    type: SnapshotType.ORDER,
    target: handleElement.value.toObject(),
    index: canvas._objects.indexOf(handleElement.value),
    action: `layer_${command}`
  });

  // Execute the layer command
  layerElement(command);

  // Re-select the element after changing its layer position
  nextTick(() => {
    if (elementId) {
      selectElement(elementId);
    }
  });
}

// Handle layer changes and maintain selection
const handleLayerChanged = (elementId: string) => {
  // Re-select the element after layer change
  if (elementId) {
    nextTick(() => {
      selectElement(elementId);
    });
  }
};
</script>

<style lang="scss" scoped>
.layer-pool-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.layer-actions-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.layer-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background-color: #f5f5f5;
  color: #333;
  transition: all 0.2s;

  &:hover {
    background-color: #e0e0e0;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.layer-list-container {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #666;
  }
}

.empty-layers-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #999;
  font-size: 0.9rem;
}
</style>
