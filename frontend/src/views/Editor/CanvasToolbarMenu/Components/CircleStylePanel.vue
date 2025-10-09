
<template>
  <div class="toolbar-menu circle-toolbar">
    <div class="toolbar-items-wrapper">
      <!-- More Options Button -->
      <div class="toolbar-item" @click="emits('trigger', 'circle')" title="More">
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

      <!-- Mobile stroke width -->
      <div class="toolbar-item" title="Line thickness" v-if="isMobileView && hasStroke">
        <el-popover trigger="click" width="240" popper-class="toolbar-dropdown">
          <template #reference>
            <div class="item-wrapper">
              <Icon name="pen" />
            </div>
          </template>
          <div class="adjustment-slider">
            <h3 class="slider-title">Line thickness</h3>
            <el-slider v-model="strokeWidth" :min="0" :max="20" :step="1" @change="updateStrokeWidth" />
          </div>
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

const emits = defineEmits(['trigger']);

const templatesStore = useTemplatesStore();
const mainStore = useMainStore();
const { canvasObject } = storeToRefs(mainStore);
const [canvas] = useCanvas();

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
