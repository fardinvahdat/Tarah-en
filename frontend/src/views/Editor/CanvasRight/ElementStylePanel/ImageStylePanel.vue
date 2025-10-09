<template>
  <div class="image-style-panel">
    <ElementPosition />
    <el-divider />

    <ImagePreviewPanel :handleElement="handleElement" @replace-image="replaceImage" @reset-image="resetImage" />

    <ImageActionCards :handleElement="handleElement" :createMaskElement="createMaskElement" @clip-image="clipImage" />

    <ImageEditTabs v-model:activeTab="activeTab" :hasShadow="hasShadow" />

    <ImageMatting :visible="dialogVisible"
      :image="handleElement.originSrc ? handleElement.originSrc : handleElement.getSrc()" @close="closeMatting" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useMainStore, useTemplatesStore, useSnapshotStore } from "@/store";
import { ImageElement } from "@/types/canvas";
import { getImageDataURL } from "@/utils/image";
import { propertiesToInclude } from "@/configs/canvas";
import { Image } from "fabric";
import useCanvas from "@/views/Canvas/useCanvas";
import useHandleCreate from '@/hooks/useHandleCreate'
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
import { SnapshotType } from '@/types/history';
import useHandleElement from "@/hooks/useHandleElement"
import ImagePreviewPanel from './Components/ImagePreviewPanel.vue'
import ImageActionCards from './Components/ImageActionCards.vue'
import ImageEditTabs from './Components/ImageEditTabs.vue'
import ElementPosition from '../Components/ElementPosition.vue'



const {
  createMaskElement,
  createImageElementForReplace
} = useHandleCreate();
const mainStore = useMainStore();
const templatesStore = useTemplatesStore();
const [canvas] = useCanvas();
const { canvasObject } = storeToRefs(mainStore);
const { addHistorySnapshot } = useHistorySnapshot();
const snapshotStore = useSnapshotStore();
const { deleteElement } = useHandleElement()
const handleElement = computed(() => canvasObject.value as Image);
const hasShadow = computed(() => (handleElement.value.shadow ? true : false));
const dialogVisible = ref(false);
const activeTab = ref('filter');


const clipImage = () => {
  if (!handleElement.value) return;
  handleElement.value.set({
    __isCropping: true,
    clipPath: undefined,
    cropPath: undefined,
  });
  canvas.renderAll();
};


const closeMatting = () => {
  dialogVisible.value = false;
};

const replaceImage = async (files: any) => {

  if (!handleElement.value) return;
  const imageFile = files[0];
  if (!imageFile) return;

  try {
    snapshotStore.startBatch();

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
      clipPath: handleElement.value.clipPath,
    };

    const dataURL = await getImageDataURL(imageFile);

    const deleteIndex = canvas.getObjects().indexOf(handleElement.value);

    const oldId = handleElement.value.id;
    await deleteElement(oldId);

    const newImage = await createImageElementForReplace(
      dataURL,
      oldObjectData.left,
      oldObjectData.top,
      oldObjectData.opacity,
      oldObjectData.angle,
      oldObjectData.effects,
      oldObjectData.clipPath,
      oldObjectData.id
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

const resetImage = () => {
  if (!handleElement.value) return;

  handleElement.value.filters = [];
  handleElement.value.applyFilters();
  // @ts-ignore
  const props = handleElement.value.toObject(propertiesToInclude) as ImageElement;
  templatesStore.updateElement({ id: props.id, props });

  addHistorySnapshot({
    type: SnapshotType.MODIFY,
    target: handleElement.value.toObject(propertiesToInclude),
    index: canvas._objects.indexOf(handleElement.value),
    action: 'resetImage'
  });

  canvas.renderAll();
};

const uploading = ref(false);
const uploadRef = ref<any>();

const handleMaskImage = async () => {
  if (!handleElement.value) return;

  console.log(handleElement.value);
  handleElement.value.absolutePositioned = true;
  const props = { absolutePositioned: true };
  await templatesStore.updateElement({ id: handleElement.value.id, props });
  console.log(handleElement.value);
}

import { ElMessage, genFileId, UploadInstance, UploadProps, UploadRawFile } from "element-plus"
const handleExceed: UploadProps["onExceed"] = (files: File[]) => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
};

const uploadHandle = async (option: any) => {
  const filename = option.file.name;
  const fileSuffix = filename.split(".").pop();
  await handleMaskImage();

  if (["jpg", "jpeg", "png", "webp"].includes(fileSuffix)) {
    const dataURL = await getImageDataURL(option.file);
    createMaskElement(dataURL, handleElement.value);
  }
};
</script>

<style lang="scss" scoped>
.image-style-panel {
  font-family: 'IRANSans', Arial, sans-serif;
  padding: 0 4px;
}
</style>
