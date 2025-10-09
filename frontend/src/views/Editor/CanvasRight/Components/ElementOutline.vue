
<template>
  <div class="element-outline panel-section">
    <div class="panel-header">
      <div class="panel-title">
        <Icon name="circle-dashed" class="panel-icon" />
        <span>Outline</span>
      </div>
      <el-switch v-model="openOutline" @change="toggleOutline" class="panel-switch"></el-switch>
    </div>

    <div v-if="openOutline" class="panel-content mt-3">
      <!-- Outline Style -->
      <div class="control-row">
        <div class="control-label">Style</div>
        <div class="style-options">
          <div 
            class="style-option" 
            :class="{ active: outlineStyle === 0 }"
            @click="outlineStyle = 0; changeOutlineStyle()"
          >
            <Icon name="line-solid" />
            <span>Uniform</span>
          </div>
          <div 
            class="style-option" 
            :class="{ active: outlineStyle === 1 }"
            @click="outlineStyle = 1; changeOutlineStyle()"
          >
            <Icon name="line-dashed" />
            <span>Dashed</span>
          </div>
        </div>
      </div>

      <!-- Line Join Style -->
      <div class="control-row">
        <div class="control-label">Connection</div>
        <div class="join-style-options">
          <div 
            v-for="option in joinStyleOptions" 
            :key="option.value"
            class="join-style-option" 
            :class="{ active: handleElement.strokeLineJoin === option.value }"
            @click="updateStrokeLineJoin(option.value)"
          >
            <img :src="option.icon" :alt="option.label" class="join-style-icon" />
            <span class="join-style-label">{{ option.label }}</span>
          </div>
        </div>
      </div>

      <!-- Outline Color -->
      <div class="control-row">
        <div class="control-label">Color</div>
        <el-popover trigger="click" width="265">
          <template #reference>
            <div 
              class="color-preview-button control-input" 
              :style="{ backgroundColor: handleElement.stroke }"
            >
              <Icon name="color-picker" class="color-pick-icon" />
            </div>
          </template>
          <ColorPicker 
            :modelValue="handleElement.stroke" 
            @update:modelValue="updateOutlineColor" 
          />
        </el-popover>
      </div>

      <!-- Outline Width -->
      <div class="control-row">
        <div class="control-label">Thickness</div>
        <el-slider 
          class="control-input" 
          v-model="handleElement.strokeWidth" 
          :min="1" 
          :max="20" 
          @change="updateOutlineWidth"
        ></el-slider>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useMainStore, useTemplatesStore } from "@/store";
import { CanvasElement } from "@/types/canvas";
import useCanvas from "@/views/Canvas/useCanvas";

const templatesStore = useTemplatesStore();
const [canvas] = useCanvas();
const { canvasObject } = storeToRefs(useMainStore());

const outlineStyle = ref(0);
const handleElement = computed(() => canvasObject.value as CanvasElement);
const hasOutline = computed(() => {
  if (!handleElement.value) return false;
  return handleElement.value.stroke ? true : false;
});
const openOutline = ref(hasOutline.value);

// Line join style options with visualizations
const joinStyleOptions = [
  {
    value: 'bevel',
    label: 'اریب',
    icon: '/icons/bevel-join.svg'
  },
  {
    value: 'round',
    label: 'گرد',
    icon: '/icons/round-join.svg'
  },
  {
    value: 'miter',
    label: 'تیز',
    icon: '/icons/miter-join.svg'
  }
];

onMounted(() => {
  openOutline.value = hasOutline.value;

  // Set initial outline style based on dash array
  if (handleElement.value && handleElement.value.strokeDashArray) {
    outlineStyle.value = 1;
  } else {
    outlineStyle.value = 0;
  }
});

// Watch for changes to the element's stroke dash array
watch(() => handleElement.value?.strokeDashArray, (newVal) => {
  if (newVal) {
    outlineStyle.value = 1;
  } else {
    outlineStyle.value = 0;
  }
}, { deep: true });

