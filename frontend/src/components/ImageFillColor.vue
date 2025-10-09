<template>
  <el-dialog v-model="dialogVisible" title="رنگ تصویر" width="35%" class="upload-dialog md:w-[432px] w-[90%]"
    :before-close="closeUpload" :close-on-click-modal="false">
    <el-upload v-if="showUpload" class="upload-demo" ref="uploadRef" :on-exceed="handleExceed" drag action="http"
      :http-request="uploadHandle" :limit="1" :accept="fileAccept" v-loading="uploading">
      <el-icon :size="50">
        <UploadFilled />
      </el-icon>
      <div class="el-upload__text">
        Draw the picture here or<em>Select the image to upload</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
Supported video formats
        </div>
      </template>
    </el-upload>
    <div v-else class="image-editor">
      <div class="color-picker-wrapper">
        <el-popover trigger="click" :width="265">
          <template #reference>
            <div class="color-button-container">
              <button :style="`background:${targetColor}`"
                class="color-button">
                <Icon name="pallete" />
              </button>
              <div class="color-label">Color selection</div>
            </div>
          </template>
          <ColorPicker :modelValue="targetColor" @update:modelValue="(color:string) =>updateTargetColor(color)" />
        </el-popover>
      </div>
      <div class="canvas-container">
        <canvas id="ImageFillColor"></canvas>
      </div>
      <div class="instructions">
Click the desired section in the picture to change the color
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <div class="action-buttons">
          <el-button v-show="!showUpload && dataURL" type="danger" class="action-button" @click="clear">Clear</el-button>
          <el-button v-show="!showUpload && dataURL" type="success" class="action-button" @click="download">Download</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch, nextTick } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { getImageDataURL, getImageText } from '@/utils/image'
import { ElMessage, genFileId, UploadInstance, UploadProps, UploadRawFile } from "element-plus"
import { uploadFile } from '@/api/file'
import { useTemplatesStore } from '@/store'
import useCanvasScale from '@/hooks/useCanvasScale'
import useHandleCreate from '@/hooks/useHandleCreate'
import useHandleTemplate from '@/hooks/useHandleTemplate'
import useCanvas from '@/views/Canvas/useCanvas'

import tinycolor from 'tinycolor2'
import { downloadLinkFile } from "@/utils/download";


const templatesStore = useTemplatesStore()
const { setCanvasTransform } = useCanvasScale()
const { createImageElement, createVideoElement } = useHandleCreate()
const { addTemplate } = useHandleTemplate()
const dialogVisible = ref(false)
const uploading = ref(false)
const showUpload = ref(true)
const fileAccept = ref('.jpg,.jpeg,.png,.webp,')
const uploadRef = ref<UploadInstance>()
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})
const canvasWidth = ref(400)
const dataURL: ImageData = ref('')
const targetColor = ref('#ffffff')

const emit = defineEmits<{
  (event: 'close'): void
}>()

watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    uploadRef.value?.clearFiles()
  }
})

const closeUpload = () => {
  emit('close')
}

const uploadHandle = async (option: any) => {
  const [ canvas ] = useCanvas()
  const filename = option.file.name
  const fileSuffix = filename.split('.').pop()
  if (!fileAccept.value.split(',').includes(`.${fileSuffix}`)) return
  if (['jpg', 'jpeg', 'png', 'webp'].includes(fileSuffix)) {
    dataURL.value = await getImageDataURL(option.file)
    showUpload.value = false
    nextTick(() => {
      initCanvas()
    })
  }
}

const clear = () => {
  dataURL.value = ''
  showUpload.value = true
};

const updateTargetColor = (color: string) => {
  targetColor.value = tinycolor(color).toHexString();
}

