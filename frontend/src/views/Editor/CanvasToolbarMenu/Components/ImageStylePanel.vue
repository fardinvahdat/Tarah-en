<template>
  <div class="toolbar-menu image-toolbar">
    <div class="toolbar-items-wrapper">
      <!-- More Options Button -->
      <div class="toolbar-item" @click="emits('trigger', 'image')" title="More">
        <Icon name="toolbar-menu-more" />
      </div>

      <div class="divider"></div>

      <!-- Remove Background -->
      <div class="toolbar-item" title="Remove background"
        :class="{ 'processing': isRemoveBgLoading, 'disabled': !isModelReady }" @click="handleGetImage">
        <Icon name="toolbar-menu-transparency" v-if="!isRemoveBgLoading" />
        <div v-else class="h-5 w-5">
          <el-progress type="dashboard" :key="removeBgState.completed" :percentage="removeBgState.completed"
            :show-text="false" :color="colors" :width="20" />
        </div>
      </div>

      <!-- Replace Image -->
      <div class="toolbar-item" title="Picture of the image">
        <FileInput class="file-input" @change="(files) => replaceImage(files)">
          <Icon name="switch" />
        </FileInput>
      </div>

      <!-- Mask Image  -->
      <div class="toolbar-item" title="Mask">
        <FileInput class="file-input" @change="(files) => uploadHandle(files)">
          <Icon name="mask" />
        </FileInput>
      </div>

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

      <!-- Rounded Corners -->
      <div class="toolbar-item" title="Round corners">
        <el-popover trigger="click" width="300px" popper-class="toolbar-dropdown">
          <template #reference>
            <div class="item-wrapper">
              <Icon name="border-radius" />
            </div>
          </template>

          <div class="element-opacity">
            <div class="section">
              <div class="flex justify-between">
                <div class="section-header">Radius of the corner</div>
                <div class="slider-value">{{ borderRadius }}PX</div>
              </div>
              <div class="slider-row">
                <el-slider class="slider" v-model="borderRadius" :min="0" :max="200" :step="1"
                  @change="handleBorderRadiusChange" />
              </div>
            </div>
          </div>
        </el-popover>
      </div>

      <!-- Clip Image -->
      <div class="toolbar-item" title="Cut and shape">
        <el-popover ref="clipPopoverRef" trigger="click" width="284"
          popper-class="clip-popover-container toolbar-dropdown">
          <template #reference>
            <div class="item-wrapper">
              <Icon name="cut-image" />
            </div>
          </template>
          <div class="pop-menu-container">
            <h3 class="menu-title">Figure</h3>
            <div class="shape-grid">
              <div v-for="(item, key) in CLIPPATHS" :key="key" class="shape-item" @click="presetImageClip(key)">
                <div class="shape-preview" :style="{ clipPath: item.style }"></div>
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
import { useMainStore, useSnapshotStore } from "@/store";
import { storeToRefs } from "pinia";
import { getImageDataURL, dataURLtoBlob } from "@/utils/image";
import useCanvas from "@/views/Canvas/useCanvas";
import useHandleCreate from '@/hooks/useHandleCreate'
import useHandleElement from "@/hooks/useHandleElement"
import { ElementNames } from "@/types/elements";
import { CLIPPATHS } from "@/configs/images";
import ElementOpacity from "../../CanvasRight/Components/ElementOpacity.vue";
import { SnapshotType } from '@/types/history';
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import { Rect } from 'fabric'
import { removeBackground } from '@imgly/background-removal';
import { preload } from '@imgly/background-removal';

const emits = defineEmits(['trigger'])

const mainStore = useMainStore();
const { addHistorySnapshot } = useHistorySnapshot();
const snapshotStore = useSnapshotStore();
const {
  createMaskElement, createImageElementForReplace } = useHandleCreate();
const { deleteElement } = useHandleElement()
const [canvas] = useCanvas();

const { canvasObject } = storeToRefs(mainStore);
const handleElement = computed(() => canvasObject.value);
const windowWidth = ref(window.innerWidth);
const clipPopoverRef = ref(null);

// Model readiness and loading states
const isModelReady = ref(false);
const modelPreloadError = ref(null);


const colors = [
  { color: '#f56c6c', percentage: 0 },
  { color: '#e6a23c', percentage: 25 },
  { color: '#5cb87a', percentage: 50 },
  { color: '#1989fa', percentage: 75 },
  { color: '#6f7ad3', percentage: 100 },
]

