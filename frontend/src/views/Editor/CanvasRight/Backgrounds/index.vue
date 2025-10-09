<template>
  <div class="background-content">
    <h1 class="text-xl font-bold mb-4 relative">Background</h1>

    <!-- Solid Color Section -->
    <transition name="fade" mode="out-in">
      <div class="section-content">
        <p class="text-gray-600 text-sm mb-4">Uniform color</p>
        <div class="color-grid !grid-cols-6">
          <div class="color-picker-item">
            <el-popover trigger="click" placement="bottom" :width="265">
              <template #reference>
                <div class="color-button custom-color md:h-[36px] !h-full"
                  :style="{ backgroundColor: background.fill || '#fff' }">
                  <Icon name="pallete" class="color-icon" />
                </div>
              </template>
              <ColorPicker :modelValue="background.color || '#fff'"
                @update:modelValue="(color) => updateBackground({ color, fill: color }, true)" />
            </el-popover>
          </div>
          <div v-for="(item, index) in ColorLibs" :key="index" class="color-swatch "
            :style="{ backgroundColor: item.value }"
            @click="updateBackground({ color: item.value, fill: item.value }, true)">
          </div>
        </div>
      </div>
    </transition>

    <el-divider />

    <!-- Gradient Section -->
    <transition name="fade" mode="out-in">
      <div class="section-content">
        <div class="flex items-center justify-between mb-4">
          <p class="text-gray-600 text-sm">Color spectrum</p>
          <el-switch v-model="gradientType" @change="changeGradientType" active-value="linear" inactive-value="radial"
            active-text="Linear" inactive-text="Radial" class="flex-row-reverse" />
        </div>

        <div class="gradient-grid !grid-cols-6 !gap-[6px] !pl-0">
          <div v-for="(item, nameIndex) in GradientColorLibs" :key="nameIndex" class="gradient-item !outline-none"
            :class="{ 'selected': background.gradientName === item.name }" @click="changeGradientName(item.name)">
            <GradientFill :name="item.name" :type="background.gradientType || 'linear'" :colors="item.colors" />
          </div>
        </div>

        <div v-if="background.fillType == 2" id="gradiant_customize_menu">
          <div class="controls-section mt-5">


            <div class="element-slider">
              <div class="section">
                <div class="flex justify-between">
                  <div class="section-header">Transparency</div>
                  <div class="slider-value">{{ gradientOpacity.toFixed(2) }}</div>
                </div>
                <div class="slider-row">
                  <el-slider class="slider" v-model="gradientOpacity" :min="0" :max="1" :step="0.01"
                    @change="generateGradientBackground" />
                </div>
              </div>
            </div>


            <div class="element-slider" v-if="background.gradientType === 'linear'">
              <div class="section">
                <div class="flex justify-between">
                  <div class="section-header">زاویه</div>
                  <div class="slider-value">{{ gradientRotate }}°</div>
                </div>
                <div class="slider-row">
                  <el-slider class="slider" v-model="gradientRotate" :min="0" :max="360" :step="1"
                    @change="generateGradientBackground" />
                </div>
              </div>
            </div>

            <div class="element-slider">
              <div class="section">
                <div class="flex justify-between">
                  <div class="section-header">{{ background.gradientType === 'linear' ? 'Horizontal distance' : 'Vertical distance'
                    }}</div>
                  <div class="slider-value">{{ gradientOffsetX }}</div>
                </div>
                <div class="slider-row">
                  <el-slider class="slider" v-model="gradientOffsetX" :min="0" :max="1" :step="0.01"
                    @change="(val) => { gradientOffsetX = val; generateGradientBackground(); }" />
                </div>
              </div>
            </div>

            <div class="element-slider">
              <div class="section">
                <div class="flex justify-between">
                  <div class="section-header">Vertical distance</div>
                  <div class="slider-value">{{ gradientOffsetY.toFixed(2) }}</div>
                </div>
                <div class="slider-row">
                  <el-slider class="slider" v-model="gradientOffsetY" :min="0" :max="1" :step="0.01"
                    @change="(val) => { gradientOffsetY = val; generateGradientBackground(); }" />
                </div>
              </div>
            </div>


          </div>

          <div class="gradient-colors mt-5">
            <p class="text-gray-600 text-sm mb-3">Spectrum colors</p>
            <div class="gradient-colors-row">
              <div v-for="(item, index) in background.gradientColor" :key="index" class="gradient-color-box">
                <el-popover trigger="click" width="265">
                  <template #reference>
                    <div class="color-button" :style="{ backgroundColor: item.color }">
                      <Icon name="pallete" class="color-icon" />
                    </div>
                  </template>
                  <ColorPicker :modelValue="item.color"
                    @update:modelValue="(color) => updateGradientBackground(index, color)" />
                </el-popover>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <el-divider />

    <!-- Upload Section -->
    <transition name="fade" mode="out-in">
      <div class="section-content">
        <div class="flex items-center justify-between mb-4">
          <p class="text-gray-600 text-sm">Upload image</p>
          <el-select v-model="background.imageSize" @change="changeImageSize" class="!w-1/2">
            <el-option v-for="item in BackgroundFillImageMode" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </div>

        <FileInput @change="(files) => uploadBackgroundImage(files)">
          <div class="upload-area">
            <div class="upload-content"
              :style="{ backgroundImage: background.imageURL ? `url(${background.imageURL})` : 'none' }">
              <div v-if="!background.imageURL" class="upload-placeholder">
                <BackgroundTypeIcons name="upload" />
                <span class="mt-2">Click to upload</span>
              </div>
            </div>
          </div>
        </FileInput>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { useMainStore, useTemplatesStore } from "@/store";
