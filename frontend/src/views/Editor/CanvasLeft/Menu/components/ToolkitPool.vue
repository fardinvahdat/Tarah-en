<template>
  <div class="toolkit-explorer">
    <!-- QR Code -->
    <div class="toolkit-card !p-2 gap-2 items-center" @click="createQRElement('A1')">
      <div class="toolkit-icon !m-0 !text-white">
        <Icon name="qrcode" />
      </div>
      <div class="toolkit-content">
        <h3 class="toolkit-title">Q. Code</h3>
        <p class="toolkit-description">Produce QR codes quickly, support 13 styles</p>
      </div>
    </div>

    <!-- QR Code -->
    <div class="toolkit-card !p-2 gap-2 items-center" @click="createBarElement">
      <div class="toolkit-icon !m-0 text-white">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="2" height="16" fill="currentColor" />
          <rect x="8" y="4" width="2" height="16" fill="currentColor" />
          <rect x="12" y="4" width="4" height="16" fill="currentColor" />
          <rect x="18" y="4" width="2" height="16" fill="currentColor" />
        </svg>
      </div>
      <div class="toolkit-content">
        <h3 class="toolkit-title">Barcode</h3>
        <p class="toolkit-description">Produce Barcode codes quickly</p>
      </div>
    </div>


    <ImageMatting :visible="dialogVisible" @close="closeUpload" />
    <ImageFillColor :visible="ImageFillColorVisible" @close="closeImageFillColor" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import Icon from '@/components/Icon.vue';

import {
  encodeData,
  renderer25D,
  rendererRect,
  rendererRound,
  rendererRandRound,
  rendererDSJ,
  rendererRandRect,
  rendererImage,
  rendererCircle,
  rendererLine,
  rendererLine2,
  rendererFuncA,
  rendererFuncB,
  CodeOption,
} from "beautify-qrcode";

import { QRCodeType } from "@/types/canvas";
import JsBarCode from "jsbarcode";
import useHandleCreate from "@/hooks/useHandleCreate";
import { debounce } from "lodash-es";
import { ElMessageBox } from 'element-plus'
import type { Action } from 'element-plus'

const { createQRCodeElement, createBarCodeElement } = useHandleCreate();
const codeContent = ref<string>(window.location.href);
const codeSpace = ref<boolean>(true);
const codeError = ref<number>(0);
const dialogVisible = ref(false);
const ImageFillColorVisible = ref(false);
const openGPTVisible = ref(false)
const generateQRCodeMap = {
  A1: rendererRect,
  A2: rendererRound,
  A3: rendererRandRound,
  SP1: rendererDSJ,
  SP2: rendererRandRect,
  SP3: rendererCircle,
  B1: renderer25D,
  C1: rendererImage,
  A_a1: rendererLine,
  A_a2: rendererLine2,
  A_b1: rendererFuncA,
  A_b2: rendererFuncB,
};

// 获取qrcode
const getEncodeData = (width = 118, height = 118) => {
  const codeOption: CodeOption = {
    text: codeContent.value,
    width,
    height,
    correctLevel: codeError.value,
    isSpace: codeSpace.value,
  };
  return encodeData(codeOption);
};

const createBarElement = () => {
  const codeOption: JsBarCode.BaseOptions = {
    format: "pharmacode",
    lineColor: "#0aa",
    width: 4,
    height: 40,
    displayValue: false,
  };
  JsBarCode("#barcode", "1234", codeOption);
  const barcode = document.getElementById("barcode");
  if (!barcode) return;
  const s = new XMLSerializer().serializeToString(barcode);
  const src = `data:image/svg+xml;base64,` + btoa(s);
  createBarCodeElement(src, "1234", codeOption);
};

const createQRElement = (style: QRCodeType) => {
  const src =
    `data:image/svg+xml;base64,` +
    btoa(generateQRCodeMap[style](getEncodeData(118, 118)));
  const codeOption = {
    codeStyle: style,
    codeSpace: codeSpace.value,
    codeError: codeError.value,
  };
  createQRCodeElement(src, codeOption, codeContent.value);
};

const openUpload = () => {
  dialogVisible.value = true;
};

const closeUpload = () => {
  dialogVisible.value = false;
};

const openImageFillColor = () => {
  ImageFillColorVisible.value = true;
};

const closeImageFillColor = () => {
  ImageFillColorVisible.value = false;
};
const openUseGPT = debounce(function () {
  ElMessageBox.alert('Performance is developing, please join us', 'hint', {
    confirmButtonText: 'Mmwatha',
    callback: (action: Action) => {
      console.log(action)
    },
  })
}, 250)
const openGPTServer = debounce(function () {
  openGPTVisible.value = true
}, 250)
</script>

<style lang="scss" scoped>
.toolkit-explorer {
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolkit-card {
  display: flex;
  background-color: #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-2px);
    background-color: #f5f5f5;
    border-color: rgba($themeColor, 0.3);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}

.toolkit-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  background: linear-gradient(135deg, $themeColor 30%, darken($themeColor, 5%) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;

  .icon {
    font-size: 24px;
    color: white;
  }
}

.toolkit-content {
  flex: 1;
}

.toolkit-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.toolkit-description {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}
</style>
