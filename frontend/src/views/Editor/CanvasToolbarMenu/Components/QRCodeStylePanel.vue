<template>
  <div class="toolbar-menu qrcode-toolbar">
    <div class="toolbar-items-wrapper">
      <!-- More Options Button -->
      <div class="toolbar-item" @click="emits('trigger', 'qr-code')" title="More">
        <Icon name="toolbar-menu-more" />
      </div>

      <div class="divider"></div>


      <!-- Background Color -->
      <div class="toolbar-item color-selector" title="Background color">
        <el-popover trigger="click" ref="bgPopOver" :width="265" popper-class="toolbar-dropdown">
          <template #reference>
            <TextColorButton :color="handleElement.backgroundColor || '#ffffff'">
              <Icon name="highlight" />
            </TextColorButton>
          </template>
          <ColorPicker :modelValue="handleElement.backgroundColor || '#ffffff'"
            @update:modelValue="updateBackgroundColor" />
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
const bgPopOver = ref(null)

const handleElement = computed(() => canvasObject.value);
const qrValue = ref(handleElement.value ? handleElement.value.text : '');
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

const updateBackgroundColor = (backgroundColor) => {
  if (!handleElement.value) return;
  templatesStore.modifedElement(handleElement.value, { backgroundColor });

  // Close the popover after selection
  if (bgPopOver.value) {
    bgPopOver.value.hide();
  }
};

const updateQRValue = () => {
  if (!handleElement.value) return;
  templatesStore.modifedElement(handleElement.value, { text: qrValue.value });
  canvas.renderAll();
};
</script>

<style lang="scss">
@import '@/assets/style/toolbar.scss';

.content-editor {
  padding: 16px;

  .editor-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;
    color: #333;
    text-align: center;
  }
}
</style>
