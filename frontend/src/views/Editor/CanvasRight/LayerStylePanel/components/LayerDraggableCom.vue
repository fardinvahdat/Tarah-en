<template>
  <div class="layer-content">
    <div class="element-content !h-20 !px-4"
      :class="handleElement && handleElement.id === element.id ? 'layer-active' : ''"
      @click.stop="selectElement(element.id)" @mousemove.stop="mouseoverElement(element.id)"
      @mouseleave.stop="mouseleaveElement(element.id)">
      <div class="element-info">
        <!-- Visibility Toggle -->
        <Icon name="eye" class="common-icon text-xl" v-if="element.visible"
          @click.stop="visibleElement(element.id, false)" />
        <Icon name="eye-close" class="common-icon text-xl" v-else @click.stop="visibleElement(element.id, true)" />

      </div>

      <div>
        <img :src="elementPreview" alt="Layer Preview" class="max-h-16 h-auto"
          v-if="props.element.type !== 'textbox'" />
        <span v-else :style="`font-family:${props.element.fontFamily}`">{{ props.element.text }}</span>
      </div>

      <div class="element-handler">
        <!-- Lock/Unlock Toggle -->
        <el-tooltip placement="top" :hide-after="0"
          :content="element.lockMovementX && element.lockMovementY ? 'Unlock unlock' : 'To lock'">
          <Icon name="lock" class="common-icon" v-if="element.lockMovementX && element.lockMovementY"
            @click.stop="lockElement(element.id, false)" />
          <Icon name="unlock" class="common-icon" v-else @click.stop="lockElement(element.id, true)" />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType, ref, onMounted, watch } from 'vue'
import { CanvasElement, TextboxElement, ImageElement } from '@/types/canvas'
import { ElementNames } from '@/types/elements'
import { useMainStore, useTemplatesStore } from '@/store'
import { storeToRefs } from 'pinia'
import { Group, Object as FabricObject, Image, Canvas } from 'fabric'
import useHandleElement from "@/hooks/useHandleElement"
import FontFaceObserver from 'fontfaceobserver'
import { debounce } from 'lodash-es'

const {
  selectElement,
  visibleElement,
  lockElement,
  deleteElement,
  showElement,
  mouseoverElement,
  mouseleaveElement,
  checkElement,
  maskElement,
} = useHandleElement()

const props = defineProps({
  element: {
    type: Object as PropType<FabricObject>,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  }
})

const emits = defineEmits(['layer-changed']);

const mainStore = useMainStore()
const templatesStore = useTemplatesStore()
const { canvasObject, handleElementId } = storeToRefs(mainStore)
const { currentTemplate } = storeToRefs(templatesStore)
const handleElement = computed(() => canvasObject.value as FabricObject)

const elementPreview = ref<string | null>(null)
const previewCache = new Map();

/**
 * Load a font using FontFaceObserver.
 */
const loadFont = async (fontFamily: string) => {
  const font = new FontFaceObserver(fontFamily);
  await font.load();
};

/**
 * Generate a preview image for the element.
 */
const generatePreview = async (element: FabricObject) => {
  // Clone the object
  const clonedElement = await element.clone();

  // If the element is a textbox, ensure its font is loaded
  if (clonedElement.type === 'textbox' || clonedElement.type === 'text') {
    const fontFamily = clonedElement.fontFamily;
    if (fontFamily) {
      await loadFont(fontFamily);
    }
  }

  // Create a temporary canvas
  const canvas = new Canvas(null);
  canvas.set('backgroundColor', '#fff');
  canvas.set('width', clonedElement.width * clonedElement.scaleX);
  canvas.set('height', clonedElement.height * clonedElement.scaleY);

  // Center the object on the canvas
  clonedElement.set({
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 2,
    originX: 'center',
    originY: 'center',
  });

  // Add the cloned object to the canvas
  canvas.add(clonedElement);

  // Render the canvas explicitly
  canvas.renderAll();

  // Add a small delay to ensure text is rendered
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Render again
  canvas.renderAll();

  // Generate the preview image
  const preview = await canvas.toDataURL({
    format: 'png',
    multiplier: 0.5, // Adjust the multiplier for image quality/size
    enableRetinaScaling: true, // Ensure high-quality rendering
  });

  // Dispose of the temporary canvas
  canvas.dispose();

  return preview;
};

// Generate preview with debounce to improve performance
const generatePreviewDebounced = debounce(async () => {
  if (props.element && props.element.id) {
    if (previewCache.has(props.element.id)) {
      // Use cached preview
      elementPreview.value = previewCache.get(props.element.id);
    } else {
      // Generate and cache the preview
      const preview = await generatePreview(props.element);
      previewCache.set(props.element.id, preview);
      elementPreview.value = preview;
    }
  }
}, 100);

// Watch for changes in the element to update preview
watch(() => props.element, () => {
  generatePreviewDebounced();
}, { deep: true });

onMounted(() => {
  generatePreviewDebounced();
});

// Handle click on an element in the layer list
const handleElementClick = (eid: string) => {
  handleElementId.value = eid;
  selectElement(eid);

  // Emit layer changed event for parent components
  emits('layer-changed', eid);
}
</script>

<style lang="scss" scoped>
.layer-content {
  .element-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 5px 2px;
    border: 1px solid $borderColor;
    border-radius: 15px;
    margin-bottom: 5px;

    .element-info {
      display: flex;
      align-items: center;
    }

    .element-handler {
      display: flex;
    }

    &:not(.group-btn):hover {
      border: 1px solid $themeColor;
    }
  }

  .layer-active {
    border: 1px solid $themeColor;
  }
}

.element-preview {
  width: 30px;
  height: 30px;
  margin-right: 10px;
  border: 1px solid $borderColor;
  border-radius: 5px;
}

.common-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $borderRadius;

  &:not(.group-btn):hover {
    background-color: #f1f1f1;
  }
}
</style>
