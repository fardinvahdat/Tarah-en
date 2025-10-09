<template>
  <div class="z-[40]">
    <button class="mr-auto cursor-pointer md:block hidden" @click="handleClose">
      <Icon name="close" class="cursor-pointer" />
    </button>

    <div class="right-bottom">
      <div class="right-content">
        <component :is="currentPanelComponent" :type="props.type" class=""></component>
      </div>
    </div>
    <!-- <FileExport v-model:visible="exportFileDialog" @close="exportFileHide" @save="exportFileHandle" /> -->
  </div>
</template>
<script lang="ts" setup>
import { computed, watch, defineEmits } from "vue";
import { RightStates, ElementNames } from "@/types/elements";
import { storeToRefs } from "pinia";
import { useMainStore } from "@/store/modules/main";
import Icon from '@/components/Icon.vue';
import CanvasStylePanel from "./CanvasStylePanel/index.vue";
import ElemnetStylePanel from "./ElementStylePanel/index.vue";
import EffectStylePanel from "./EffectStylePanel/index.vue";
import LayerStylePanel from "./LayerStylePanel/index.vue";

const emits = defineEmits(['close', 'open'])

const props = defineProps({
  type: {
    default: ''
  },
  visible: {
    default: false
  }
})


const mainStore = useMainStore();
const { canvasObject, rightState } = storeToRefs(mainStore);
const exportFileDialog = ref(false)


const exportFileHide = () => {
  exportFileDialog.value = false
}

const exportFileHandle = () => {
  exportFileDialog.value = false
}

const exportFile = () => {
  exportFileDialog.value = true
}

const canvasTabs = ref([
  { label: "Boom", value: RightStates.ELEMENT_CANVAS, id: "canvas" },
  { label: "Layer", value: RightStates.ELEMENT_LAYER, id: "layers" },
]);
const styleTabs = ref([
  { label: "Style", value: RightStates.ELEMENT_STYLE, id: "canvas" },
  { label: "Layer management", value: RightStates.ELEMENT_LAYER, id: "layers" },
]);

const setRightState = (value: RightStates) => {
  mainStore.setRightState(value);
};
const handleClose = () => {
  emits('close')

}

const currentTabs = computed(() => {
  if (!canvasObject.value) return canvasTabs.value;
  if (canvasObject.value.type.toLowerCase() === ElementNames.REFERENCELINE) return canvasTabs.value;
  return styleTabs.value;
});

watch(currentTabs, () => {
  const currentTabsValue: RightStates[] = currentTabs.value.map(
    (tab) => tab.value
  );
  if (!currentTabsValue.includes(rightState.value)) {
    mainStore.setRightState(currentTabsValue[0]);
  }
});

const currentPanelComponent = computed(() => {

  const panelMap = {
    [RightStates.ELEMENT_CANVAS]: CanvasStylePanel,
    [RightStates.ELEMENT_STYLE]: ElemnetStylePanel,
    [RightStates.ELEMENT_EFFECT]: EffectStylePanel,
    [RightStates.ELEMENT_LAYER]: LayerStylePanel,
  };
  return panelMap[rightState.value as RightStates.ELEMENT_STYLE];
});

onMounted(() => {
  handleTab()
})
const handleTab = () => {
  if (props.type == 'layers') {
    canvasTabs.value.filter((tab) => tab.id == 'layers')
    styleTabs.value.filter((tab) => tab.id == 'layers')
    setRightState('layer')
  } else if (props.type == 'background') {
    canvasTabs.value.filter((tab) => tab.id == 'canvas')
    styleTabs.value.filter((tab) => tab.id == 'canvas')
    setRightState('design')
  }
}
watch(() => props.type, (val) => {
  handleTab()
})
watch(() => props.visible, (val) => {
  handleTab()
  if (val == false && props.type == 'layers') {
    setRightState('design')
  }
})
</script>


<style lang="scss" scoped>
.right-top {
  height: 40px;
  width: 100%;
  display: flex;
  align-items: center;
  border-bottom: 1px solid $borderColor;
}

.right-bottom {
  height: calc(100% - 40px);
}

.right-tabs {
  height: 32px;
  font-size: 12px;
  flex-shrink: 0;
  display: flex;
  user-select: none;
}

.tab {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $lightGray;
  border-bottom: 1px solid $borderColor;
  cursor: pointer;

  &.active {
    background-color: #fff;
    border-bottom-color: $themeColor;
    border-bottom: 2px;
    color: $themeColor;
  }

  &+.tab {
    border-left: 1px solid $borderColor;
  }
}

.right-content {
  padding: 10px 5px 10px 10px;
  font-size: 13px;
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
  // @include overflow-overlay();
}
</style>
<style>
.el-drawer__header {
  margin-bottom: 0 !important;
}

.el-drawer__body {
  padding: 0 10px
}
</style>