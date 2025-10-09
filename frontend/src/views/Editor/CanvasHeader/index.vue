<template>
  <div>
  </div>
</template>

<script lang="ts" setup>

import { ref, computed, onMounted } from "vue";
import { ElementNames } from "@/types/elements";
import { storeToRefs } from "pinia";
import { Object as FabricObject, Group } from "fabric";
import { useFabricStore, useMainStore, useSnapshotStore, useTemplatesStore } from "@/store";

import useCanvas from "@/views/Canvas/useCanvas";
import useHandleTool from "@/hooks/useHandleTool";
import useCanvasScale from "@/hooks/useCanvasScale";
import useHandleElement from "@/hooks/useHandleElement";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import Icon from '@/components/Icon.vue'

const fabricStore = useFabricStore();
const mainStore = useMainStore();
const templatesStore = useTemplatesStore();

const { alignElement, layerElement } = useHandleTool();
const { setCanvasScalePercentage, scaleCanvas, resetCanvas } = useCanvasScale();
const { combineElements, uncombineElements, intersectElements } = useHandleElement();
const { zoom } = storeToRefs(fabricStore);
const { canvasObject } = storeToRefs(mainStore);

const scaleRef = ref();
const canvasZoom = computed(() => Math.round(zoom.value * 100) + "%");
const canvasZoomPresets = [200, 150, 100, 80, 50];

const { canUndo, canRedo } = storeToRefs(useSnapshotStore());

const { redo, undo } = useHistorySnapshot();

const handleElement = computed(() => canvasObject.value as FabricObject);

const canGroup = computed(() => {
  if (!handleElement.value) return false;
  return handleElement.value.type === ElementNames.ACTIVE;
});
const canUnGroup = computed(() => {
  if (!handleElement.value) return false;
  return handleElement.value.type === ElementNames.GROUP;
});

const canIntersection = computed(() => {
  const [canvas] = useCanvas();
  if (!handleElement.value) return false;
  if (handleElement.value.type === ElementNames.GROUP) {
    const groupObject = handleElement.value as Group;
    const sonObjects = groupObject._objects.filter((ele) => ele.type === ElementNames.PATH);
    if (groupObject._objects.length === 2 && sonObjects && sonObjects.length === 2) return true;
    return false;
  }
  if (handleElement.value.type !== ElementNames.ACTIVE) return false;

  const activeObjects = canvas.getActiveObjects();
  return activeObjects.length === 2 && activeObjects.filter((ele) => ele.type === ElementNames.PATH).length === 2;
});

// combination
const group = () => {
  if (!handleElement.value || handleElement.value.type !== ElementNames.ACTIVE) return;
  combineElements();
};

// Ungroup
const ungroup = () => {
  if (!handleElement.value || handleElement.value.type !== ElementNames.GROUP) return;
  uncombineElements();
};

// Ruler show hide
const changeRuler = () => {
  const [canvas] = useCanvas();
  if (!canvas.ruler) return
  canvas.ruler.enabled = !canvas.ruler.enabled
};
changeRuler()

const intersection = (val: number) => {
  if (!handleElement.value) return;
  intersectElements(val);
};

const applyCanvasPresetScale = (value: number) => {
  setCanvasScalePercentage(value);
};
// const setZoom = ()
</script>

<style lang="scss" scoped>
.left-handler {
  display: flex;
  align-items: center;
}

.center-handler {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;

  .handler-icon {
    font-size: 14px;
    width: 18px;
  }

  .icon-down {
    transition: margin-top 0.05s;
  }

  .handler-item {
    width: 32px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 2px;
    border-radius: $borderRadius;
  }
}

.handler-item {
  margin: 0 10px;
  font-size: 14px;
  overflow: hidden;
  cursor: pointer;

  &.disable {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.right-handler {
  display: flex;
  align-items: center;

  .text {
    width: 40px;
    text-align: center;
    cursor: pointer;
  }
}

.preset-item {
  padding: 8px 20px;
  text-align: center;
  cursor: pointer;

  &:hover {
    color: $themeColor;
  }
}

.center-handler .handler-dropdown {
  display: flex;
  width: 42px;
  height: 24px;
  align-items: center;
  padding: 2px;
  justify-content: center;
  border-radius: $borderRadius;

  &:hover {
    background: #f1f1f1;

    .icon-down {
      margin-top: 3px;
    }
  }
}
</style>

<style>
.el-popover.el-popper.viewport-size {
  min-width: 100px;
  padding: 0;
}
</style>
