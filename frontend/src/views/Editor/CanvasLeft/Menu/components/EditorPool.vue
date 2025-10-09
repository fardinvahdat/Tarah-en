<template>
  <div class="edit-pool">
    <!-- Files Section -->
    <div class="edit-section pt-20px">
      <div class="section-header">
        <div class="font-bold text-lg mb-6px">Files</div>
      </div>
      <div class="section-content">
        <button class="item-box w-[83px] h-[83px]" :disabled="uploading" @click="uploadFileRef.click()">
          <template v-if="!uploading">
            <Icon name="upload" />
            <div class="mt-8px">Upload</div>
          </template>
          <template v-else>
            <el-progress type="dashboard" class="relative top-1 mb-2" :width="30" :show-text="false"
              :percentage="progressVal" />
            <span class="text-xs">
              {{ progressVal != 100 ? progressVal : 'In preparing ' }}
            </span>
          </template>
        </button>

        <input ref="uploadFileRef" hidden type="file" @change="uploadHandle" accept="image/*" />
      </div>
    </div>

    <!-- Text Section -->
    <div class="edit-section">
      <div class="section-header">
        <div class="font-bold text-lg mb-6px">Text</div>
      </div>
      <div class="section-content">
        <el-row :gutter="12">
          <el-col :span="12">
            <div class="item-box" @click="drawText(60)">
              <Icon name="text" />
              <div class="mt-5px">Title</div>
            </div>
          </el-col>
          <el-col :span="12" @click="drawText(20)">
            <div class="item-box">
              <Icon name="text" />
              <div class="mt-5px">Subtitle</div>
            </div>
          </el-col>
          <el-col :span="12" @click="drawVerticalText(20)" v-if="false">
            <div class="item-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M7 7H17M7 17H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" transform="rotate(90 12 12)" />
              </svg>
              <div class="mt-5px">Vertical text</div>
            </div>
          </el-col>
          <el-col :span="12" @click="drawArcText()">
            <div class="item-box">
              <i class="icon-font iconfont icon-text-path" />
              <div class="mt-5px">Curved text</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- Shapes Section -->
    <div class="edit-section">
      <div class="section-header">
        <div class="font-bold text-lg mb-6px">Disquits</div>
      </div>
      <div class="section-content">
        <el-row :gutter="12">
          <!-- Basic Shapes -->
          <el-col :span="8" v-for="(shape, index) in PathShapeLibs" :key="index" @click="drawPath(shape)">
            <div class="item-box">
              <svg overflow="visible" width="20" height="20">
                <g
                  :transform="`scale(${20 / shape.viewBox[0]}, ${20 / shape.viewBox[1]}) translate(0,0) matrix(1,0,0,1,0,0)`">
                  <path class="shape-path" :class="{ outlined: shape.outlined }" vector-effect="non-scaling-stroke"
                    stroke-linecap="butt" stroke-miterlimit="8" :fill="shape.outlined ? '#999' : 'transparent'"
                    :stroke="shape.outlined ? 'transparent' : '#999'" stroke-width="2" :d="shape.path"></path>
                </g>
              </svg>
              <div class="mt-5px text-xs">{{ shape.title || 'Figure' }}</div>
            </div>
          </el-col>

          <!-- Additional Shapes -->
          <el-col :span="8" v-for="(shape, index) in AdditionalShapes" :key="`add-${index}`" @click="drawPath(shape)">
            <div class="item-box">
              <svg overflow="visible" width="20" height="20">
                <g
                  :transform="`scale(${20 / shape.viewBox[0]}, ${20 / shape.viewBox[1]}) translate(0,0) matrix(1,0,0,1,0,0)`">
                  <path class="shape-path" vector-effect="non-scaling-stroke" stroke-linecap="butt"
                    stroke-miterlimit="8" :fill="shape.outlined ? '#999' : 'transparent'"
                    :stroke="shape.outlined ? 'transparent' : '#999'" stroke-width="2" :d="shape.path"></path>
                </g>
              </svg>
              <div class="mt-5px text-xs">{{ shape.title || 'Figure' }}</div>
            </div>
          </el-col>

          <!-- Lines -->
          <el-col :span="8" v-for="(line, j) in LinePoolItems" :key="`line-${j}`" @click="drawLine(line)">
            <div class="item-box">
              <svg overflow="visible" width="20" height="20">
                <defs>
                  <LinePointMarker class="line-marker" v-if="line.points[0]" :id="`preset-line-${j}`" position="start"
                    :type="line.points[0]" color="currentColor" :baseSize="2" />
                  <LinePointMarker class="line-marker" v-if="line.points[1]" :id="`preset-line-${j}`" position="end"
                    :type="line.points[1]" color="currentColor" :baseSize="2" />
                </defs>
                <path class="line-path" :d="line.path" stroke="#999" fill="none" stroke-width="2"
                  :stroke-dasharray="line.style === 'solid' ? '0, 0' : '4, 1'"
                  :marker-start="line.points[0] ? `url(#${`preset-line-${j}`}-${line.points[0]}-start)` : ''"
                  :marker-end="line.points[1] ? `url(#${`preset-line-${j}`}-${line.points[1]}-end)` : ''"></path>
              </svg>
              <div class="mt-5px">{{ line.title || 'Line' }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- Module Section -->
    <div class="edit-section">
      <div class="section-header">
        <div class="font-bold text-lg mb-6px">Module</div>
      </div>
      <div class="section-content">
        <el-row :gutter="12">
          <el-col :span="12">
            <div class="item-box" @click="createQRElement('A1')">
              <Icon name="qrcode" />
              <div class="mt-5px">QR Code</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="item-box" @click="createBarElement()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="2" height="16" fill="currentColor" />
                <rect x="8" y="4" width="2" height="16" fill="currentColor" />
                <rect x="12" y="4" width="4" height="16" fill="currentColor" />
                <rect x="18" y="4" width="2" height="16" fill="currentColor" />
              </svg>
              <div class="mt-5px">Barcode</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <ImageMatting :visible="dialogVisible" @close="closeUpload" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { ShapePathFormulasKeys, PathListItem } from "@/types/elements";
import { ElMessage, genFileId, UploadInstance, UploadProps, UploadRawFile } from "element-plus"
import { encodeData, renderer25D, rendererRect, rendererRound, rendererRandRound, rendererDSJ, rendererRandRect, rendererImage, rendererCircle, rendererLine, rendererLine2, rendererFuncA, rendererFuncB, CodeOption } from "beautify-qrcode";
import { PathPoolItem } from '@/types/elements'
import { QRCodeType, Template } from "@/types/canvas";
import { getImageDataURL, getImageText } from "@/utils/image";
import { compressAndUploadImage } from "@/api/compression";
import { compressImageIfNeeded } from "@/utils/imageCompression";
import { LinePoolItems, LinePoolItem } from "@/configs/lines";
import { loadSVGFromString } from 'fabric'
import { uploadFile } from '@/api/file'
import useCanvasScale from '@/hooks/useCanvasScale'
import useHandleCreate from '@/hooks/useHandleCreate'
import useHandleTemplate from '@/hooks/useHandleTemplate'
import JsBarCode from "jsbarcode";
import useCanvas from "@/views/Canvas/useCanvas";
import { uploadFileToFilebase } from '@/utils/filebase'
import { useFileStore } from "@/store";

const { addTemplate } = useHandleTemplate()
const { handleUpload, handleUploadImageWithPercentage } = useFileStore()
const { setCanvasTransform } = useCanvasScale()
const {
  createQRCodeElement,
  createBarCodeElement,
  createImageElement,
  createTextElement,
  createPathElement,
  createLineElement,
  createArcTextElement,
  createVerticalTextElement,
  createVideoElement,
} = useHandleCreate();

const codeContent = ref<string>(window.location.href);
const codeSpace = ref<boolean>(true);
const codeError = ref<number>(0);
const uploadRef = ref<UploadInstance>()
const dialogVisible = ref(false);
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
const uploadFileRef = ref(false)
const fileAccept = ref(".pdf,.psd,.cdr,.ai,.svg,.jpg,.jpeg,.png,.webp,.json,.mp4");
const uploading = ref(false);
const progressVal = ref(0)

// Base shapes
const PathShapeLibs: PathPoolItem[] = [
  {
    viewBox: [200, 200],
    path: "M 0 0 L 200 0 L 200 200 L 0 200 Z",
    title: "square"
  },
  {
    viewBox: [200, 200],
    path: "M 100 0 L 0 200 L 200 200 L 100 0 Z",
    pathFormula: ShapePathFormulasKeys.TRIANGLE,
    title: "Triangle"
  },
  {
    viewBox: [200, 200],
    path: "M 100 0 A 100 100 0 1 1 100 200 A 100 100 0 1 1 100 0 Z",
    title: "Circle"
  },
  {
    viewBox: [200, 200],
    path: "M 0 0 L 200 0 L 200 100 L 100 100 L 100 200 L 0 200 Z",
    title: "L shape"
  },
];

// Additional shapes for more variety
const AdditionalShapes: PathPoolItem[] = [
  {
    viewBox: [200, 200],
    path: "M 0 50 L 50 0 L 150 0 L 200 50 L 200 150 L 150 200 L 50 200 L 0 150 Z",
    title: "Octagonal"
  },
  {
    viewBox: [200, 200],
    path: "M 0 0 L 200 0 L 150 200 L 50 200 Z",
    title: "Trapezoid"
  },
  {
    viewBox: [200, 200],
    path: "M 0 50 C 0 0, 200 0, 200 50 L 200 150 C 200 200, 0 200, 0 150 Z",
    title: "Capsule"
  },
  {
    viewBox: [200, 200],
    path: "M 0 0 L 150 0 L 200 50 L 200 200 L 50 200 L 0 150 Z",
    title: "Pencil"
  },
  {
    viewBox: [200, 200],
    path: "M 0 50 L 50 0 L 150 0 L 200 50 L 200 150 L 150 200 L 50 200 L 0 150 L 50 100 L 150 100 L 200 50",
    title: "Star"
  },
  {
    viewBox: [200, 200],
    path: "M 100 0 L 120 80 L 200 100 L 120 120 L 100 200 L 80 120 L 0 100 L 80 80 Z",
    title: "Star 4 feathers"
  },
  {
    viewBox: [200, 200],
    path: "M 20 60 L 100 20 L 180 60 L 180 140 L 100 180 L 20 140 Z",
    title: "Hexagonal"
  },
  {
    viewBox: [200, 200],
    path: "M 0 80 L 80 0 L 200 0 L 200 120 L 120 200 L 0 200 Z",
    title: "Multiple"
  },
];

// Get qrcode
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
  const src = `data:image/svg+xml;base64,` + btoa(generateQRCodeMap[style](getEncodeData(118, 118)));
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

// Upload
const uploadHandle = async (event: any) => {
  const file = event.target.files[0]
  const filename = event.target.files[0].name

  const [canvas] = useCanvas();
  const fileSuffix = filename.split(".").pop()?.toLowerCase();
  if (!fileAccept.value.split(",").includes(`.${fileSuffix}`)) return;
  if (fileSuffix === "svg") {
    const dataText = await getImageText(file);
    const content = await loadSVGFromString(dataText);
    canvas.add(...content.objects as any);
    canvas.renderAll();
  }
  if (fileSuffix === "json") {
    const dataText = await getImageText(FileReader);
    const template = JSON.parse(dataText);
    addTemplate(template);
  }
  if (["jpg", "jpeg", "png", "webp"].includes(fileSuffix)) {
    try {


      const maxSize = 1048576;
      if (file.size > maxSize) {
        ElMessage({
          message: 'The selected image should be smaller than 1MB.',
          type: 'error',
        })
        return
      }

      // NEW: Use backend compression instead of frontend base64 compression
      uploading.value = true
      progressVal.value = 10

      // Convert file to base64
      const base64Image = await toBase64(file) as string
      progressVal.value = 30

      // Compress and upload to backend
      const compressionResult = await compressAndUploadImage(base64Image, {
        quality: 100,
        max_width: 2048,
        max_height: 2048
      })
      progressVal.value = 80

      // Use the compressed image URL instead of base64
      await createImageElement(compressionResult.url)
      progressVal.value = 100

      console.log(`Image compressed: ${compressionResult.compression_ratio}% reduction, file size: ${compressionResult.file_size} bytes`)

    } catch (error) {
      console.error('Image upload failed:', error)
      // Fallback to local compression if backend fails
      const compressedUrl = await compressImageIfNeeded(file, 0.7)
      await createImageElement(compressedUrl)
    } finally {
      uploading.value = false
    }
  }
  if (['mp4'].includes(fileSuffix)) {
    const dataURL = URL.createObjectURL(FileReader)
    createVideoElement(dataURL)
  }
};


const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});

