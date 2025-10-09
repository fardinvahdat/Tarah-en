<template>
  <div class="toolbar-menu line-toolbar">
    <div class="toolbar-items-wrapper">
      <!-- More Options Button -->
      <div class="toolbar-item" @click="emits('trigger', 'line')" title="More">
        <Icon name="toolbar-menu-more" />
      </div>

      <div class="divider"></div>

      <!-- Stroke Color -->
      <div class="toolbar-item color-selector" title="Line color">
        <el-popover trigger="click" :width="265" ref="strokeColorPopover" popper-class="toolbar-dropdown">
          <template #reference>
            <TextColorButton :color="handleElement.stroke">
              <Icon name="font-color" />
            </TextColorButton>
          </template>
          <ColorPicker :modelValue="handleElement.stroke" @update:modelValue="updateStroke" />
        </el-popover>
      </div>

      <div class="divider"></div>

      <!-- Line Width -->
      <div class="toolbar-item" title="Line thickness">
        <el-popover trigger="click" width="240" popper-class="toolbar-dropdown">
          <template #reference>
            <div class="item-wrapper flex items-center justify-center min-h-5">
              <div class="w-5 h-1 rounded-md bg-black"></div>
            </div>
          </template>
          <div class="element-opacity">
            <div class="section">
              <div class="flex justify-between">
                <div class="section-header">Line thickness</div>
                <div class="slider-value">{{ strokeWidth }}</div>
              </div>
              <div class="slider-row">
                <el-slider v-model="strokeWidth" :min="1" :max="20" :step="1" @change="updateStrokeWidth" />
              </div>
            </div>
          </div>
        </el-popover>
      </div>

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

const emits = defineEmits(['trigger']);

const templatesStore = useTemplatesStore();
const mainStore = useMainStore();
const { canvasObject } = storeToRefs(mainStore);
const [canvas] = useCanvas();
const strokeColorPopover = ref(null)

const handleElement = computed(() => canvasObject.value);
const strokeWidth = ref(handleElement.value ? handleElement.value.strokeWidth : 2);
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

const updateStroke = (stroke) => {
  if (!handleElement.value) return;
  templatesStore.modifedElement(handleElement.value, { stroke });
  if (strokeColorPopover.value) {
    strokeColorPopover.value.hide()
  }
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
.element-opacity {
  @apply bg-gray-50 rounded-xl p-4;
}

.section {
  margin-bottom: 16px;
}

.section-header {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider {
  flex: 1;
}

.slider-value {
  min-width: 46px;
  font-size: 12px;
  color: #666;
  text-align: center;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 8px;
}
</style>