import { storeToRefs } from "pinia";
import { Gradient, Pattern, util } from "fabric";
import { TransparentFill, BackgroundFillMode, BackgroundFillImageMode } from "@/configs/background";
import { ColorLibs } from "@/configs/colors";
import { GradientColorLibs } from "@/configs/colorGradient";
import { GradientCoords } from "@/types/elements";
import { WorkSpaceElement } from "@/types/canvas";
import { getImageDataURL } from "@/utils/image";
import { WorkSpaceDrawType } from "@/configs/canvas";
import useCanvas from "@/views/Canvas/useCanvas";
import GradientFill from "./GradientFill.vue";
import BackgroundTypeIcons from "@/components/BackgroundTypeIcons.vue";
import useHandleBackground from "@/hooks/useHandleBackground";

const templatesStore = useTemplatesStore();
const mainStore = useMainStore();
const { setBackgroudImage } = useHandleBackground();
const { currentTemplate } = storeToRefs(templatesStore);

// Gradient settings
const gradientType = ref('linear');
const gradientOpacity = ref(1);
const gradientRotate = ref(0);
const gradientOffsetX = ref(0);
const gradientOffsetY = ref(0);

// Default images from Lorem Picsum
const defaultImages = [];

onMounted(() => {
  // Initialize gradient type from background if available
  if (background.value.gradientType) {
    gradientType.value = background.value.gradientType;
  }

  // Initialize gradient opacity and other values
  gradientOpacity.value = currentTemplate.value?.workSpace?.opacity ?? 1;
  gradientRotate.value = currentTemplate.value?.workSpace?.fill?.gradientRotate ?? 0;

  if (currentTemplate.value?.workSpace?.fill?.offsetX && currentTemplate.value?.workSpace?.width) {
    gradientOffsetX.value = currentTemplate.value.workSpace.fill.offsetX / currentTemplate.value.workSpace.width;
  }

  if (currentTemplate.value?.workSpace?.fill?.offsetY && currentTemplate.value?.workSpace?.height) {
    gradientOffsetY.value = currentTemplate.value.workSpace.fill.offsetY / currentTemplate.value.workSpace.height;
  }
});

