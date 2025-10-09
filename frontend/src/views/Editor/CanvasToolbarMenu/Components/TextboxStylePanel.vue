<template>
  <div class="toolbar-menu text-toolbar">
    <div class="toolbar-items-wrapper">
      <!-- More Options Button -->
      <div class="toolbar-item" @click="emits('trigger', 'textbox')" title="بیشتر">
        <Icon name="toolbar-menu-more" />
      </div>

      <div class="divider"></div>

      <!-- Font Family Selector -->
      <div class="toolbar-select">
        <el-select v-model="elementFontFamily" @change="handleElementFontFamily" placeholder="Font" size="small">
          <el-option-group v-for="group in fontOptionGroups" :key="group.label" :label="group.label">
            <el-option v-for="item in group.options" :key="item.value" :value="item.value" :label="item.label"
              :style="{ fontFamily: item.value }">
            </el-option>
          </el-option-group>
        </el-select>
      </div>

      <!-- Font Size -->
      <div class="toolbar-select font-size">
        <el-select v-model="handleElement.fontSize" filterable allow-create default-first-option
          :filterMethod="handleElementInputSize" @change="handleElementFontSize" placeholder="Size" size="small">
          <el-option v-for="item in FontSizeLibs" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </div>

      <div class="divider"
        v-if="!(handleElement?.name == ElementNames.ARCTEXT || handleElement?.name == ElementNames.VERTICALTEXT) ">
      </div>

      <!-- Text Alignment -->
      <div class="tool-group"
        v-if="!(handleElement?.name == ElementNames.ARCTEXT || handleElement?.name == ElementNames.VERTICALTEXT) ">
        <div class="tool-item" :class="{ 'active': textAlign === 'left' }" @click="handleTextAlign('left')"
          title="Left">
          <Icon name="toolbar-menu-left" />
        </div>
        <div class="tool-item" :class="{ 'active': textAlign === 'center' }" @click="handleTextAlign('center')"
          title="Center">
          <Icon name="toolbar-menu-center" />
        </div>
        <div class="tool-item" :class="{ 'active': textAlign === 'right' }" @click="handleTextAlign('right')"
          title="Right">
          <Icon name="toolbar-menu-right" />
        </div>
      </div>

      <div class="divider"></div>

      <!-- Text Formatting -->
      <div class="tool-group">
        <div class="tool-item" :class="{ 'active': handleElement.fontWeight === 'bold' }" @click="handleElementBlod"
          title="Bold">
          <Icon name="bold" />
        </div>
        <div class="tool-item" :class="{ 'active': handleElement.fontStyle === 'italic' }" @click="handleElementItalic"
          title="Cut">
          <Icon name="italic" />
        </div>
        <div class="tool-item" :class="{ 'active': handleElement.underline }" @click="handleElementUnderline"
          title="Underline">
          <Icon name="underline" />
        </div>
        <div class="tool-item" :class="{ 'active': handleElement.linethrough }" @click="handleElementLinethrough"
          title="Linethrough">
          <Icon name="strike-through" />
        </div>
      </div>

      <!-- Color Controls -->
      <div class="toolbar-item color-selector" title="Text color">
        <el-popover trigger="click" :width="265" ref="colorPopover" popper-class="toolbar-dropdown" @click.stop>
          <template #reference>
            <TextColorButton :color="handleElement.color">
              <Icon name="font-color" />
            </TextColorButton>
          </template>
          <ColorPicker :modelValue="handleElement.color" @update:modelValue="updateFontColor" />
        </el-popover>
      </div>

      <div class="toolbar-item color-selector" title="Background color">
        <el-popover trigger="click" :width="265" ref="bgPopover" popper-class="toolbar-dropdown" @click.stop>
          <template #reference>
            <TextColorButton :color="elementBackgrounColor">
              <Icon name="highlight" />
            </TextColorButton>
          </template>
          <ColorPicker :modelValue="elementBackgrounColor" @update:modelValue="updateBackgroundColor" />
        </el-popover>
      </div>

      <el-tooltip class="box-item" effect="dark" content="Effect" placement="top"
        v-if="!(handleElement?.name == ElementNames.ARCTEXT || handleElement?.name == ElementNames.VERTICALTEXT)">
        <div class="toolbar-item" @click="emits('trigger', 'textEffect')" title="Effect">
          <Icon name="toolbar-menu-effect" />
        </div>
      </el-tooltip>


      <li class="w-8 h-8 flex items-center justify-center">
        <el-tooltip class="box-item outline-none" effect="dark" content="Transparency" placement="top">
          <el-popover trigger="click" width="300px">
            <template #reference>
              <button class="pt-1">
                <Icon name="toolbar-menu-opacity" />
              </button>
            </template>
            <ElementOpacity />
          </el-popover>
        </el-tooltip>
      </li>



      <!-- Mobile view character spacing -->
      <div class="tool-group" v-if="false">
        <div class="tool-item" @click="handleElementCharSpacing('-')" title="کاهش فاصله حروف">
          <Icon name="indent-left" />
        </div>
        <div class="tool-item" @click="handleElementCharSpacing('+')" title="افزایش فاصله حروف">
          <Icon name="indent-right" />
        </div>
      </div>

      <!-- Simplified Opacity for mobile -->
      <div class="toolbar-item" title="شفافیت" v-if="false">
        <el-popover trigger="click" width="240" popper-class="toolbar-dropdown">
          <template #reference>
            <div class="item-wrapper">
              <Icon name="toolbar-menu-opacity" />
            </div>
          </template>
          <div class="adjustment-slider">
            <h3 class="slider-title">شفافیت</h3>
            <el-slider v-model="opacity" :min="0" :max="1" :step="0.01" @change="updateOpacity" />
          </div>
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { FontSizeLibs } from '@/configs/texts';
import Icon from '@/components/Icon.vue';
import { useMainStore, useTemplatesStore } from '@/store';
import useCanvas from '@/views/Canvas/useCanvas';
import { storeToRefs } from 'pinia';
import { ElementNames } from '@/types/elements';
import ElementOpacity from "../../CanvasRight/Components/ElementOpacity.vue";