const removeBgState = ref({
  total: 0,
  completed: 0
})


// Optimized config with caching and performance settings
const config = {
  model: 'isnet_quint8', // Optimized smaller model
  // publicPath: '/models/resources.json', // Cache models in public directory
  debug: false, // Disable debug for production
  device: 'cpu', // Use CPU for better compatibility
  progress: (key, current, total) => {

    if (total == 4) {
      removeBgState.value.completed = current * 25
    }
  }
};


// Rounded corners state
const borderRadius = ref(0);

// Function to update the window width
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

// Add event listener when component is mounted
onMounted(() => {

  window.addEventListener('resize', updateWindowWidth);
  // Initialize border radius from current element
  if (handleElement.value && handleElement.value.clipPath?.rx) {
    borderRadius.value = handleElement.value.clipPath.rx;
  }

});

preload(config).then(() => {
  console.log("Asset preloading succeeded")
  
})
// Remove event listener when component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
});

const isRemoveBgLoading = ref(false);



// Main background removal function
const handleGetImage = async () => {

  if (!handleElement.value) return;

  isRemoveBgLoading.value = true;

  try {
    const file = dataURLtoBlob(handleElement.value.getSrc());

    const result = await removeBackground(file, config);
    replaceImage([result]);

  } catch (error) {
    console.error('Background removal error:', error);
    // Handle error gracefully - maybe show a toast notification
  } finally {
    isRemoveBgLoading.value = false;
  }
}

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

// Handle border radius change
const handleBorderRadiusChange = (value) => {
  if (!handleElement.value) return;

  const oldRadius = handleElement.value.rx || 0;

  // handleElement.value.set({
  //   rx: value,
  //   ry: value
  // });

  handleElement.value.set({
    clipPath: new Rect({
      width: handleElement.value.width,
      height: handleElement.value.height,
      rx: borderRadius.value,
      ry: borderRadius.value,
      left: -handleElement.value.width / 2,
      top: -handleElement.value.height / 2
    })
  });

  // Record this change in history
  addHistorySnapshot({
    type: SnapshotType.PROPERTY,
    index: canvas.getObjects().indexOf(handleElement.value),
    target: handleElement.value.toObject(),
    property: 'borderRadius',
    oldValue: oldRadius,
    newValue: value,
  });

  canvas.renderAll();
};

// Replace image (keep current style)
const replaceImageWithLink = async (links) => {
  if (!handleElement.value) return;
  const dataURL = links[0];
  if (!dataURL) return;
  try {
    // Start a batch operation for undo/redo history
    snapshotStore.startBatch();

    // Save the current object attributes before replacing
    const oldObjectData = {
      id: handleElement.value.id,
      width: handleElement.value.width,
      height: handleElement.value.height,
      scaleX: handleElement.value.scaleX,
      scaleY: handleElement.value.scaleY,
      left: handleElement.value.left,
      top: handleElement.value.top,
      opacity: handleElement.value.opacity,
      angle: handleElement.value.angle,
      effects: handleElement.value.effects,
      flipX: handleElement.value.flipX,
      flipY: handleElement.value.flipY,
      cropX: handleElement.value.cropX,
      cropY: handleElement.value.cropY,
    };

    // Record delete action for history
    const deleteIndex = canvas.getObjects().indexOf(handleElement.value);

    // Delete the old image
    const oldId = handleElement.value.id;
    await deleteElement(oldId);

    // Create a new image with the same dimensions and attributes
    const newImage = await createImageElementForReplace(
      dataURL,
      oldObjectData.left,
      oldObjectData.top,
      oldObjectData.opacity,
      oldObjectData.angle,
      oldObjectData.effects
    );
    handleElement.value.scaleX = ((oldObjectData.width * oldObjectData.scaleX) / handleElement.value.width)
    handleElement.value.scaleY = ((oldObjectData.height * oldObjectData.scaleY) / handleElement.value.height)
    const obj = { ...handleElement.value }
    await canvas.discardActiveObject()
    await canvas.renderAll();
    await canvas.setActiveObject(canvas.getObjects().filter((o) => o.id == obj.id)[0])
    await canvas.renderAll();
    snapshotStore.endBatch();
  } catch (error) {
    console.error('Error replacing image:', error);
  }
};
// Replace image (keep current style)
const replaceImage = async (files) => {
  if (!handleElement.value) return;
  const imageFile = files[0];
  if (!imageFile) return;

  try {
    // Start a batch operation for undo/redo history
    snapshotStore.startBatch();

    // Save the current object attributes before replacing
    const oldObjectData = {
      id: handleElement.value.id,
      width: handleElement.value.width,
      height: handleElement.value.height,
      scaleX: handleElement.value.scaleX,
      scaleY: handleElement.value.scaleY,
      left: handleElement.value.left,
      top: handleElement.value.top,
      opacity: handleElement.value.opacity,
      angle: handleElement.value.angle,
      effects: handleElement.value.effects,
      flipX: handleElement.value.flipX,
      flipY: handleElement.value.flipY,
      cropX: handleElement.value.cropX,
      cropY: handleElement.value.cropY,
    };

    // Get the data URL of the new image
    const dataURL = await getImageDataURL(imageFile);

    // Record delete action for history
    const deleteIndex = canvas.getObjects().indexOf(handleElement.value);

    // Delete the old image
    const oldId = handleElement.value.id;
    await deleteElement(oldId);

    // Create a new image with the same dimensions and attributes
    const newImage = await createImageElementForReplace(
      dataURL,
      oldObjectData.left,
      oldObjectData.top,
      oldObjectData.opacity,
      oldObjectData.angle,
      oldObjectData.effects
    );
    handleElement.value.scaleX = ((oldObjectData.width * oldObjectData.scaleX) / handleElement.value.width)
    handleElement.value.scaleY = ((oldObjectData.height * oldObjectData.scaleY) / handleElement.value.height)
    const obj = { ...handleElement.value }
    await canvas.discardActiveObject()
    await canvas.renderAll();
    await canvas.setActiveObject(canvas.getObjects().filter((o) => o.id == obj.id)[0])
    await canvas.renderAll();
    snapshotStore.endBatch();
  } catch (error) {
    console.error('Error replacing image:', error);
  }
};

