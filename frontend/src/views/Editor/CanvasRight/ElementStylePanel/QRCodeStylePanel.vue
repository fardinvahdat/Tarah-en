<template>
  <div class="qrcode-style-panel">
    <ElementPosition />
    <el-divider class="divider" />

    <!-- Style Carousel -->
    <div class="section">
      <div class="section-header">Style</div>
      <el-carousel type="card" :height="QRSize + 'px'" :initial-index="initialIndex" :autoplay="false" trigger="click"
        indicator-position="none" ref="carousel">
        <el-carousel-item v-for="item in QRCodeStyleLibs" :key="item.index" :name="item.name">
          <div justify="center" @click="generateQRCode(item.name as QRCodeType)" class="qr-style-item">
            <img v-if="item.name !== 'C2'" :src="`data:image/svg+xml;base64,` + getC2QRcode(item.name)"
              :alt="item.name">
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- QR Code Content -->
    <div class="section">
      <div class="section-header">Link</div>
      <div class="input-row" style="direction: ltr;" >
        <el-input v-model="handleElement.codeContent" @input="updateCodeContent" class="full-width">
          <template #prefix>
            <Icon name="link" class="input-icon" />
          </template>
        </el-input> 
      </div>
    </div>

    <!-- Additional Settings (Uncomment when needed) -->
    <!-- <el-divider class="divider" />
    <div class="section">
      <div class="section-header">فاصله از حاشیه</div>
      <div class="row">
        <el-radio-group class="full-ratio flex-row-reverse gap-2" v-model="handleElement.codeOption.codeSpace"
          @change="updateCodeSpace">
          <el-radio-button :value="true" :label="true">بدون مرز</el-radio-button>
          <el-radio-button :value="false" :label="false">استاندارد</el-radio-button>
        </el-radio-group>
      </div> 
      <div class="section-header">تحمل خطا</div>
      <div class="row">
        <el-radio-group class="full-ratio flex-row-reverse gap-2" v-model="handleElement.codeOption.codeError"
          @change="updateCodeError">
          <el-radio-button label="0">7%</el-radio-button>
          <el-radio-button label="1">15%</el-radio-button>
          <el-radio-button label="2">25%</el-radio-button>
          <el-radio-button label="3">30%</el-radio-button>
        </el-radio-group>
      </div>
    </div> -->

    <el-divider class="divider" />
    <ElementStroke />
    <el-divider class="divider" />
    <ElementShadow :hasShadow="hasShadow" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useTemplatesStore } from '@/store'
import { QRCodeOptionsLibs, QRCodeDotsOptionsLibs, QRCodeCornersOptionsLibs, QRCodeStyleLibs } from '@/configs/codeStyles'
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
  CodeOption
} from 'beautify-qrcode'
import { QRCodeElement, QRCodeType } from '@/types/canvas'
import useCanvas from '@/views/Canvas/useCanvas'
import ElementPosition from '../Components/ElementPosition.vue'
import ElementStroke from '../Components/ElementStroke.vue'
import ElementShadow from '../Components/ElementShadow.vue'

const carousel = ref<HTMLFormElement>()
const QRSize = ref(118)
const mainStore = useMainStore()
const templatesStore = useTemplatesStore()
const [canvas] = useCanvas()
const { canvasObject } = storeToRefs(mainStore)

const generateQRCodeMap = {
  'A1': rendererRect,
  'A2': rendererRound,
  'A3': rendererRandRound,
  'SP1': rendererDSJ,
  'SP2': rendererRandRect,
  'SP3': rendererCircle,
  'B1': renderer25D,
  'C1': rendererImage,
  'A_a1': rendererLine,
  'A_a2': rendererLine2,
  'A_b1': rendererFuncA,
  'A_b2': rendererFuncB,
}

const handleElement = computed(() => canvasObject.value as QRCodeElement)
const hasShadow = computed(() => handleElement.value.shadow ? true : false)
const initialIndex = computed(() => {
  if (!handleElement.value) return 0
  const codeItem = [...QRCodeOptionsLibs, ...QRCodeDotsOptionsLibs, ...QRCodeCornersOptionsLibs].filter(item => item.name === handleElement.value.codeOption.codeStyle)[0]
  if (codeItem) return codeItem.index
  return 0
})

// Enter the two-digit code content
const updateCodeContent = () => {
  generateQRCode()
}

// Modify code margins
const updateCodeSpace = () => {
  generateQRCode()
}

// Modify fault tolerance
const updateCodeError = () => {
  generateQRCode()
}

// Get qrcode
const getEncodeData = (width = QRSize.value, height = QRSize.value) => {
  const codeOption: CodeOption = {
    text: handleElement.value.codeContent,
    width,
    height,
    correctLevel: Number(handleElement.value.codeOption.codeError),
    isSpace: handleElement.value.codeOption.codeSpace
  }
  return encodeData(codeOption)
}

const getC2QRcode = (name: string) => {
  return btoa(generateQRCodeMap[name as QRCodeType](getEncodeData()))
}

const generateQRCode = async (style?: QRCodeType) => {
  const encodeData = getEncodeData()
  if (style) handleElement.value.codeOption.codeStyle = style
  if (!encodeData) return
  const codeStyle = handleElement.value.codeOption.codeStyle as QRCodeType
  const src = `data:image/svg+xml;base64,` + btoa(generateQRCodeMap[codeStyle](encodeData))
  const qrcodeElement = canvasObject.value as QRCodeElement
  await qrcodeElement.setSrc(src)
  templatesStore.modifedElement(qrcodeElement, { src })
  canvas.renderAll()
}
</script>

<style lang="scss" scoped>
.qrcode-style-panel {
  // @apply bg-gray-50 rounded-xl p-4;
}

.divider {
  margin: 16px 0;
  border-color: rgba(0, 0, 0, 0.06);
}

.section {
  margin-bottom: 16px;
}

.section-header {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.input-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  width: 100%;
}

.full-width {
  width: 100%;
}

.input-icon {
  color: #666;
  margin-right: 4px;
}

.qr-style-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px !important;
}

:deep(.el-carousel__item) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-carousel__item div) {
  color: #475669;
  opacity: 0.75;
  text-align: center;
}

:deep(.el-radio-group) {
  width: 100%;
  display: flex;
}

:deep(.el-radio-button) {
  flex: 1;
}

:deep(.el-radio-button__inner) {
  width: 100%;
  border-radius: 8px !important;
}

/* Responsive styles */
@media (max-width: 768px) {
  .qrcode-style-panel {
    padding: 8px;
  }

  .section-header {
    font-size: 13px;
  }
}
</style>
