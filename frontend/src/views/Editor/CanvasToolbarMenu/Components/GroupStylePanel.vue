<template>
  <div class="toolbar-menu group-toolbar">
    <div class="toolbar-items-wrapper">
      <!-- More Options Button -->
      <div class="toolbar-item" @click="emits('trigger', 'group')" title="More">
        <Icon name="toolbar-menu-more" />
      </div>

      <div class="divider"></div>

      <!-- Ungroup -->
      <div class="toolbar-item" v-if="activeObjectsCount == 1" @click="handleUngroup" title="Ungrouping">
        <Icon name="uncombine" />
      </div>
      <!-- Ungroup -->
      <div class="toolbar-item p-[2px]" v-if="activeObjectsCount > 1" @click="handleGroup" title="Grouping">
        <Icon name="combine" />
      </div>

      <div class="divider"></div>

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
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/store';
import useCanvas from '@/views/Canvas/useCanvas';
import useHandleElement from '@/hooks/useHandleElement';
import ElementOpacity from "../../CanvasRight/Components/ElementOpacity.vue";

const emits = defineEmits(['trigger']);

const mainStore = useMainStore();
const { canvasObject } = storeToRefs(mainStore);
const [canvas] = useCanvas();
const { combineElements, uncombineElements } = useHandleElement();

const handleElement = computed(() => canvasObject.value);
const windowWidth = ref(window.innerWidth);
const isMobileView = computed(() => windowWidth.value < 768);

// Function to update the window width
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

// Add event listener when component is mounted
onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
});

// Remove event listener when component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
});

const handleUngroup = () => {
  if (!handleElement.value) return;
  uncombineElements()
  getActiveObjectsLength()
};
const handleGroup = async () => {
  if (!handleElement.value) return;
  console.log(handleElement.value)
  if (handleElement.value.id == 'mask') {
    const masked_clone = handleElement.value._objects[1]
    await canvas.discardActiveObject();
    canvas.setActiveObject(masked_clone);
    canvas.requestRenderAll();
  } else {
    combineElements();
    getActiveObjectsLength()
  }
};

const bringToFront = () => {
  if (!handleElement.value) return;
  canvas.bringToFront(handleElement.value);
  canvas.renderAll();
};

const sendToBack = () => {
  if (!handleElement.value) return;
  canvas.sendToBack(handleElement.value);
  canvas.renderAll();
};
const activeObjectsCount = ref(0)
const getActiveObjectsLength = async () => {
  activeObjectsCount.value = canvas.getActiveObjects().length
}
getActiveObjectsLength()
</script>

<style lang="scss">
@import '@/assets/style/toolbar.scss';
</style>
