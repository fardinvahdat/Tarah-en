<template>
  <div
    ref="wrapperRef"
    id="canvas-container"
    @mousedown="addDrawAreaFocus"
    v-contextmenu="contextMenus"
    v-click-outside="remDrawAreaFocus"
  >
    <canvas
      ref="canvasRef"
      id="canvasRef"
      class="background-grid"
      will-change="transform"
    ></canvas>
    <el-dialog
      v-model="isEditTextDialogVisible"
      class="md:max-w-[500px] max-w-[80%] w-full !p-0 !rounded-lg edit-text !bg-transparent"
      center
      :show-close="false"
      @close="handleCloseEditTextDialog"
      @opened="focusTextarea"
    >
      <textarea
        :style="
          (handleElement?.type.toLowerCase() == ElementNames.ARCTEXT ||
            handleElement?.type.toLowerCase() == ElementNames.VERTICALTEXT) &&
          'direction:ltr'
        "
        class="w-full h-full rounded-md p-3 bg-transparent text-white outline-none xl:text-3xl lg:text-2xl md:text-xl text-lg text-center"
        id="edit_text_textarea"
        ref="edit_text_textarea"
        v-model="stagedTextValue"
        @keydown.enter.prevent="handleEnterKeydown"
        @keydown.esc="handleCloseEditTextDialog"
      >
      </textarea>
    </el-dialog>
    <div
      class="gap-1 absolute -bottom-12 z-[99999] w-full md:flex hidden items-center justify-center"
    >
      <div
        class="flex items-center justify-center gap-1 bg-white p-2 rounded-lg shadow-lg"
      >
        <button
          @click="scaleCanvas('+')"
          class="handler-item md:px-2 text-black"
        >
          <Icon name="zoom-in" class="w-6 h-6" />
        </button>
        <el-popover
          placement="bottom"
          trigger="click"
          width="100"
          popper-class="viewport-size"
        >
          <template #reference>
            <span class="text text-black md:text-sm text-xs" ref="scaleRef">{{
              canvasZoom
            }}</span>
          </template>
          <div class="viewport-size-preset">
            <div
              class="preset-item py-2 text-left"
              v-for="item in canvasZoomPresets"
              :key="item"
              @click="applyCanvasPresetScale(item)"
            >
              {{ item }}%
            </div>
            <div class="preset-item text-right" @click="resetCanvas()">
              Full screen
            </div>
          </div>
        </el-popover>
        <button
          class="handler-item md:px-2 text-black"
          @click="scaleCanvas('-')"
        >
          <Icon name="zoom-out" class="w-6 h-6" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { onMounted, onUnmounted, ref, computed, nextTick, provide } from "vue";
import {
  useFabricStore,
  useMainStore,
  useTemplatesStore,
  useStudioStore,
  useSnapshotStore,
} from "@/store";
import { useRouter } from "vue-router";
import { unzip } from "@/utils/crypto";
import { getTemplateData } from "@/api/template";
import { contextMenus } from "@/configs/contextMenu";
import { initEditor } from "@/views/Canvas/useCanvas";
import useCanvas from "@/views/Canvas/useCanvas";
import { ElementNames } from "@/types/elements";
import { ElMessage, ElLoading } from "element-plus";
import useCanvasHotkey from "@/hooks/useCanvasHotkey";
import { SnapshotType } from "@/types/history";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import useCanvasScale from "@/hooks/useCanvasScale";
import { initPixi, terminatePixi } from "@/views/Canvas/usePixi";

const { setCanvasScalePercentage, scaleCanvas, resetCanvas } = useCanvasScale();
const fabricStore = useFabricStore();
const mainStore = useMainStore();
const studioStore = useStudioStore();
const snapshotStore = useSnapshotStore();
const router = useRouter();
const templatesStore = useTemplatesStore();
const { wrapperRef, canvasRef } = storeToRefs(fabricStore);
const { drawAreaFocus, canvasObject } = storeToRefs(mainStore);
const { isEditTextDialogVisible, stagedTextValue, skipNextHistoryEntry } =
  storeToRefs(studioStore);
const { keydownListener, keyupListener, pasteListener } = useCanvasHotkey();
const { addHistorySnapshot } = useHistorySnapshot();
const edit_text_textarea = ref(null);
const canvasZoomPresets = [200, 150, 100, 80, 50];
const { zoom } = storeToRefs(fabricStore);
const canvasZoom = computed(() => Math.round(zoom.value * 100) + "%");