const toggleOutline = () => {
  if (!handleElement.value) return;
  
  const stroke = openOutline.value ? (!handleElement.value.stroke ? '#555' : handleElement.value.stroke) : '';
  const strokeWidth = openOutline.value ? (!handleElement.value.strokeWidth ? 1 : handleElement.value.strokeWidth) : 0;
  const paintFirst = openOutline.value ? 'stroke' : 'fill';
  
  handleElement.value.set({ stroke, strokeWidth, paintFirst });
  templatesStore.modifedElement(handleElement.value, { stroke, strokeWidth, paintFirst });
  canvas.renderAll();
};

const changeOutlineStyle = () => {
  if (!handleElement.value) return;
  const strokeDashArray = outlineStyle.value === 1 ? [6, 6] : null;
  handleElement.value.set({ strokeDashArray });
  templatesStore.modifedElement(handleElement.value, { strokeDashArray });
  canvas.renderAll();
};

const updateOutlineColor = (color: string) => {
  if (!handleElement.value) return;
  handleElement.value.set({ stroke: color });
  templatesStore.modifedElement(handleElement.value, { stroke: color });
  canvas.renderAll();
};

const updateOutlineWidth = (width: number) => {
  if (!handleElement.value) return;
  handleElement.value.set({ strokeWidth: width });
  templatesStore.modifedElement(handleElement.value, { strokeWidth: width });
  canvas.renderAll();
};

const updateStrokeLineJoin = (strokeLineJoin: string) => {
  if (!handleElement.value) return;
  handleElement.value.set({ strokeLineJoin });
  templatesStore.modifedElement(handleElement.value, { strokeLineJoin });
  
  // Force update to apply changes
  const currentWidth = handleElement.value.strokeWidth;
  handleElement.value.set({ strokeWidth: currentWidth - 0.1 });
  handleElement.value.set({ strokeWidth: currentWidth });
  canvas.renderAll();
};
</script>

<style lang="scss" scoped>
.element-outline {
  @apply bg-gray-50 rounded-xl p-4;
}

.panel-header {
  @apply flex items-center justify-between;
}

.panel-title {
  @apply flex items-center gap-2 font-semibold text-gray-800;
}

.panel-icon {
  @apply text-primary-default;
}

.panel-content {
  @apply bg-white p-4 rounded-xl;
}

.control-row {
  @apply flex items-center mb-4 gap-3;

  &:last-child {
    @apply mb-0;
  }

    @apply flex-col items-start;

    .control-label {
      @apply mb-2 w-full;
    }
}

.control-label {
  @apply w-16 text-sm text-gray-600;
}

.control-input {
  @apply flex-1;
}

.style-options {
  @apply flex-1 grid grid-cols-2 gap-2;
}

.style-option {
  @apply flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-200
    cursor-pointer transition-all duration-200 hover:border-primary-default;

  &.active {
    @apply border-primary-default bg-blue-50;
  }
}

.join-style-options {
  @apply w-full grid grid-cols-3 gap-2;
}

.join-style-option {
  @apply flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-200
    cursor-pointer transition-all duration-200 hover:border-primary-default;

  &.active {
    @apply border-primary-default bg-blue-50;
  }
}

.join-style-icon {
  @apply w-8 h-8 mb-1;
}

.join-style-label {
  @apply text-xs text-gray-600;
}

.color-preview-button {
  @apply h-10 rounded-xl flex items-center justify-center cursor-pointer border border-gray-200
    transition-all duration-200 hover:shadow-md;
}

.color-pick-icon {
  @apply text-white drop-shadow-md;
}

:deep(.el-switch.is-checked .el-switch__core) {
  @apply bg-primary-default border-primary-default;
}

:deep(.el-slider__runway) {
  @apply my-2;
}

:deep(.el-slider__bar) {
  @apply bg-primary-default;
}

:deep(.el-slider__button) {
  @apply border-primary-default;
}
</style>
