
<template>
  <div class="action-cards !grid-cols-2">
    <!-- Upload Mask Card -->
    <div class="action-card">
      <el-upload ref="uploadRef" :on-exceed="handleExceed" action="http" 
        :http-request="uploadHandle" :limit="1" accept=".png" 
        v-loading="uploading" class="mask-upload">
        <div class="flex flex-col gap-">
          <div class="action-card-icon">
            <Icon name="upload" />
          </div>
          <div class="action-card-label">Upload mask</div>
        </div>
      </el-upload>
    </div>

    <!-- Clip Image Card -->
    <div class="action-card" @click="$emit('clipImage')">
      <div class="action-card-icon">
        <Icon name="cut-image" />
      </div>
      <div class="action-card-label">Cutting</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits } from 'vue'
import { Image } from 'fabric'
import { ElMessage, genFileId, UploadInstance, UploadProps, UploadRawFile } from "element-plus"
import { getImageDataURL } from "@/utils/image"

const props = defineProps<{
  handleElement: Image
  createMaskElement: Function
}>()

const emits = defineEmits<{
  clipImage: []
}>()

const uploading = ref(false)
const uploadRef = ref<any>()

const handleMaskImage = async () => {
  if (!props.handleElement) return
  
  props.handleElement.absolutePositioned = true
  const props_data = { absolutePositioned: true }
  // You'll need to pass templatesStore from parent
}

const handleExceed: UploadProps["onExceed"] = (files: File[]) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}

const uploadHandle = async (option: any) => {
  const filename = option.file.name
  const fileSuffix = filename.split(".").pop()
  await handleMaskImage()

  if (["jpg", "jpeg", "png", "webp"].includes(fileSuffix)) {
    const dataURL = await getImageDataURL(option.file)
    props.createMaskElement(dataURL, props.handleElement)
  }
}
</script>

<style lang="scss" scoped>
.action-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  .action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    border-radius: 12px;
    padding: 5px;
    cursor: pointer;
    transition: all 0.25s ease;
    border: 1px solid #eee;

    &:hover {
      background-color: #f0f0f0;
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    }

    .action-card-icon {
      font-size: 24px;
      margin-bottom: 2px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #22319e;
    }

    .action-card-label {
      font-size: 10px;
      text-align: center;
      font-weight: 500;
    }
  }

  .mask-upload {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}
</style>