const templatesStore = useTemplatesStore();
const mainStore = useMainStore();
const { canvasObject, systemFonts, onlineFonts } = storeToRefs(mainStore);
const windowWidth = ref(window.innerWidth);
const isMobileView = computed(() => windowWidth.value < 768);
const [canvas] = useCanvas();
const colorPopover = ref(null)
const bgPopover = ref(null)

const elementBackgrounColor = computed(() => {
  if (handleElement.value.type.toLowerCase() === ElementNames.ARCTEXT) {
    return handleElement.value.textBackgroundColor;
  }
  return handleElement.value.backgroundColor;
});

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

const handleElement = computed(() => canvasObject.value);
const elementFontFamily = ref(handleElement.value ? handleElement.value.fontFamily : '');

const emits = defineEmits(['trigger']);

// Text alignment
const textAlign = computed(() => handleElement.value.textAlign);

const fontOptionGroups = ref([
  {
    label: 'System fonts',
    options: systemFonts.value
  },
  {
    label: 'Online Fonts',
    options: onlineFonts.value
  }
]);

// Handle text alignment
const handleTextAlign = (alignment) => {
  if (!handleElement.value) return;

  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ textAlign: alignment });
  } else {
    templatesStore.modifedElement(handleElement.value, { textAlign: alignment });
  }
};

// Handle italic toggle
const handleElementItalic = () => {
  if (!handleElement.value) return;
  const fontStyle = handleElement.value.fontStyle === 'italic' ? 'normal' : 'italic';

  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ fontStyle });
  } else {
    templatesStore.modifedElement(handleElement.value, { fontStyle });
  }
};