// Setup computed property for the background
const background = computed(() => {
  if (!currentTemplate.value) {
    return {
      fillType: 0,
      fill: TransparentFill,
      backgroundColor: "#fff",
    } as WorkSpaceElement;
  }
  if (!currentTemplate.value.workSpace) {
    return {
      fillType: 0,
      fill: TransparentFill,
      backgroundColor: "#fff",
    } as WorkSpaceElement;
  }
  return currentTemplate.value.workSpace;
});

// Set the background image to hide
const removeBackgroundElement = () => {
  const [canvas] = useCanvas();
  canvas.set("backgroundImage", null);
  canvas.renderAll();
};

// Set background mode: solid color, image, gradient
const changeBackgroundType = (type: number) => {
  // Solid Color
  if (type === 0) {
    const templateBackground: WorkSpaceElement = {
      ...background.value,
      fillType: type,
      fill: background.value.color || "#fff",
    };
    removeBackgroundElement();
    // updateBackground(templateBackground);
  }
  // picture
  else if (type === 1) {
    const templateBackground: WorkSpaceElement = {
      ...background.value,
      fillType: type,
      fill: "#fff",
      imageURL: background.value.imageURL || "",
      imageSize: background.value.imageSize || "cover",
    };
    removeBackgroundElement();
    updateBackground(templateBackground);
    if (background.value.imageURL) {
      changeBackgroundImage(background.value.imageURL);
    }
  }
  // Gradient
  else {
    const templateBackground: WorkSpaceElement = {
      ...background.value,
      fillType: 2,
      gradientType: background.value.gradientType || "linear",
      gradientColor: background.value.gradientColor || GradientColorLibs[0].colors,
      gradientName: background.value.gradientName || GradientColorLibs[0].name,
    };
    updateBackground(templateBackground);
    generateGradientBackground();
  }
};

// Setting the Background
const updateBackground = async (props: Partial<WorkSpaceElement>, isSolid: boolean = false) => {
  const [canvas] = useCanvas();
  const workSpaceDraw = canvas?.getObjects().filter((item) => item.id === WorkSpaceDrawType)[0];
  if (!workSpaceDraw) return;
  workSpaceDraw.set({ ...props });
  if (props.fill instanceof Pattern) {
    props.fill = props.fill.toObject() as Pattern
  }
  if (isSolid) {
    changeBackgroundType(0);
  }
  templatesStore.updateWorkSpace({ workSpace: { ...background.value, ...props } });
  canvas.renderAll();
};

// Modify upload background
const changeBackgroundImage = async (imageURL: string) => {
  if (background.value.imageSize === "repeat") {
    const backgroundImage = await util.loadImage(imageURL);
    const workSpacePattern = new Pattern({
      source: backgroundImage,
      repeat: "repeat",
    });
    updateBackground({ fill: workSpacePattern, imageURL });
  } else {
    setBackgroudImage(imageURL);
    updateBackground({ fill: TransparentFill, imageURL });
  }
};

// Upload background image
const uploadBackgroundImage = (files: FileList) => {
  changeBackgroundType(1);
  const imageFile = files[0];
  if (!imageFile) return;
  getImageDataURL(imageFile).then((imageURL) => {
    changeBackgroundImage(imageURL);
  });
};

// Set background image from default images
const setBackgroundImage = (imageURL: string) => {
  changeBackgroundType(1);
  changeBackgroundImage(imageURL);
};

// Modify background image
const changeImageSize = () => {
  if (!background.value.imageURL) return;
  changeBackgroundImage(background.value.imageURL);
};

// Modify gradient name
const changeGradientName = async (gradientName: string) => {
  await changeBackgroundType(2);
  const gradientColorLib = GradientColorLibs.filter(
    (item) => item.name === gradientName
  )[0];
  if (gradientColorLib) {
    background.value.gradientName = gradientName;
    updateBackground({ gradientColor: gradientColorLib.colors });
    generateGradientBackground();
  }
};


