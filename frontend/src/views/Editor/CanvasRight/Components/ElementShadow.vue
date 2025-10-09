
<template>
  <div class="element-shadow">
    <div class="panel-header">
      <div class="panel-title">
        <Icon name="shadow" class="panel-icon" />
        <span>Shadow</span>
      </div>
      <el-switch v-model="openShadow" @change="toggleShadow" class="panel-switch"></el-switch>
    </div>

    <div v-if="hasShadow" class="panel-content">
      <div class="control-slider">
        <div class="control-slider-header">
          <span>Horizontal shadow</span>
          <span class="control-slider-value">{{ offsetX }}</span>
        </div>
        <el-slider class="slider" v-model="offsetX" :min="1" :max="20" @change="changeOffsetX" />
      </div>

      <div class="control-slider">
        <div class="control-slider-header">
          <span>Vertical shade</span>
          <span class="control-slider-value">{{ offsetY }}</span>
        </div>
        <el-slider class="slider" v-model="offsetY" :min="1" :max="20" @change="changeOffsetY" />
      </div>

      <div class="control-slider">
        <div class="control-slider-header">
          <span>Fuzzy distance</span>
          <span class="control-slider-value">{{ blur }}</span>
        </div>
        <el-slider class="slider" v-model="blur" :min="1" :max="20" @change="changeBlur" />
      </div>

      <div class="control-color">
        <div class="control-color-label">Shadow color</div>
        <el-popover trigger="click" width="265">
          <template #reference>
            <div class="color-preview-button" :style="`background:${shadowColor}`">
              <Icon name="color-picker" class="color-pick-icon" />
            </div>
          </template>
          <ColorPicker :modelValue="shadowColor" @update:modelValue="(color: string) => updateShadowColor(color)" />
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useMainStore } from "@/store";
import * as fabric from "fabric";
import useCanvas from "@/views/Canvas/useCanvas";
import { CanvasElement } from "@/types/canvas";

const props = defineProps({
  hasShadow: {
    type: Boolean,
    required: true,
  },
});

const [canvas] = useCanvas();
const { canvasObject } = storeToRefs(useMainStore());

const offsetX = ref<number>(1);
const offsetY = ref<number>(1);
const blur = ref<number>(5);
const shadowColor = ref("#000000");

const handleElement = computed(() => canvasObject.value as CanvasElement);
const hasShadow = computed(() => {
  if (!handleElement.value) return false
  if (handleElement.value.shadow) {
    offsetX.value = (handleElement.value.shadow as fabric.Shadow).offsetX
    offsetY.value = (handleElement.value.shadow as fabric.Shadow).offsetY
    blur.value = (handleElement.value.shadow as fabric.Shadow).blur
    shadowColor.value = (handleElement.value.shadow as fabric.Shadow).color
    return true
  }
  return false
})
const openShadow = ref(false);

onMounted(() => {
  openShadow.value = hasShadow.value;
});

const updateShadowColor = (color: string) => {
  shadowColor.value = color;
  updateShadowElement();
};

const changeOffsetX = () => {
  updateShadowElement();
};

const changeOffsetY = () => {
  updateShadowElement();
};

const changeBlur = () => {
  updateShadowElement();
};

const updateShadowElement = () => {
  const [canvas] = useCanvas();
  if (!handleElement.value) return;
  handleElement.value.shadow = new fabric.Shadow({
    color: shadowColor.value,
    offsetX: offsetX.value,
    offsetY: offsetY.value,
    blur: blur.value,
  });
  canvas.renderAll();
};

const toggleShadow = () => {
  if (!handleElement.value) return;
  if (openShadow.value) {
    updateShadowElement();
  } else {
    handleElement.value.shadow = null;
  }
  canvas.renderAll();
};
</script>

<style lang="scss" scoped>
.element-shadow {
  @apply bg-gray-50 rounded-xl p-4;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid transparent;
}

.panel-content {
  @apply bg-white p-4 rounded-xl mt-3;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.panel-icon {
  color: #22319e;
}

.panel-switch {
  :deep(.el-switch__core) {
    border-radius: 100px;
  }

  :deep(.el-switch.is-checked .el-switch__core) {
    background-color: #22319e;
    border-color: #22319e;
  }
}

.control-slider {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.control-slider-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #555;
  margin-bottom: 8px;
}

.control-slider-value {
  min-width: 24px;
  padding: 2px 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
  color: #666;
}

.control-color {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-color-label {
  font-size: 13px;
  color: #555;
}

.color-preview-button {
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  }
}

.color-pick-icon {
  color: white;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
}
</style>