const handleChangeElementFlip = (value) => {
  if (!handleElement.value) return;
  const handleType = handleElement.value.type;
  if (handleType === ElementNames.IMAGE || handleType === ElementNames.PATH) {
    const oldFlipX = handleElement.value.flipX;
    const oldFlipY = handleElement.value.flipY;

    value.includes("flipX") && (handleElement.value.flipX = !oldFlipX);
    value.includes("flipY") && (handleElement.value.flipY = !oldFlipY);

    // Record this change in history
    addHistorySnapshot({
      type: SnapshotType.PROPERTY,
      index: canvas.getObjects().indexOf(handleElement.value),
      target: handleElement.value.toObject(),
      property: value,
      oldValue: value.includes("flipX") ? oldFlipX : oldFlipY,
      newValue: value.includes("flipX") ? handleElement.value.flipX : handleElement.value.flipY,
    });

    canvas.renderAll();
  }
};

const presetImageClip = async (key) => {
  if (!handleElement.value) return;

  // Record old clip state for history
  const oldClipState = handleElement.value._cropKey;

  // Set new clip state
  handleElement.value.set({ __isCropping: true, _cropKey: key });

  // Record this change in history
  addHistorySnapshot({
    type: SnapshotType.PROPERTY,
    index: canvas.getObjects().indexOf(handleElement.value),
    target: handleElement.value.toObject(),
    property: 'clipPath',
    oldValue: oldClipState,
    newValue: key,
  });

  // Close the popover after selection
  if (clipPopoverRef.value) {
    clipPopoverRef.value.hide();
  }
  canvas.renderAll();
};
</script>

<style lang="scss">
@import '@/assets/style/toolbar.scss';

.shape-preview {
  width: 36px;
  height: 36px;
  background-color: $themeColor;
  opacity: 0.8;
  transition: all 0.2s;
}

.shape-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;

  .shape-item {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      background-color: #f5f5f5;
      transform: scale(1.05);
    }
  }
}

.file-input {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-indicator {
  position: relative;
  top: -2px;
}

.pop-menu-container {
  padding: 16px;

  .menu-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;
    color: #333;
    text-align: center;
  }
}

.rounded-corners-panel {
  padding: 16px;

  .panel-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;
    color: #333;
    text-align: center;
  }

  .radius-slider {
    margin-bottom: 8px;
  }

  .radius-value {
    text-align: center;
    font-size: 12px;
    color: #666;
  }
}
</style>