// Modify the gradient type
const changeGradientType = (value: string) => {
  background.value.gradientType = value;
  updateBackground({ gradientType: value });
  generateGradientBackground();
};

// Modify gradient colors
const updateGradientBackground = (index: number, color: string) => {
  const gradientBackgroundColor = background.value.gradientColor;
  if (gradientBackgroundColor) {
    gradientBackgroundColor[index].color = color;
    updateBackground({ gradientColor: gradientBackgroundColor });
    generateGradientBackground();
  }
};

// Generate a gradient background
const generateGradientBackground = () => {
  const [canvas] = useCanvas();
  const workSpaceDraw = canvas?.getObjects().filter((item) => item.id === WorkSpaceDrawType)[0];
  if (!workSpaceDraw) return;
  const width = workSpaceDraw.width;
  const height = workSpaceDraw.height;
  if (!width || !height) return;
  let coords: GradientCoords = { x1: 0, y1: 0, x2: width, y2: 0 };
  if (background.value.gradientType !== "linear") {
    coords = {
      r1: 0,
      r2: height / 2,
      x1: width / 2,
      y1: height / 2,
      x2: width / 2,
      y2: height / 2,
    };
  }
  const rotateCos = Math.cos((gradientRotate.value * Math.PI) / 180.0);
  const rotateSin = Math.sin((gradientRotate.value * Math.PI) / 180.0);
  const gradient = new Gradient({
    type: background.value.gradientType,
    colorStops: background.value.gradientColor || GradientColorLibs[0].colors,
    coords: coords,
    offsetX: gradientOffsetX.value * width,
    offsetY: gradientOffsetY.value * height,
    gradientTransform: [rotateCos, rotateSin, -1 * rotateSin, rotateCos, 0, 0],
  });
  gradient.gradientRotate = gradientRotate.value;

  updateBackground({ fill: gradient, opacity: gradientOpacity.value });
};
</script>

<style lang="scss" scoped>
.background-content {
  padding: 0.75rem;
}

/* Color Grid */
.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.color-picker-item {
  grid-column: span 1;
}

.color-swatch {
  border-radius: 8px;
  width: 100%;
  aspect-ratio: 1/1;
  cursor: pointer;
  border: 1px solid #eee;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.custom-color {
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .color-icon {
    opacity: 0.6;
  }
}

/* Gradient Styles */
.gradient-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.gradient-item {
  position: relative;
  border-radius: 8px;
  aspect-ratio: 1/1;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
  }

  &.selected {
    border-color: #22319e;
    box-shadow: 0 2px 8px rgba(34, 49, 158, 0.2);
  }
}

.controls-section {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 10px;
}

.control-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.control-label {
  width: 80px;
  font-size: 13px;
  color: #555;
}

.control-value {
  width: 45px;
  text-align: right;
  font-size: 13px;
  color: #555;
}

.flex-1 {
  flex: 1;
}

.gradient-colors-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
}

.gradient-color-box {
  width: 100%;
}

.color-button {
  height: 36px;
  border-radius: 8px;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: var(--el-color-primary);
    transform: translateY(-1px);
  }
}

/* Images Grid */
.images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

.image-item {
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16/9;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

/* Upload Area */
.upload-area {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 2px dashed #ddd;
  transition: all 0.3s ease;
  aspect-ratio: 16/9;

  &:hover {
    border-color: #22319e;
  }
}

.upload-content {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #666;
  font-size: 14px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

/* Slider customization */
:deep(.el-slider__runway) {
  margin: 11px 0;
}

:deep(.el-slider__button) {
  border-color: #22319e;
}

:deep(.el-slider__bar) {
  background-color: #22319e;
}

/* Select customization */
:deep(.el-select__wrapper) {
  border-radius: 8px !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .gradient-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .images-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
<style lang="scss" scoped>
.element-slider {
  @apply bg-gray-50 rounded-xl p-4;
}

.section {
  // margin-bottom: 16px;
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