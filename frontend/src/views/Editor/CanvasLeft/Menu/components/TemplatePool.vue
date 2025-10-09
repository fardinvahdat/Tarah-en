<template>
  <div class="">
    <div class="grid grid-cols-2 gap-2">
      <div v-for="(item, index) in templateItems" :key="item.id"
        class="flex flex-col gap-1 items-center rounded-md border h-fit p-1 glassy cursor-pointer">
        <img :src="item.image" :alt="item.title" @click="handleChangeTemplate(item)" class="rounded-md border" />
        <span class="text-xs">{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { TemplateItem } from '@/api/template/types'
import { useTemplateStore, useStudioStore, useSnapshotStore, useMainStore } from '@/store'
import { ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import useHandleTemplate from '@/hooks/useHandleTemplate'
import useCanvasScale from '@/hooks/useCanvasScale'
import useCanvas from "@/views/Canvas/useCanvas";
import { ElementNames } from "@/types/elements";
import { storeToRefs } from 'pinia'
import { deleteDiscardedDB } from '@/utils/database'

const { handleGetTemplates, handleGetTemplate } = useTemplateStore()
const { addTemplate } = useHandleTemplate()
const { resetCanvas } = useCanvasScale()
const studioStore = useStudioStore();
const snapshotStore = useSnapshotStore()
const mainStore = useMainStore();
const { isEditTextDialogVisible, stagedTextValue } = storeToRefs(studioStore);
const { canvasObject } = storeToRefs(mainStore);

const handleElement = computed(() => canvasObject.value);


const router = useRouter()
const route = useRoute()
const templateItems = ref<TemplateItem[]>([])

const handleChangeTemplate = (item: TemplateItem) => {
  ElMessageBox.confirm(
    'آيا از تغییر قالب مطمئن هستید؟',
    {
      confirmButtonText: 'بله',
      cancelButtonText: 'انصراف',
      type: 'warning',
    }
  )
    .then(async () => {
      router.replace({
        path: `/studio`,
        query: {
          width: route.query.width,
          height: route.query.height,
          templateID: item.id
        }
      })
      const response = await handleGetTemplate(item.id)
      await addTemplate(JSON.parse(response.json))
      await resetCanvas()
      const [canvas] = useCanvas();
      const objects = canvas.getObjects()
      objects.filter((obj) => obj.name == ElementNames.TEXTBOX || obj.name == ElementNames.ARCTEXT || obj.name == ElementNames.VERTICALTEXT).map((textBox) => {
        textBox.on("editing:entered", function () {
          isEditTextDialogVisible.value = true;
          stagedTextValue.value = handleElement.value.text;
        });
      })
      await deleteDiscardedDB()
      await snapshotStore.initSnapshotDatabase()
    })

}

const getTemplates = async (params: string) => {
  try {

    templateItems.value = await handleGetTemplates(params)
  } catch (error) {
    console.log(error)
  }
}
onMounted(async () => {
  await getTemplates(`?width=${route.query.width}&height=${route.query.width}`)
})
</script>

<style lang="scss" scoped>
:deep(.el-tabs__item) {
  padding: 0;
}

.layout-search {
  margin: 0 auto;
  width: 68%;
  padding: 20px 10px 10px;
}

.layout-tabs {
  width: 90%;
  margin: 0 auto;
}

.layout-templates {
  overflow: scroll;
  height: 100vh;
  flex-wrap: wrap;
  padding: 2px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 2px 0;
  padding-bottom: 20px;
  align-items: start;

  .thumbnail {
    padding: 2px 0;
  }

  .thumbnail img {
    outline: 1px solid $borderColor;
    width: 124px;
    margin: 0 5px;
    cursor: pointer;

    &:hover {
      outline-color: $themeColor;
    }
  }
}

.full-ratio {
  display: flex;
  flex: 1;

  .el-radio-button {
    width: 50%;
  }

  .el-radio-button__inner {
    width: 100%;
  }
}

:deep(.full-ratio .el-radio-button__inner) {
  width: 100%;
}
</style>
<style scoped>
.glassy {
  background: #e2ebfe50 !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}
</style>