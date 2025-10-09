<template>
  <div @click.stop="cancelElement">
    <LayerDraggableSelf :elements="layerObjects" :index="0" @layer-changed="handleLayerChanged" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, unref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import { useTemplatesStore } from "@/store";
import { ElementNames } from "@/types/elements";
import { WorkSpaceCommonType } from "@/configs/canvas";
import LayerDraggableSelf from "./components/LayerDraggableSelf.vue";
import useHandleElement from "@/hooks/useHandleElement";
import useCanvas from "@/views/Canvas/useCanvas";

const keywords = ref('')

const templatesStore = useTemplatesStore();
const { currentTemplate } = storeToRefs(templatesStore);
const { cancelElement, selectElement } = useHandleElement();
const layerObjects = computed(() => {

  const [canvas] = useCanvas()
  const objects = canvas?.getObjects()
  const _keywords = unref(keywords)
  if (!_keywords) return objects.filter(
    (item) => !WorkSpaceCommonType.includes(item.id) && item.type.toLowerCase() !== ElementNames.REFERENCELINE
  ).reverse()
  return objects.filter(
    (item) => !WorkSpaceCommonType.includes(item.id) && item.type.toLowerCase() !== ElementNames.REFERENCELINE && item.type.toLowerCase().includes(_keywords)
  ).reverse()
});


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
.layout-search {
  margin: 0 auto;
  width: 100%;
  padding: 20px 10px 10px;
}
</style>