
<template>
  <div class="toolbar-menu path-toolbar">
    <div class="toolbar-items-wrapper">
      <!-- More Options Button -->
      <div class="toolbar-item" @click="emits('trigger', 'path')" title="More">
        <Icon name="toolbar-menu-more" />
      </div>

      <div class="divider"></div>

      <!-- Fill Color -->
      <div class="toolbar-item color-selector" title="Background color">
        <el-popover trigger="click" :width="265" popper-class="toolbar-dropdown">
          <template #reference>
            <TextColorButton :color="handleElement.fill">
              <Icon name="highlight" />
            </TextColorButton>
          </template>
          <ColorPicker :modelValue="handleElement.fill" @update:modelValue="updateFill" />
        </el-popover>
      </div>

      <!-- Mask Image  -->
      <div class="toolbar-item" title="Mask">
        <FileInput class="file-input" @change="(files) => uploadHandle(files) ">
          <Icon name="mask" />
        </FileInput>
      </div>

      <!-- Stroke Color -->
      <div class="toolbar-item color-selector" title="Line color" v-if="hasStroke">
        <el-popover trigger="click" :width="265" popper-class="toolbar-dropdown">
          <template #reference>
            <TextColorButton :color="handleElement.stroke">
              <Icon name="pen" />
            </TextColorButton>
          </template>
          <ColorPicker :modelValue="handleElement.stroke" @update:modelValue="updateStroke" />
        </el-popover>
      </div>

      <div class="divider"></div>

      <!-- Flip Controls -->
      <div class="tool-group">
        <div class="tool-item" @click="handleChangeElementFlip('flipX')" title="Horizontal mirror">
          <Icon name="horizontal-flip" />
        </div>
        <div class="tool-item" @click="handleChangeElementFlip('flipY')" title="Vertical mirror">
          <Icon name="vertical-flip" />
        </div>
      </div>

      <div class="divider"></div>

      <!-- Opacity -->
      <div class="toolbar-item" title="Transparency">
        <el-popover trigger="click" width="300px" popper-class="toolbar-dropdown">
          <template #reference>
            <div class="item-wrapper">
              <Icon name="toolbar-menu-opacity" />
            </div>
          </template>
          <ElementOpacity />
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useTemplatesStore } from '@/store';
import useCanvas from '@/views/Canvas/useCanvas';
import ElementOpacity from "../../CanvasRight/Components/ElementOpacity.vue";
import useHandleCreate from '@/hooks/useHandleCreate'
import { getImageDataURL } from "@/utils/image";

const emits = defineEmits(['trigger']);

const templatesStore = useTemplatesStore();
const mainStore = useMainStore();
const { canvasObject } = storeToRefs(mainStore);
const [canvas] = useCanvas();
const {
  createMaskElement } = useHandleCreate();

const handleElement = computed(() => canvasObject.value);
const hasStroke = computed(() => handleElement.value.stroke ? true : false);
const strokeWidth = ref(handleElement.value ? handleElement.value.strokeWidth : 1);
const windowWidth = ref(window.innerWidth);
const isMobileView = computed(() => windowWidth.value < 768);

// Function to update the window width
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

// Add event listener when component is mounted
onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
});

// Remove event listener when component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
});


// Add Mask function
const uploadHandle = async (files) => {
  const filename = files[0].name
  const fileSuffix = filename.split(".").pop()
  await handleMaskImage()

  if (["jpg", "jpeg", "png", "webp"].includes(fileSuffix)) {
    const dataURL = await getImageDataURL(files[0])
    createMaskElement(dataURL, handleElement.value)
  }
}
const handleMaskImage = async () => {
  if (!handleElement.value) return

  handleElement.value.absolutePositioned = true
  // You'll need to pass templatesStore from parent
}
const updateFill = (fill) => {
  if (!handleElement.value) return;
  templatesStore.modifedElement(handleElement.value, { fill });
};

const updateStroke = (stroke) => {
  if (!handleElement.value) return;
  templatesStore.modifedElement(handleElement.value, { stroke });
};

const updateStrokeWidth = () => {
  if (!handleElement.value) return;
  templatesStore.modifedElement(handleElement.value, { strokeWidth: strokeWidth.value });
  canvas.renderAll();
};

const handleChangeElementFlip = (value) => {
  if (!handleElement.value) return;
  
  value.includes("flipX") && (handleElement.value.flipX = !handleElement.value.flipX);
  value.includes("flipY") && (handleElement.value.flipY = !handleElement.value.flipY);
  
  canvas.renderAll();
};
</script>

<style lang="scss">
@import '@/assets/style/toolbar.scss';

.adjustment-slider {
  padding: 16px;
  
  .slider-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;
    color: #333;
    text-align: center;
  }
}
</style>