const handleExceed: UploadProps['onExceed'] = (files: File[]) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}
let cvs: HTMLCanvasElement | null = null
const initCanvas = () => {
  cvs = document.getElementById('ImageFillColor') as HTMLCanvasElement
  const ctx = cvs.getContext('2d', {
    willReadFrequently: true,
  })
  const img = new Image();
  // let originalImageData: ImageData;
  img.src = dataURL.value;
  img.onload = () => {
    const maxWH = Math.max(img.width, img.height);
    const imgScale = canvasWidth.value / maxWH;
      cvs.width = img.width * imgScale;
      cvs.height = img.height * imgScale;
    // Drawing an Image
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
    // Save the original image data after loading the image
      dataURL.value = ctx.getImageData(0, 0, cvs.width, cvs.height);
  }
  cvs.addEventListener('click', e=>{
        console.log(e)
        const x = e.offsetX;
        const y = e.offsetY;
        if (!dataURL.value) {
          console.error("Raw image data is not initialized!");
            return;
        }
    // Restore original image data
        ctx.putImageData(dataURL.value, 0, 0);
    // Get the pixel color at the click position
        const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
        const clickColor = getColor(x, y, imgData);
        const targetColorRgba = tinycolor(targetColor.value).toRgb();
        const targetColorArr = [targetColorRgba.r, targetColorRgba.g, targetColorRgba.b, 255];

        const stack = [{ x, y }];
        while (stack.length > 0) {
            const { x, y } = stack.pop();
            
            if (x < 0 || x >= cvs.width || y < 0 || y >= cvs.height) {
                continue;
            }
            
            const i = point2Index(x, y);
            const color = getColor(x, y, imgData);
            
            if (diff(color, clickColor) <= 100 && diff(color, targetColorArr) !== 0) {
                imgData.data.set(targetColorArr, i);
                
                stack.push({ x: x + 1, y });
                stack.push({ x: x - 1, y });
                stack.push({ x, y: y + 1 });
                stack.push({ x, y: y - 1 });
            }
        }
        ctx.putImageData(imgData, 0, 0);
        dataURL.value =imgData
        
    })
}

const point2Index = (x, y) =>{
    return ( y * cvs.width + x ) * 4;
}
const getColor = (x, y, imageData) =>{
    const i = point2Index(x, y);
    return [
        imageData.data[i],
        imageData.data[i+1],
        imageData.data[i+2],
        imageData.data[i+3],
    ];
}
const diff = (color1, color2) =>{
    const res = Math.abs(color1[0] - color2[0]) +
        Math.abs(color1[1] - color2[1]) + 
        Math.abs(color1[2] - color2[2]) + 
        Math.abs(color1[3] - color2[3]);
    return res;
}

const download = () => {
  if (!dataURL.value) return;
  const canvas = document.getElementById('ImageFillColor'); // Replace with the id of your canvas element
  downloadLinkFile(
    canvas.toDataURL('image/png'),
    `editor-${Date.now()}-ImageFillColor.png`
  );
};

</script>

<style lang="scss" scoped>
.upload-dialog {
  max-width: 90vw;
}

.image-editor {
  @apply flex flex-col items-center gap-4;
}

.color-picker-wrapper {
  @apply w-full mb-2;
}

.color-button-container {
  @apply flex flex-col items-center gap-1;
}

.color-button {
  @apply w-20 h-10 rounded-xl border border-gray-200 flex items-center justify-center shadow-sm cursor-pointer transition-all;
  
  &:hover {
    @apply shadow-md;
    transform: translateY(-2px);
  }
}

.color-label {
  @apply text-xs text-gray-500 mt-1;
}

.canvas-container {
  @apply w-full flex justify-center mt-2 mb-4 bg-gray-50 p-2 rounded-lg;
  max-height: 40vh;
  overflow: auto;
}

#ImageFillColor {
  @apply rounded-md;
  max-width: 100%;
  max-height: 38vh;
}

.instructions {
  @apply text-sm text-gray-600 bg-blue-50 p-2 rounded-lg w-full text-center;
}

.dialog-footer {
  @apply flex justify-center pt-3;
}

.action-buttons {
  @apply flex gap-3;
}

.action-button {
  min-width: 100px;
  @apply rounded-xl;
}
</style>

<style>
.upload-dialog .el-dialog__header {
  text-align: left
}
.upload-dialog .el-upload__tip {
  text-align: left;
}
.upload-dialog .el-upload-list__item-name {
  padding: 0;
}
.upload-dialog .el-upload-list__item-info {
  width: 100%;
  margin-left: 0;
}
</style>