// Handle bold toggle
const handleElementBlod = () => {
  if (!handleElement.value) return;
  const fontBold = 'bold', fontNormal = 'normal';

  if (handleElement.value.isEditing) {
    const blodState = handleElement.value.getSelectionStyles().find(item => item.fontWeight !== fontBold);
    if (!blodState || (JSON.stringify(blodState) === '{}' && handleElement.value.fontWeight === fontBold)) {
      handleElement.value.setSelectionStyles({ 'fontWeight': fontNormal });
    } else {
      handleElement.value.setSelectionStyles({ 'fontWeight': fontBold });
    }
  } else {
    const elementStyle = handleElement.value.styles;
    if (handleElement.value.fontWeight === fontBold) {
      templatesStore.modifedElement(handleElement.value, { fontWeight: fontNormal });
      for (let i in elementStyle) {
        for (let j in elementStyle[i]) {
          (elementStyle[i][j]).set({ fontWeight: fontNormal });
        }
      }
    } else {
      templatesStore.modifedElement(handleElement.value, { fontWeight: fontBold });
      for (let i in elementStyle) {
        for (let j in elementStyle[i]) {
          (elementStyle[i][j]).set({ fontWeight: fontBold });
        }
      }
    }
  }
};

// Handle underline toggle
const handleElementUnderline = () => {
  if (!handleElement.value) return;

  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ underline: !handleElement.value.underline });
  } else {
    templatesStore.modifedElement(handleElement.value, { underline: !handleElement.value.underline });
  }
};

// Handle strikethrough toggle
const handleElementLinethrough = () => {
  if (!handleElement.value) return;

  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ linethrough: !handleElement.value.linethrough });
  } else {
    templatesStore.modifedElement(handleElement.value, { linethrough: !handleElement.value.linethrough });
  }
};

// Update font color
const updateFontColor = (fill) => {
  if (!handleElement.value) return;

  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ fill });
  } else {
    templatesStore.modifedElement(handleElement.value, { fill, color: fill });
  }
  // Close the popover after selection
  if (colorPopover.value) {
    colorPopover.value.hide();
  }
};

// Update background color
const updateBackgroundColor = (backgroundColor) => {
  if (!handleElement.value) return;

  let changeData = { backgroundColor };
  if (handleElement.value.type.toLowerCase() === ElementNames.ARCTEXT) {
    changeData = { 'textBackgroundColor': backgroundColor };
  }

  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles(changeData);
  } else {
    templatesStore.modifedElement(handleElement.value, changeData);
  }

  // Close the popover after selection
  if (bgPopover.value) {
    bgPopover.value.hide();
  }
};

// Font size handling
const handleElementInputSize = (val) => {
  val = val.replace(/[^\d]/g, '');
  if (val) {
    templatesStore.modifedElement(handleElement.value, { fontSize: val });
  }
};

const handleElementFontSize = () => {
  const fontSize = handleElement.value.fontSize;
  if (!fontSize) return;

  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ fontSize });
  } else {
    templatesStore.modifedElement(handleElement.value, { fontSize });
  }
  canvas.renderAll();
};

// Font family handling
const handleElementFontFamily = (fontFamily) => {
  if (!handleElement.value) return;

  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ fontFamily });
  } else {
    templatesStore.modifedElement(handleElement.value, { fontFamily });
  }
  canvas.renderAll();
};

// Character spacing
const handleElementCharSpacing = (mode) => {
  if (!handleElement.value) return;

  const handleCharSpacing = handleElement.value.charSpacing;
  const charSpacing = mode === '+' ? handleCharSpacing + 10 : handleCharSpacing - 10;
  templatesStore.modifedElement(handleElement.value, { charSpacing });
};

// Opacity
const opacity = ref(canvasObject.value ? canvasObject.value.opacity : 1);

const updateOpacity = () => {
  if (!canvasObject.value) return;
  canvasObject.value.opacity = opacity.value;
  canvas.renderAll();
};

// New methods for expanded functionality
const handleDropShadow = () => {
  emits('trigger', 'shadow');
};

const handleOutline = () => {
  emits('trigger', 'outline');
};
</script>

<style lang="scss">
@import '@/assets/style/toolbar.scss';

:deep(.el-select) {
  width: 100%;
}

:deep(.el-input__wrapper) {
  padding: 0 8px;
}

:deep(.el-input__inner) {
  height: 36px;
}
</style>
