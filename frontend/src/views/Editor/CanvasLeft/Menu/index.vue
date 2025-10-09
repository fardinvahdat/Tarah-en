<template>
  <div class="">
    <div class="menu-content rounded-r-xl md:block hidden fardin"
      :class="!poolShow ? 'md:menu-close md:!left-[-400px] md:bottom-auto bottom-[5000px]' : 'md:left-[0] md:bottom-auto md:top-0 top-[-200px]'">
      <!-- :class="{ 'md:menu-close md:!right-[-400px] ': poolShow !== true }" -->
      <component :is="currentComponent" class="menu-pool p-2 !overflow-x-hidden overflow-y-auto"></component>
      <div class="layout-toggle justify-center" @click="leftToggle" v-show="currentComponent">
        <Icon name="arrow-left-2" v-if="poolShow" />
        <Icon name="arrow-right" v-else />
      </div>
    </div>
    <div class="md:hidden">
      <el-drawer class="md:hidden" v-model="poolShow" @close="poolShow = false" direction="btt" size="40%">
        <component :is="currentComponent" class="menu-pool p-2"></component>
      </el-drawer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useMainStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import EditorPool from './components/EditorPool.vue'
import TemplatePool from './components/TemplatePool.vue'
import MaterialPool from './components/MaterialPool.vue'
// import ExportPool from './components/ExportPool.vue'
import ImagePool from './components/ImagePool.vue'
import ToolkitPool from './components/ToolkitPool.vue'
import ChatgptPool from './components/ChatgptPool.vue'
import LayerPool from './components/LayerPool.vue'
import CodePool from './components/CodePool.vue'
import Background from '../../CanvasRight/Backgrounds'

const mainStore = useMainStore()
const { lastHelp, lastEdit, poolType, poolShow } = storeToRefs(mainStore)

const leftMap = {
  'editor': EditorPool,
  'template': TemplatePool,
  'material': MaterialPool,
  // 'export': ExportPool,
  'image': ImagePool,
  'illustration': ImagePool,
  'code': CodePool,
  'toolkit': ToolkitPool,
  'layer': LayerPool,
  'chatgpt': ChatgptPool,
  'help': null,
  'background': Background
}
const currentComponent = computed(() => {

  if (poolType.value === 'help') return leftMap[lastHelp.value]
  // if (poolType.value === 'editor') return leftMap[lastEdit.value]
  return leftMap[poolType.value] || null
})



const leftToggle = () => {
  // if (poolType.value === 'editor' && !poolShow.value) return
  poolShow.value = !poolShow.value
}

</script>

<style lang="scss">
.menu-content {
  position: absolute;
  width: 300px;
  right: 0;
  // top: 86px;
  // bottom: 10px;
  z-index: 1;
  background: #fff;
  border-left: 1px solid $borderColor;
  border-bottom: 1px solid $borderColor;
  transition: left 0.5s linear, right 0.5s linear;

  @media (max-width:450px) {
    width: 100%;
  }
}

@media only screen and (max-width: 900px) {
  .menu-content {
    width: 100%;
    right: 0;
  }
}

.menu-pool {
  width: 300px;
  height: calc(100vh - 100px);
  transition: right .3s linear;
  border-bottom: 1px solid $borderColor;

  @media (max-width:550px) {
    width: 100%;
    height: auto;
    border-bottom: 0px;
  }
}

.menu-close {
  top: calc(50% + 40px);
  transform: translateY(-50%);
  position: absolute;
}

.layout-toggle {
  background: $themeColor;
  cursor: pointer;
  height: 88px;
  position: absolute;
  right: -17px;
  top: 50%;
  transform: translateY(-50%);
  transition: left .1s linear;
  width: 16px;
  z-index: 1;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  display: flex;
  align-items: center;
  border-top: 1px solid $borderColor;
  border-bottom: 1px solid $borderColor;
  border-right: 1px solid $borderColor;

  @media (max-width:550px) {
    top: -50px;
    left: 50%;
    z-index: 999;
    transform: rotate(90deg);

    .toggle-icon {
      transform: rotate(180deg)
    }
  }
}


.toggle-icon {
  color: #fff;
}
</style>