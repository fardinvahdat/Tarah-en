<template>
  <div class="element-mask">
    <div class="panel-header">
      <div class="panel-title">
        <Icon name="image" class="panel-icon" />
        <span>Mask</span>
      </div>
      <el-switch v-model="openColorMask" @change="toggleColorMask" class="panel-switch"></el-switch>
    </div>

    <div v-if="openColorMask" class="panel-content">
      <div class="control-row">
        <div class="control-label">Mask color</div>
        <el-popover trigger="click" width="265">
          <template #reference>
            <button :style="`background:${maskColor}`" class="color-preview-button">
              <Icon name="pallete" />
            </button>
          </template>
          <ColorPicker :modelValue="maskColor" @update:modelValue="(color: string) => updateMaskColor(color)" />
        </el-popover>
      </div>

      <div class="control-slider">
        <div class="control-slider-header">
          <span>Transparency</span>
          <span class="control-slider-value">{{ maskAlpha.toFixed(2) }}</span>
        </div>
        <el-slider class="slider" v-model="maskAlpha" :min="0" :max="1" :step="0.01" @change="updateMaskAlpha" />
      </div>

      <div class="blend-mode-selector">
        <div class="selector-label">Combined mode</div>
        <div class="blend-modes">
          <div v-for="mode in blendModes" :key="mode.value" class="blend-mode"
            :class="{ 'active': maskMode === mode.value }" @click="selectBlendMode(mode.value)">
            {{ mode.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useMainStore } from "@/store";
import { ImageElement } from "@/types/canvas";
import { ElementNames } from "@/types/elements";
import { filters, Image } from "fabric";
import useCanvas from "@/views/Canvas/useCanvas";

const BlendColorFilter = "BlendColor";
const maskColor = ref("");
const maskMode = ref('add')
const maskAlpha = ref(0.3);
const [canvas] = useCanvas();
const { canvasObject } = storeToRefs(useMainStore());

const blendModes = [
  { value: 'add', label: 'Add' },
  { value: 'difference', label: 'Difference' },
  { value: 'subtract', label: 'Cutting' },
  { value: 'multiply', label: 'to hit' },
  { value: 'screen', label: 'Page' },
  { value: 'lighten', label: 'Bright' },
  { value: 'darken', label: 'Dark' },
  { value: 'overlay', label: 'Covering' },
  { value: 'exclusion', label: 'Deprivation' },
  { value: 'tint', label: 'Color' }
];

const handleElement = computed(() => canvasObject.value as Image);
const hasColorMask = computed(() => {
  if (!handleElement.value || handleElement.value.type !== ElementNames.IMAGE) return false;
  const blendColorFilter = handleElement.value.filters.filter((obj) => obj.type === BlendColorFilter)[0] as filters.BlendColor;
  if (blendColorFilter) {
    maskColor.value = blendColorFilter.color;
    maskAlpha.value = blendColorFilter.alpha;
    maskMode.value = blendColorFilter.mode;
    return true;
  }
  return false;
});
const openColorMask = ref(hasColorMask.value);

const updateMaskColor = (color: string) => {
  maskColor.value = color;
  changeImageFilter();
};

const updateMaskAlpha = () => {
  changeImageFilter();
};

const selectBlendMode = (mode: string) => {
  maskMode.value = mode;
  changeImageFilter();
};

const changeImageFilter = () => {
  const blendFilter = new filters.BlendColor({
    color: maskColor.value,
    mode: maskMode.value,
    alpha: maskAlpha.value,
  });
  handleElement.value.filters = handleElement.value.filters.filter((obj) => obj.type !== BlendColorFilter);
  handleElement.value.filters.push(blendFilter as filters.BaseFilter);
  handleElement.value.applyFilters();
  canvas.renderAll();
};

const toggleColorMask = () => {
  if (!handleElement.value) return;
  const [canvas] = useCanvas();
  if (openColorMask.value) {
    const blendColorFilter = handleElement.value.filters.filter(
      (obj) => obj.type === BlendColorFilter
    )[0];
    if (!blendColorFilter) {
      const blendFilter = new filters.BlendColor({
        color: maskColor.value || '#3366ff',
        mode: "add",
        alpha: maskAlpha.value,
      });
      handleElement.value.filters.push(blendFilter as filters.BaseFilter);
      handleElement.value.applyFilters();
    }
  } else {
    handleElement.value.filters = handleElement.value.filters.filter(
      (obj) => obj.type !== BlendColorFilter
    );
    handleElement.value.applyFilters();
  }
  canvas.renderAll();
};
</script>

<style lang="scss" scoped>
.element-mask {
  @apply bg-gray-50 rounded-xl p-4;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid transparent;
}

.panel-content {
  @apply bg-white p-4 rounded-xl;
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

.control-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 10px;
}

.control-label {
  width: 70px;
  font-size: 13px;
  color: #555;
}

.control-slider {
  margin-bottom: 16px;
}

.control-slider-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #555;
  margin-bottom: 8px;
}

.control-slider-value {
  min-width: 40px;
  padding: 2px 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
  color: #666;
}

.blend-mode-selector {
  .selector-label {
    font-size: 13px;
    color: #555;
    margin-bottom: 8px;
  }

  .blend-modes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .blend-mode {
    padding: 8px;
    background-color: #f0f0f0;
    border-radius: 6px;
    text-align: center;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #e0e0e0;
    }

    &.active {
      background-color: #22319e;
      color: white;
    }
  }
}

.color-preview-button {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
