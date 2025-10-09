<template>
  <div class="canvas-design-panel">
    <Backgrounds />
  </div>
</template>

<script lang="ts" setup>
import { Rect } from "fabric";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { ref, watch, onMounted, computed, nextTick } from "vue";
import { mm2px, px2mm } from "@/utils/image";
import { useFabricStore, useMainStore, useTemplatesStore } from "@/store";
import {
  WorkSpaceClipType,
  WorkSpaceDrawType,
  WorkSpaceMaskType,
} from "@/configs/canvas";
import {
  DesignUnitMode,
  DesignSizeMode,
  MinSize,
  MaxSize,
} from "@/configs/background";
import useCanvas from "@/views/Canvas/useCanvas";
import Backgrounds from "../Backgrounds/index.vue";
import Watermark from "./Watermark/index.vue";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import useCanvasScale from '@/hooks/useCanvasScale'
import Icon from '@/components/Icon.vue'
import { useRoute } from 'vue-router'
import { ElLoading } from 'element-plus'

const mainStore = useMainStore();
const templatesStore = useTemplatesStore();
const fabricStore = useFabricStore();
const { addHistorySnapshot } = useHistorySnapshot();
const { sizeMode, unitMode } = storeToRefs(mainStore);
const { currentTemplate } = storeToRefs(templatesStore);
const { clip, safe, zoom, opacity } = storeToRefs(fabricStore);
const { setCanvasSize, resetCanvas } = useCanvasScale()
const route = useRoute()

const templateWidth = computed(() => {
  // const [ canvas ] = useCanvas()
  // if (!canvas) return 0
  const workWidth = currentTemplate.value.width / currentTemplate.value.zoom;
  return unitMode.value === 0 ? px2mm(workWidth) : workWidth;
});

const templateHeight = computed(() => {
  // const [ canvas ] = useCanvas()
  // if (!canvas) return 0
  const workHeight = currentTemplate.value.height / currentTemplate.value.zoom;
  return unitMode.value === 0 ? px2mm(workHeight) : workHeight;
});

// const canvasWidth = ref<number>(px2mm(currentTemplate.value.width / currentTemplate.value.zoom))
const canvasWidth = ref<number>(templateWidth.value);
const canvasHeight = ref<number>(templateHeight.value);

// Fixed width and height
const isFixed = ref(false);

// Right angle rounded corners
const isRound = ref(false);

// Grid Predefined Parameters
const RECENT_GRIDS = "RECENT_GRIDS";
const gridColorRecent = ref<[string[]]>([[]]);

// Get the canvas size
const getCanvasSize = () => {
  let width =
    unitMode.value === 0 ? mm2px(canvasWidth.value) : canvasWidth.value;
  let height =
    unitMode.value === 0 ? mm2px(canvasHeight.value) : canvasHeight.value;
  width = width * zoom.value;
  height = height * zoom.value;
  return { width, height };
};

// Modify canvas width
const changeTemplateWidth = () => {

  const [canvas] = useCanvas();
  const workSpaceDraw = canvas
    .getObjects()
    .filter((item) => item.id === WorkSpaceDrawType)[0];
  if (!workSpaceDraw) return;
  const ratio = currentTemplate.value.height / currentTemplate.value.width;
  let { width, height } = getCanvasSize();
  if (width / zoom.value < mm2px(MinSize)) {
    ElMessage({
      message: "style.minimumSizeLimit" + MinSize,
      type: "warning",
    });
    width = mm2px(MinSize) * zoom.value;
  }
  if (width / zoom.value > mm2px(MaxSize)) {
    ElMessage({
      message: "style.maximumSizeLimit" + MaxSize,
      type: "warning",
    });
    width = mm2px(MaxSize) * zoom.value;
  }
  height = isFixed.value ? width * ratio : height;
  workSpaceDraw.set({ width: width / zoom.value, height: height / zoom.value });
  templatesStore.setSize(width, height, zoom.value);
  sizeMode.value = 2;
  canvas.renderAll();
  // resetCanvas()
  addHistorySnapshot();
};

// Modify the canvas height
const changeTemplateHeight = () => {
  const [canvas] = useCanvas();
  const workSpaceDraw = canvas
    .getObjects()
    .filter((item) => item.id === WorkSpaceDrawType)[0];
  if (!workSpaceDraw) return;
  const ratio = currentTemplate.value.height / currentTemplate.value.width;
  let { width, height } = getCanvasSize();
  if (height / zoom.value < mm2px(MinSize)) {
    ElMessage({
      message: "style.minimumSizeLimit" + MinSize,
      type: "warning",
    });
    height = mm2px(MinSize) * zoom.value;
  }
  if (height / zoom.value > mm2px(MaxSize)) {
    ElMessage({
      message: "style.maximumSizeLimit" + MaxSize,
      type: "warning",
    });
    height = mm2px(MaxSize) * zoom.value;
  }
  width = isFixed.value ? height / ratio : width;
  workSpaceDraw.set({ width: width / zoom.value, height: height / zoom.value });
  templatesStore.setSize(width, height, zoom.value);
  sizeMode.value = 2;
  canvas.renderAll();
  // resetCanvas()
  addHistorySnapshot();
};

// Modify bleed size
const changeTemplateClip = async () => {
  templatesStore.setClip(clip.value);
  await templatesStore.renderTemplate();
};

// Modify safety dimensions
const changeTemplateSafe = async () => {
  safe.value = Number(safe.value);
  await templatesStore.renderTemplate();
};

