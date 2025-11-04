<template>
  <div class="export-image-container">

    <div class="export-content">
      <!-- Format Selection -->
      <div class="export-section">
        <div class="section-header">
          <h3 class="section-title">Format</h3>
          <div class="section-divider"></div>
        </div>

        <el-radio-group class="format-options" v-model="format">
          <el-radio-button value="jpeg" label="jpeg">JPEG</el-radio-button>
          <el-radio-button value="png" label="png">PNG</el-radio-button>
          <el-radio-button value="WEBP" label="WEBP">WEBP</el-radio-button>
          <el-radio-button value="JPG" label="JPG">JPG</el-radio-button>
        </el-radio-group>
      </div>

      <!-- Resolution Selection -->
      <div class="export-section">
        <div class="section-header">
          <h3 class="section-title">Resolution</h3>
          <div class="section-divider"></div>
        </div>

        <el-radio-group class="resolution-options" v-model="dpiType">
          <el-radio-button :value="72" :label="72">72 DPI</el-radio-button>
          <el-radio-button :value="150" :label="150">150 DPI</el-radio-button>
          <el-radio-button :value="300" :label="300">300 DPI</el-radio-button>
        </el-radio-group>
      </div>

      <!-- Name Input -->
      <div class="export-section">
        <div class="section-header">
          <h3 class="section-title">File name</h3>
          <div class="section-divider"></div>
        </div>

        <div class="name-input">
          <input v-model="name" class="input-field" placeholder="Name" />
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons" :class="user?.role == 'user' ? 'single-action' : 'dual-action'">
      <el-button class="action-button download" type="primary" @click="downloaImage"
        v-loading.fullscreen.lock="Exporting">Download</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTemplatesStore, useFileStore, useWorkspaceStore, useStudioStore, useAuthStore, useTemplateStore } from '@/store'
import { ImageFormat } from 'fabric'
import { useRoute, useRouter } from 'vue-router'
import useCanvasExport from '@/hooks/useCanvasExport'
import { uploadFileToFilebase } from '@/utils/filebase'
import { ElLoading } from 'element-plus'
import Icon from '@/components/Icon.vue'

const emit = defineEmits<{
  (event: 'close'): void
}>()

const { templates } = storeToRefs(useTemplatesStore())
const { user } = storeToRefs(useAuthStore())
const { handleAddWorkspace, handleUpdateWorkspace } = useWorkspaceStore()
const { Exporting, exportSVG, getJSONData } = useCanvasExport()
const { isExportDialogVisible } = storeToRefs(useStudioStore())
const { getUser } = useAuthStore()
const { handleAddTemplate } = useTemplateStore()


const rangeType = ref<'all' | 'current' | 'custom'>('current')
const dpiType = ref<number>(300)
const range = ref<[number, number]>([1, templates.value.length])
const format = ref<ImageFormat>("png")
const quality = ref(1)
const ignoreWebfont = ref(false)
const ignoreClip = ref(true)
const name = ref('Designer')
const route = useRoute()
const router = useRouter()

const downloaImage = async () => {
debugger
  const loading = ElLoading.service({
    lock: true,
    text: 'In processing, please wait ...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  try {
    router.push('/home')
    await exportSVG({
      format: format.value,
      quality: quality.value,
      dpi: dpiType.value,
      filename: name.value,
      width: +route.query.width,
      height: +route.query.height,
    }, 'download')
    isExportDialogVisible.value = false
  } catch (error) {
    console.error(error)
  } finally {
    loading.close()
  }
  // exportImage(format.value, quality.value, dpiType.value, ignoreClip.value)
}
const addToTemplates = async () => {
  // useTemplatesStore()

  const loading = ElLoading.service({
    lock: true,
    text: 'In processing, please wait ...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  try {
    const file = await exportSVG({
      format: format.value,
      quality: 0.7,
      dpi: 72,
      filename: name.value
    }, 'get-link')
    const body = JSON.stringify({
      width: +route.query.width,
      height: +route.query.height,
      json_dict: JSON.stringify(await getJSONData()), // This is a string!
      title: name.value,
      image: file,
      category: "all",
    })
    const response = await handleAddTemplate(body)
    isExportDialogVisible.value = false
    await getUser()
    setTimeout(() => {
      router.push('/home')
    }, 200);
  } catch (error) {
    console.error(error)
  } finally {
    loading.close()
  }
  // exportImage(format.value, quality.value, dpiType.value, ignoreClip.value)
}
</script>

<style lang="scss" scoped>
.export-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.export-tabs {
  display: flex;
  padding: 10px 16px;
  border-bottom: 1px solid #eaeaea;

  .export-tab-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &.active {
      background-color: $themeColor;
      color: white;
    }

    span {
      font-weight: 500;
    }
  }
}

.export-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.export-section {
  margin-bottom: 24px;

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .section-title {
      font-size: 15px;
      font-weight: 600;
      margin: 0;
      margin-right: 12px;
      white-space: nowrap;
    }

    .section-divider {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.03) 100%);
    }
  }
}

.format-options,
.resolution-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }

  :deep(.el-radio-button__inner) {
    width: 100%;
    text-align: center;
    border-radius: 8px !important;
    border: 1px solid #dcdfe6;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.name-input {
  width: 100%;

  .input-field {
    width: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    height: 40px;
    padding: 0 12px;
    font-size: 14px;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: $themeColor;
      box-shadow: 0 0 0 2px rgba($themeColor, 0.2);
    }
  }
}

.action-buttons {
  display: grid;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #eaeaea;

  &.single-action {
    grid-template-columns: 1fr;
  }

  &.dual-action {
    grid-template-columns: 1fr 1fr;
  }

  .action-button {
    height: 44px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s;

    &.download {
      background-color: $themeColor;
      border-color: $themeColor;

      &:hover {
        background-color: darken($themeColor, 10%);
        border-color: darken($themeColor, 10%);
      }
    }

    &.add-template {
      background-color: #409eff;
      border-color: #409eff;

      &:hover {
        background-color: darken(#409eff, 10%);
        border-color: darken(#409eff, 10%);
      }
    }
  }
}

// Overriding element-plus styles
:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid #dcdfe6 !important;
}
</style>

<style>
.config-item .el-radio-button__inner {
  width: 100%;
}
</style>
