<template>
  <div class="toolbar-menu barcode-toolbar">
    <div class="toolbar-items-wrapper">
      <!-- More Options Button -->
      <div class="toolbar-item" @click="emits('trigger', 'barcode')" title="More">
        <Icon name="toolbar-menu-more" />
      </div>

      <div class="divider"></div>

      <!-- Barcode Color -->
      <div class="toolbar-item color-selector" title="Barcode color">
        <el-popover trigger="click" ref="barcodePopover" :width="265" popper-class="toolbar-dropdown">
          <template #reference>
            <TextColorButton :color="handleElement.codeOption?.lineColor"
              :style="`color:${handleElement.codeOption?.lineColor}`">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                data-v-348853a7="">
                <rect x="4" y="4" width="2" height="16" fill="currentColor" data-v-348853a7=""></rect>
                <rect x="8" y="4" width="2" height="16" fill="currentColor" data-v-348853a7=""></rect>
                <rect x="12" y="4" width="4" height="16" fill="currentColor" data-v-348853a7=""></rect>
                <rect x="18" y="4" width="2" height="16" fill="currentColor" data-v-348853a7=""></rect>
              </svg>
            </TextColorButton>
          </template>
          <ColorPicker :modelValue="handleElement.codeOption?.lineColor" @update:modelValue="updateFill" />
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

      <!-- Mobile barcode value editing -->
      <div class="toolbar-item" title="ویرایش محتوا" v-if="false">
        <el-popover trigger="click" width="300" popper-class="toolbar-dropdown">
          <template #reference>
            <div class="item-wrapper">
              <Icon name="toolbar-menu-barcode" />
            </div>
          </template>
          <div class="content-editor">
            <h3 class="editor-title">محتوای بارکد</h3>
            <el-input v-model="barcodeValue" @input="updateBarcodeValue" />
          </div>
        </el-popover>
      </div>
    </div>
    <svg id="barcode" style="display:none" class="invisible !hidden"></svg>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useTemplatesStore } from '@/store';
import useCanvas from '@/views/Canvas/useCanvas';
import ElementOpacity from "../../CanvasRight/Components/ElementOpacity.vue";
import JsBarCode from "jsbarcode";

const emits = defineEmits(['trigger']);

const templatesStore = useTemplatesStore();
const mainStore = useMainStore();
const { canvasObject } = storeToRefs(mainStore);
const [canvas] = useCanvas();

const handleElement = computed(() => canvasObject.value);
const barcodeValue = ref(handleElement.value ? handleElement.value.text : '');
const windowWidth = ref(window.innerWidth);
const barcodePopover = ref(null)

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
  handleElement.value.codeOption.lineColor = fill;
  generateBarCode();

  // Close the popover after selection
  if (barcodePopover.value) {
    barcodePopover.value.hide();
  }
};

// Update background color
const updateBackgroundColor = (color) => {
  handleElement.value.codeOption.lineColor = color;
  generateBarCode();
};

const updateBarcodeValue = () => {
  if (!handleElement.value) return;
  templatesStore.modifedElement(handleElement.value, { text: barcodeValue.value });
  canvas.renderAll();
};


const generateBarCode = async () => {
  const options = {
    format: handleElement.value.codeOption?.format,
    lineColor: handleElement.value.codeOption?.lineColor || "#000000",
    width: handleElement.value.codeOption.width,
    height: handleElement.value.codeOption.height,
    displayValue: handleElement.value.codeOption.displayValue || false,
    background: handleElement.value.codeOption.background || "#FFFFFF"
  };

  try {
    JsBarCode(
      "#barcode",
      handleElement.value.codeContent,
      options
    );

    const barcode = document.getElementById("barcode");
    if (!barcode) return;

    const src = `data:image/svg+xml;base64,` + btoa(new XMLSerializer().serializeToString(barcode));
    await handleElement.value.setSrc(src);
    templatesStore.modifedElement(handleElement.value, { src });
    canvas.renderAll();
  } catch (error) {
    console.error(error);
    // Show error message in Persian
    ElMessage({
      message: `خطا: مقدار وارد شده برای فرمت بارکد "${handleElement.value.codeOption.format}" معتبر نیست.`,
      type: 'error',
      duration: 3000
    });
  }
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