// Modify fixed aspect ratio
const changeFixedRatio = (fixedStatus: boolean) => {
  isFixed.value = fixedStatus;
};

// Modify right-angle fillet
const changeWorkRound = (roundStatus: boolean) => {
  const [canvas] = useCanvas();
  const workSpaceclip = canvas
    .getObjects()
    .filter(
      (item) => WorkSpaceClipType === item.id && item.isType("Rect")
    )[0] as Rect;
  let rx = 0,
    ry = 0;
  isRound.value = roundStatus;
  if (isRound.value) rx = ry = 10;
  workSpaceclip.set({ rx, ry });
  canvas.renderAll();
};

// Modify dimension units
const changeUnitMode = async () => {
  const width = currentTemplate.value.width / currentTemplate.value.zoom;
  const heigth = currentTemplate.value.height / currentTemplate.value.zoom;
  if (unitMode.value === 0) {
    canvasWidth.value = px2mm(width);
    canvasHeight.value = px2mm(heigth);
    clip.value = 2;
    safe.value = 3;
  } else {
    canvasWidth.value = width;
    canvasHeight.value = heigth;
    clip.value = safe.value = 0;
  }
  await changeTemplateClip();
  await changeTemplateSafe();
};

// Apply background to all pages
const changeAllBackgroud = () => {
  templatesStore.templates.forEach((item) => {
    item.workSpace = currentTemplate.value.workSpace;
    const currentWorkSpace = currentTemplate.value.objects.filter(
      (ele) => ele.id === WorkSpaceDrawType
    )[0];
    item.objects = item.objects.map((ele) =>
      ele.id === WorkSpaceDrawType ? currentWorkSpace : ele
    ) as any;
  });
};

// Load cache recently added meshes
const counter = ref(0)
onMounted(async () => {
  // if (counter.value == 1) return
  // const loading = ElLoading.service({
  //   lock: true,
  //   text: 'منتظر بمانید...',
  //   background: 'rgba(0, 0, 0, 0.7)',
  // })
  // canvasWidth.value = +route.query.width
  // canvasHeight.value = +route.query.height
  // setTimeout(() => {
  //   changeTemplateWidth()
  //   changeTemplateHeight()
  //   resetCanvas()
  //   loading.close()
  //   counter.value = 1
  // }, 2000);
});

// Save cache of recently added meshes
watch(
  gridColorRecent,
  () => {
    const recentGridCache = JSON.stringify(gridColorRecent.value);
    localStorage.setItem(RECENT_GRIDS, recentGridCache);
  },
  { deep: true }
);

const changeMaskOpacity = () => {
  const [canvas] = useCanvas();
  const workMask = canvas
    .getObjects()
    .filter((ele) => ele.id === WorkSpaceMaskType)[0];
  if (!workMask) return;
  workMask.set("opacity", opacity.value);
  canvas.renderAll();
};
</script>

<style lang="scss" scoped>
.icon-btn {
  cursor: pointer;
}

.canvas-design-panel {
  user-select: none;
}

.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.title {
  margin-bottom: 10px;
}

.fixed-ratio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.slider-name {
  display: flex;
  align-items: center;
}

.mb-10 {
  margin-bottom: 10px;
}

.full-row {
  flex: 1;
  width: 100%;
}

.full-group {
  display: flex;
  flex: 1;

  .el-button {
    width: 50%;
  }
}

.full-ratio {
  display: flex;
  flex: 1;

  .el-radio-button {
    width: 50%;
  }

  .el-radio-button__inner {
    width: 100%;
  }
}

.background-image {
  height: 0;
  padding-bottom: 56.25%;
  border: 1px dashed var(--el-border-color);
  border-radius: $borderRadius;
  position: relative;
  transition: all $transitionDelay;

  &:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }

  .content {
    @include absolute-0();

    display: flex;
    justify-content: center;
    align-items: center;
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    cursor: pointer;
  }
}

.theme-list {
  @include flex-grid-layout();
}

.theme-item {
  @include flex-grid-layout-children(2, 48%);

  padding-bottom: 30%;
  border-radius: $borderRadius;
  position: relative;
  cursor: pointer;

  .theme-item-content {
    @include absolute-0();

    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 8px;
    border: 1px solid $borderColor;
  }

  .text {
    font-size: 16px;
  }

  .colors {
    display: flex;
  }

  .color-block {
    margin-top: 8px;
    width: 12px;
    height: 12px;
    margin-right: 2px;
  }

  &:hover .btns {
    display: flex;
  }

  .btns {
    @include absolute-0();

    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: none;
    background-color: rgba($color: #000, $alpha: 0.25);
  }

  .btn {
    width: 72px;
    padding: 5px 0;
    text-align: center;
    background-color: $themeColor;
    color: #fff;
    font-size: 12px;
    border-radius: $borderRadius;

    &:hover {
      background-color: #c42f19;
    }

    &+.btn {
      margin-top: 5px;
    }
  }
}

.mt-10 {
  margin-top: 10px;
}

.slider-num {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<style scoped>
:deep(.el-input .el-input-group__prepend) {
  padding: 0 15px;
}

:deep(.el-input .el-input-group__append) {
  padding: 0 5px;
  border-radius: 15px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

:deep(.full-ratio .el-radio-button__inner) {
  width: 100%;
}

:deep(.size-row .el-input-group__prepend) {
  min-width: 44px;
}
</style>