const handleElement = computed(() => canvasObject.value);

// Expose selected image for filter preview
const selectedImageSrc = computed(() => {
  if (handleElement.value && handleElement.value.type === "image") {
    return handleElement.value.getSrc();
  }
  return null;
});

// Make the selected image source available globally
provide("selectedImageSrc", selectedImageSrc);

const addDrawAreaFocus = () => {
  if (!drawAreaFocus.value) mainStore.setDrawAreaFocus(true);
};

const remDrawAreaFocus = () => {
  if (drawAreaFocus.value) mainStore.setDrawAreaFocus(false);
};

const focusTextarea = () => {
  if (edit_text_textarea.value) {
    nextTick(() => {
      setTimeout(() => {
        edit_text_textarea.value.focus();
      }, 100);
    });
  }
};

const handleEnterKeydown = (e) => {
  if (e.shiftKey) {
    const textarea = edit_text_textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    stagedTextValue.value =
      text.substring(0, start) + "\n" + text.substring(end);
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 1;
    });
    return;
  }
  handleCloseEditTextDialog();
};

const getTemplateDetail = async (pk: number) => {
  const result = await getTemplateData(pk);
  if (result.data && result.data.code === 200 && result.data.data) {
    try {
      router.push(`${router.currentRoute.value.path}?template=${pk}`);
      const data = unzip(result.data.data.data);
      await templatesStore.changeTemplate(data);
    } catch (error) {
      ElMessage({
        type: "error",
        message:
          "Pattern loading failed, please contact the manager to fix the bug",
      });
    }
  }
};

const initRouter = async (templateId?: number) => {};

const handleCloseEditTextDialog = () => {
  const [canvas] = useCanvas();
  isEditTextDialogVisible.value = false;

  if (!handleElement.value) return;

  const prevText = handleElement.value.text;
  handleElement.value.set("text", stagedTextValue.value);
  handleElement.value.exitEditing();

  if (prevText !== stagedTextValue.value && !skipNextHistoryEntry.value) {
    addHistorySnapshot({
      type: SnapshotType.MODIFY,
      index: canvas._objects.indexOf(handleElement.value),
      target: handleElement.value.toObject(),
      property: "text",
      oldValue: prevText,
      newValue: stagedTextValue.value,
      action: "textEdited",
    });
  }

  studioStore.setSkipNextHistoryEntry(false);
  canvas.requestRenderAll();
};

onMounted(async () => {
  // Prevent mobile refresh gesture
  const preventMobileRefresh = (e: TouchEvent) => {
    if (e.touches.length > 1 || e.scale !== 1) e.preventDefault();
  };
  document.addEventListener("touchmove", preventMobileRefresh, {
    passive: false,
  });

  const query = router.currentRoute.value.query;
  initRouter(query.template);
  initEditor(query.template);

  // Initialize Pixi with a small delay
  setTimeout(() => {
    // initPixi()
  }, 1000);

  document.addEventListener("keydown", keydownListener);
  document.addEventListener("keyup", keyupListener);
  window.addEventListener("blur", keyupListener);
  window.addEventListener("paste", pasteListener as any);
});

onUnmounted(() => {
  document.removeEventListener("keydown", keydownListener);
  document.removeEventListener("keyup", keyupListener);
  window.removeEventListener("blur", keyupListener);
  window.removeEventListener("paste", pasteListener as any);

  // Clean up mobile refresh prevention
  document.removeEventListener("touchmove", preventMobileRefresh);

  // Properly terminate Pixi
  terminatePixi();
});

const preventMobileRefresh = (e: TouchEvent) => {
  if (e.scale !== 1) e.preventDefault();
};

const applyCanvasPresetScale = (value: any) => {
  setCanvasScalePercentage(value);
};
</script>

<style lang="scss" scoped>
.full-size {
  height: 100%;
  width: 100%;
}

.background-grid {
  --offsetX: 0px;
  --offsetY: 0px;
  --size: 8px;
  --color: #dedcdc;
}
</style>
<style>
.el-dialog.edit-text .el-dialog__header {
  padding: 0 !important;
  background: transparent;
}

.el-dialog.edit-text .el-dialog__body {
  height: 100%;
  background: transparent;
}

.el-dialog {
  box-shadow: none !important;
}

#canvas-container {
  transform: translateZ(0);
  will-change: transform;
}
canvas {
  image-rendering: -webkit-optimize-contrast;
}
</style>