const handleExceed: UploadProps["onExceed"] = (files: File[]) => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
};

// Add title text
const drawText = (fontSize: number, textStyle: "transverse" | "direction" = "transverse", textHollow = false) => {
  createTextElement(fontSize, textStyle, textHollow, 'Double -click to change the text.', [{ color: "#000" }]);
};

// Add circular text
const drawArcText = (fontSize: number = 36, textStyle: "transverse" | "direction" = "transverse", textHollow = false) => {
  createArcTextElement(fontSize, textStyle, textHollow, 'Double Click For Editing...', [{ color: "#000" }])
}

const drawVerticalText = (fontSize: number, textHollow = false) => {
  createVerticalTextElement(fontSize, textHollow, 'Double Click For Editing...')
}

// Adding shapes
const drawPath = (shape: PathPoolItem) => {
  createPathElement(shape.path);
};

// Add lines
const drawLine = (line: LinePoolItem) => {
  const strokeDashArray: [number, number] | undefined = line.style === "dashed" ? [6, 6] : undefined;
  createLineElement(line.data, line.points[0], line.points[1], strokeDashArray);
};

</script>

<style lang="scss" scoped>
.edit-pool {
  overflow: auto;
  // max-height: 100vh;
  padding-bottom: 20px;
}

.section-header {
  margin-bottom: 10px;
}

.section-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.edit-section {
  width: 90%;
  margin: 0px 20px 15px 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .item-box {
    background-color: #f6f6f6;
    border-radius: 8px;
    padding: 15px 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    flex-direction: column;
    font-size: 12px;
    margin-bottom: 10px;
    transition: all 0.2s ease;

    &:hover {
      background-color: #e8eaec;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
  }
}

.mt-5px {
  margin-top: 5px;
}

.mt-8px {
  margin-top: 8px;
}

.pt-20px {
  padding-top: 20px;
}

.icon-font {
  font-size: 20px;
  height: 20px;
}

// Responsive grid adjustments
@media (max-width: 768px) {
  .edit-section {
    width: 100%;
    margin: 0px;
  }

  .el-col {
    padding-right: 5px !important;
    padding-left: 5px !important;
  }

  .item-box {
    padding: 10px 8px;
  }
}
</style>
