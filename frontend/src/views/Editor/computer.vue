<template>
  <div class="h-full" v-drop-image="{ url: 'UploadUrl', highlightStyle: { backgroundColor: 'lightblue' } }">
    <CanvasHeader :visible="isCanvasRightVisible" @update="isCanvasRightVisible = $event"
      @close="isCanvasRightVisible = false" :type="menuType" />
    <div class="layout-content flex md:flex-row flex-col-reverse w-full gap-0">
      <SideBar class="md:flex hidden h-[calc(100vh-100px)]" :visible="isCanvasRightVisible"
        @update="isCanvasRightVisible = $event" @close="isCanvasRightVisible = false" :type="menuType" />
      <div class="layout-content-center w-full h-[calc(100vh-110px)] relative">
        <CanvasToolbarMenu @trigger="handleTriggerToolbarMenu" class="!absolute z-10 top-0" />
        <CanvasCenter
          class="center-body md:max-h-[calc(100vh-110px)] md:min-h-[calc(100vh-190px)] min-h-[calc(100vh-85px)] h-full"
          :class="isLoading && 'invisible'" />
        <!-- <CanvasAffix class="center-affix" /> -->
        <CanvasICP />
      </div>
      <CanvasDom class="absolute -z-[200] -right-[300px]" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import CanvasLeft from "./CanvasLeft/index.vue";
import CanvasHeader from "./CanvasHeader/Header.vue";
import CanvasCenter from "./CanvasCenter/index.vue";
import CanvasFooter from "./CanvasFooter/index.vue";
import CanvasICP from "./CanvasICP/index.vue";
import CanvasAffix from "./CanvasAffix/index.vue";
import CanvasDom from "./CanvasDom/index.vue";
import CanvasToolbarMenu from "./CanvasToolbarMenu/index.vue";
import SideBar from "@/components/Base/SideBar.vue";

const props = defineProps({
  isLoading: {
    default: false
  }
})
const isCanvasRightVisible = ref(false)
const menuType = ref('')

const handleTriggerToolbarMenu = (e: string) => {
  menuType.value = e
  isCanvasRightVisible.value = true

}
</script>

<style lang="scss">
.layout-content {
  height: calc(100% - 40px);
}

.layout-content-center {
  // width: calc(100% - 50px - 160px - 260px);

  .center-header {
    // border-left: 1px solid $borderColor;
  }

  .center-body {
    height: 100%;
    // margin: 100px;
  }

  .center-footer {
    border-top: 1px solid $borderColor;
    background-color: $lightGray;
  }
}

.layout-content-right {
  // border-left: solid 1px $borderColor;
  height: inherit
}
</style>
