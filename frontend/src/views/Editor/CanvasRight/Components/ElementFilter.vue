<template>
  <div class="element-filter">
    <!-- Filter Categories - Modern Design -->
    <div class="filter-categories mb-4">
      <div v-for="(label, category) in filterCategories" :key="category" class="filter-category"
        :class="{ 'active': activeTab === category }" @click="activeTab = category">
        {{ label }}
      </div>
    </div>

    <!-- Filter Content Container -->
    <div class="filter-content">
      <!-- Presets (Duotone & Effects) with Image Previews -->
      <div v-if="activeTab === FILTER_CATEGORIES.DUOTONE || activeTab === FILTER_CATEGORIES.EFFECTS"
        class="filter-presets">
        <div class="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4">
          <div v-for="(preset, key) in filteredPresets" :key="key" class="filter-preset-card"
            :class="{ 'is-active': elementFilters.includes(key) }" @click="togglePresetFilter(key)">
            <div class="filter-preview-container">
              <div class="filter-preview-image" :style="`background-image:url(${handleElement.originSrc
        ? handleElement.originSrc
        : handleElement.getSrc()
        })`" :class="preset.previewClass"></div>
            </div>
            <div class="filter-preset-label">{{ preset.label }}</div>
          </div>
        </div>

        <!-- Grayscale Options for Duotone -->
        <div v-if="activeTab === FILTER_CATEGORIES.DUOTONE" class="mt-4 bg-gray-50 rounded-xl p-4">
          <div class="text-sm font-medium mb-2">Gray scale</div>
          <div class="grayscale-options">
            <div v-for="(label, mode) in GRAYSCALE_MODES" :key="mode" class="grayscale-option"
              :class="{ 'active': elementGrayscale === mode }" @click="changeGrayscaleMode(mode)">
              {{ label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Adjustment Sliders -->
      <div v-if="activeTab === FILTER_CATEGORIES.ADJUSTMENTS" class="adjustment-sliders bg-gray-50 rounded-xl p-4">
        <div v-for="(filter, key) in adjustmentFilters" :key="key" class="filter-control mb-4">
          <div class="flex justify-between mb-1">
            <span class="filter-label">{{ filter.label }}</span>
            <span class="filter-value">{{ getFilterValue(key) }}</span>
          </div>
          <el-slider :model-value="getFilterValue(key)" :min="filter.min" :max="filter.max" :step="filter.step"
            @update:model-value="value => changeColorMode(key, value)" class="custom-slider">
          </el-slider>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useMainStore } from "@/store";
import { filters, Image } from "fabric";
import { ImageElement } from "@/types/canvas";
import { ElementNames } from "@/types/elements";
import { SharpenMatrix, EmbossMatrix, GrayscaleType } from "@/configs/images";
import { FILTER_CATEGORIES, FILTERS_MAP, FILTER_PRESETS, GRAYSCALE_MODES } from "@/utils/filters/constants";
import useCanvas from "@/views/Canvas/useCanvas";

const [canvas] = useCanvas();
const { canvasObject } = storeToRefs(useMainStore());
const handleElement = computed(() => canvasObject.value as Image);

// Filter UI state
const activeTab = ref(FILTER_CATEGORIES.ADJUSTMENTS);
const elementGrayscale = ref<string>('');
const elementFilters = ref<string[]>([]);

// Filter values
const brightness = ref(0);
const contrast = ref(0);
const saturation = ref(0);
const vibrance = ref(0);
const hue = ref(0);
const noise = ref(0);
const pixelate = ref(0);
const blur = ref(0);

// Filter categories labels
const filterCategories = {
  [FILTER_CATEGORIES.ADJUSTMENTS]: 'Settings',
  [FILTER_CATEGORIES.EFFECTS]: 'Effects',
  [FILTER_CATEGORIES.DUOTONE]: 'Filters'
};

// Get filtered presets based on active tab
const filteredPresets = computed(() => {
  return Object.entries(FILTER_PRESETS)
    .filter(([_, preset]) => preset.category === activeTab.value)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
});

// Get adjustment filters
const adjustmentFilters = computed(() => {
  return Object.entries(FILTERS_MAP)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
});

// Initialize values from canvas object
const initializeValues = () => {
  if (!handleElement.value) return;

  // Check if filters are present
  if (handleElement.value.filters) {
    // Initialize filters
    const imageFilters = [];
    handleElement.value.filters.forEach((item) => {
      if (item.type === "Convolute") {
        const itemMatrix = (item as filters.Convolute).matrix;
        if (itemMatrix.length === SharpenMatrix.length && itemMatrix.every((v, i) => v === SharpenMatrix[i])) {
          imageFilters.push("Sharpen");
        }
        if (itemMatrix.length === EmbossMatrix.length && itemMatrix.every((v, i) => v === EmbossMatrix[i])) {
          imageFilters.push("Emboss");
        }
      } else {
        if (!imageFilters.includes(item.type)) imageFilters.push(item.type);
      }
    });
    elementFilters.value = imageFilters;

    // Get filter values
    handleElement.value.filters.forEach(item => {
      if (item.type === "Brightness") brightness.value = (item as filters.Brightness).brightness;
      if (item.type === "Contrast") contrast.value = (item as filters.Contrast).contrast;
      if (item.type === "Saturation") saturation.value = (item as filters.Saturation).saturation;
      if (item.type === "Vibrance") vibrance.value = (item as filters.Vibrance).vibrance;
      if (item.type === "HueRotation") hue.value = (item as filters.HueRotation).rotation;
      if (item.type === "Blur") blur.value = (item as filters.Blur).blur;
      if (item.type === "Noise") noise.value = (item as filters.Noise).noise;
      if (item.type === "Pixelate") pixelate.value = (item as filters.Pixelate).blocksize;
    });

    // Initialize grayscale
    let grayscale = "";
    handleElement.value.filters.forEach((item) => {
      if (item.type === GrayscaleType) {
        grayscale = (item as filters.Grayscale).mode;
      }
    });
    elementGrayscale.value = grayscale;
  }
}

// Get UI value for a specific filter
const getFilterValue = (filterType: string) => {
  switch (filterType) {
    case 'Brightness': return brightness.value;
    case 'Contrast': return contrast.value;
    case 'Saturation': return saturation.value;
    case 'Vibrance': return vibrance.value;
    case 'Hue': return hue.value;
    case 'Noise': return noise.value;
    case 'Pixelate': return pixelate.value;
    case 'Blur': return blur.value;
    default: return 0;
  }
};

// Toggle preset filter
const togglePresetFilter = (filterName: string) => {
  if (!handleElement.value) return;
  if (!handleElement.value.filters) handleElement.value.filters = [];

  if (elementFilters.value.includes(filterName)) {
    elementFilters.value = elementFilters.value.filter(f => f !== filterName);
  } else {
    elementFilters.value.push(filterName);
  }
  changeFilters();
};

const hasFilter = computed(() => {
  if (!handleElement.value) return false;
  const elementType = handleElement.value.name
    ? handleElement.value.name
    : handleElement.value.type;
  if (elementType !== ElementNames.IMAGE) return false;
  const filters = handleElement.value.filters?.filter(
    (obj) => obj.type !== "BlendColor"
  );
  return filters && filters.length > 0;
});

// Initialize values when component is mounted
onMounted(() => {
  initializeValues();
});

// Watch for changes in the selected object
watch(() => handleElement.value, () => {
  initializeValues();
}, { deep: true });

// Image grayscale
const changeGrayscaleMode = (mode: string) => {
  if (!handleElement.value) return;
  if (!handleElement.value.filters) handleElement.value.filters = [];
  mode === elementGrayscale.value
    ? (elementGrayscale.value = "")
    : (elementGrayscale.value = mode);

  if (elementGrayscale.value) {
    handleElement.value.filters = handleElement.value.filters.filter(
      (obj) => obj.type !== GrayscaleType
    );
    handleElement.value.filters.push(
      new filters.Grayscale({
        mode: elementGrayscale.value,
      }) as filters.BaseFilter
    );
    elementFilters.value.push(GrayscaleType);
  } else {
    handleElement.value.filters = handleElement.value.filters.filter(
      (obj) => obj.type !== GrayscaleType
    );
    elementFilters.value = elementFilters.value.filter(
      (obj) => obj !== GrayscaleType
    );
  }
  handleElement.value.applyFilters();
  canvas.renderAll();
};

const changeFilters = () => {
  if (!handleElement.value) return;
  if (!handleElement.value.filters) handleElement.value.filters = [];

  // Add missing filters
  elementFilters.value.forEach((item) => {
    const itemFilter = handleElement.value.filters.filter(
      (obj) => obj.type === item
    )[0];
    if (!itemFilter) {
      if (item === "Invert") {
        handleElement.value.filters.push(
          new filters.Invert() as filters.BaseFilter
        );
      } else if (item === "Sepia") {
        // @ts-ignore
        handleElement.value.filters.push(new filters.Sepia());
      } else if (item === "BlackWhite") {
        // @ts-ignore
        handleElement.value.filters.push(new filters.BlackWhite());
      } else if (item === "Brownie") {
        // @ts-ignore
        handleElement.value.filters.push(new filters.Brownie());
      } else if (item === "Vintage") {
        // @ts-ignore
        handleElement.value.filters.push(new filters.Vintage());
      } else if (item === "Technicolor") {
        // @ts-ignore
        handleElement.value.filters.push(new filters.Technicolor());
      } else if (item === "Kodachrome") {
        // @ts-ignore
        handleElement.value.filters.push(new filters.Kodachrome());
      } else if (item === "Polaroid") {
        // @ts-ignore
        handleElement.value.filters.push(new filters.Polaroid());
      }
    }
  });

  // Remove unwanted filters
  handleElement.value.filters = handleElement.value.filters.filter((obj) =>
    elementFilters.value.includes(obj.type)
  );

  // Add special filters
  if (elementFilters.value.includes("Sharpen")) {
    handleElement.value.filters.push(
      new filters.Convolute({ matrix: SharpenMatrix }) as filters.BaseFilter
    );
  }
  if (elementFilters.value.includes("Emboss")) {
    handleElement.value.filters.push(
      new filters.Convolute({ matrix: EmbossMatrix }) as filters.BaseFilter
    );
  }
  handleElement.value.applyFilters();
  canvas.renderAll();
};

// Change color mode
const changeColorMode = (type: string, value: number) => {
  if (!handleElement.value) return;
  if (!handleElement.value.filters) handleElement.value.filters = [];

  switch (type) {
    case "Brightness":
      brightness.value = value;
      handleElement.value.filters = handleElement.value.filters.filter((obj) => obj.type !== type);
      handleElement.value.filters.push(new filters.Brightness({ brightness: value }) as filters.BaseFilter);
      break;
    case "Contrast":
      contrast.value = value;
      handleElement.value.filters = handleElement.value.filters.filter((obj) => obj.type !== type);
      handleElement.value.filters.push(new filters.Contrast({ contrast: value }) as filters.BaseFilter);
      break;
    case "Saturation":
      saturation.value = value;
      handleElement.value.filters = handleElement.value.filters.filter((obj) => obj.type !== type);
      handleElement.value.filters.push(new filters.Saturation({ saturation: value }) as filters.BaseFilter);
      break;
    case "Vibrance":
      vibrance.value = value;
      handleElement.value.filters = handleElement.value.filters.filter((obj) => obj.type !== type);
      handleElement.value.filters.push(new filters.Vibrance({ vibrance: value }) as filters.BaseFilter);
      break;
    case "Hue":
      hue.value = value;
      handleElement.value.filters = handleElement.value.filters.filter((obj) => obj.type !== type);
      handleElement.value.filters.push(new filters.HueRotation({ rotation: value }) as filters.BaseFilter);
      break;
    case "Noise":
      noise.value = value;
      handleElement.value.filters = handleElement.value.filters.filter((obj) => obj.type !== type);
      handleElement.value.filters.push(new filters.Noise({ noise: value }) as filters.BaseFilter);
      break;
    case "Pixelate":
      pixelate.value = value;
      handleElement.value.filters = handleElement.value.filters.filter((obj) => obj.type !== type);
      handleElement.value.filters.push(new filters.Pixelate({ blocksize: value }) as filters.BaseFilter);
      break;
    case "Blur":
      blur.value = value;
      handleElement.value.filters = handleElement.value.filters.filter((obj) => obj.type !== type);
      handleElement.value.filters.push(new filters.Blur({ blur: value }) as filters.BaseFilter);
      break;
  }

  handleElement.value.applyFilters();
  canvas.renderAll();
};
</script>

<style lang="scss" scoped>
.element-filter {
  font-family: 'IRANSans', Arial, sans-serif;
  padding: 8px 0;
}

.filter-categories {
  display: flex;
  border-bottom: 1px solid #eee;

  .filter-category {
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease-in-out;
    flex: 1;
    text-align: center;
    color: #777;

    &:hover:not(.active) {
      color: $themeColor;
    }

    &.active {
      color: $themeColor;
      font-weight: 500;

      &:after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: $themeColor;
      }
    }
  }
}

.filter-content {
  padding: 12px 0;
}

.filter-preset-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #fff;
    transform: translateY(-3px);
  }

  &.is-active {
    background-color: rgba($themeColor, 0.1);
    transform: translateY(-3px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  }

  .filter-preview-container {
    width: 100%;
    padding-top: 100%;
    position: relative;
    margin-bottom: 6px;
    border-radius: 6px;
    overflow: hidden;
  }

  .filter-preview-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // background-image: url('/img/avatar.jpg');
    background-size: cover;
    background-position: center;
    border-radius: 6px;
  }

  .filter-preset-label {
    font-size: 12px;
    margin-top: 4px;
    text-align: center;
  }
}

.grayscale-options {
  display: flex;
  gap: 8px;
  margin-top: 8px;

  .grayscale-option {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    background-color: #eee;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(.active) {
      background-color: #fff;
      transform: translateY(-3px);
    }

    &.active {
      background-color: $themeColor;
      color: white;
    }
  }
}

.filter-control {
  margin-bottom: 16px;

  .filter-label {
    font-size: 14px;
    font-weight: 500;
  }

  .filter-value {
    font-size: 12px;
    opacity: 0.7;
  }
}

// Filter preview classes
:deep(.filter-sepia) {
  filter: sepia(100%);
}

:deep(.filter-bw) {
  filter: grayscale(100%);
}

:deep(.filter-invert) {
  filter: invert(100%);
}

:deep(.filter-vintage) {
  filter: sepia(30%) saturate(70%) hue-rotate(-10deg);
}

:deep(.filter-brownie) {
  filter: sepia(50%) saturate(140%) hue-rotate(-20deg) brightness(0.9);
}

:deep(.filter-kodachrome) {
  filter: contrast(110%) saturate(130%);
}

:deep(.filter-polaroid) {
  filter: sepia(20%) saturate(110%) brightness(110%);
}

:deep(.filter-sharpen) {
  filter: contrast(150%) brightness(100%);
}

:deep(.filter-emboss) {
  filter: contrast(120%) brightness(110%) grayscale(20%);
}

// Custom slider styling
:deep(.custom-slider) {
  .el-slider__bar {
    background-color: $themeColor;
  }

  .el-slider__button {
    border-color: $themeColor;
  }
}
</style>
