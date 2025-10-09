
<template>
  <div class="element-position">

    <div class="layer-section">
      <h3 class="section-title">Layout</h3>
      <div class="layer-grid !grid-cols-2 gap-4">
        <el-tooltip placement="top" :hide-after="0" content="بالاترین">
          <button class="flex items-center !justify-between py-2 !px-1 layer-btn !w-full !h-max layer-item"
            @click="layerElement(LayerCommand.TOP)">
            <p class="text-[10px] pr-1">
              Highest layer
            </p>
            <Icon name="front" class="h-7 w-7" />
          </button>
        </el-tooltip>
        <el-tooltip placement="top" :hide-after="0" content="پایین ترین">
          <button class="flex items-center !justify-between py-2 !px-1 layer-btn !w-full !h-max layer-item"
            @click="layerElement(LayerCommand.BOTTOM)">
            <p class="text-[10px] pr-1">
              The lowest layer
            </p>
            <Icon name="bottom" class="h-7 w-7" />
          </button>
        </el-tooltip>
        <el-tooltip placement="top" :hide-after="0" content="پایین">
          <button class="flex items-center !justify-between py-2 !px-1 layer-btn !w-full !h-max layer-item"
            @click="layerElement(LayerCommand.DOWN)">
            <p class="text-[10px] pr-1">
              The lower layer
            </p>
            <Icon name="backward" class="h-7 w-7" />
          </button>
        </el-tooltip>
        <el-tooltip placement="top" :hide-after="0" content="بالا">
          <button class="flex items-center !justify-between py-2 !px-1 layer-btn !w-full !h-max layer-item"
            @click="layerElement(LayerCommand.UP)">
            <p class="text-[10px] pr-1">
              Higher layer
            </p>
            <Icon name="forward" class="h-7 w-7" />
          </button>
        </el-tooltip>
      </div>
    </div>

    <div class="alignment-section mt-4">
      <h3 class="section-title">Balance</h3>
      <div class="alignment-grid !grid-cols-3">
        <el-tooltip placement="top" :hide-after="0" content="Left">
          <div class="align-item" @click="alignElement(AlignCommand.LEFT)">
            <Icon name="align-left" />
          </div>
        </el-tooltip>
        <el-tooltip placement="top" :hide-after="0" content="Vertical center">
          <div class="align-item" @click="alignElement(AlignCommand.VERTICAL)">
            <Icon name="horizontal-center" />
          </div>
        </el-tooltip>
        <el-tooltip placement="top" :hide-after="0" content="Right balance">
          <div class="align-item" @click="alignElement(AlignCommand.RIGHT)">
            <Icon name="align-right" />
          </div>
        </el-tooltip>
        <el-tooltip placement="top" :hide-after="0" content="High balance">
          <div class="align-item" @click="alignElement(AlignCommand.TOP)">
            <Icon name="align-top" />
          </div>
        </el-tooltip>
        <el-tooltip placement="top" :hide-after="0" content="Horizontal Center">
          <div class="align-item" @click="alignElement(AlignCommand.HORIZONTAL)">
            <Icon name="vertical-center" />
          </div>
        </el-tooltip>
        <el-tooltip placement="top" :hide-after="0" content="Low level">
          <div class="align-item" @click="alignElement(AlignCommand.BOTTOM)">
            <Icon name="align-bottom" />
          </div>
        </el-tooltip>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { AlignCommand, LayerCommand } from "@/types/elements";
import { useMainStore, useTemplatesStore } from "@/store";
import useCanvas from "@/views/Canvas/useCanvas";
import useHandleTool from "@/hooks/useHandleTool";
import useHandleActive from "@/hooks/useHandleActive";
import Icon from '@/components/Icon.vue'

const templatesStore = useTemplatesStore();
const { alignElement, layerElement } = useHandleTool();
const [canvas] = useCanvas();
const { canvasObject } = storeToRefs(useMainStore());
const { handleActive } = useHandleActive();
const left = handleActive("left");
const top = handleActive("top");
const height = handleActive("height");
const width = handleActive("width");
const angle = computed(() => handleActive("angle") || 0);
const isFixed = ref(false);

const changeFixedRatio = (status: boolean) => {
  isFixed.value = status;
};

// Modify rotation 45 degrees (clockwise or counterclockwise)
const changeRotate45 = (command: "+" | "-") => {
  const [canvas] = useCanvas();
  if (!canvasObject.value || !canvas) return;
  let _rotate = Math.floor(canvasObject.value.angle / 45) * 45;
  if (command === "+") _rotate = _rotate + 45;
  else if (command === "-") _rotate = _rotate - 45;
  if (_rotate < -180) _rotate = -180;
  if (_rotate > 180) _rotate = 180;
  templatesStore.modifedElement(canvasObject.value, { angle: _rotate });
};
</script>

<style lang="scss" scoped>
.element-position {
  @apply bg-gray-50 rounded-xl p-4;
}

.section-title {
  @apply text-sm font-medium text-gray-700 mb-2;
}

.alignment-grid {
  @apply grid grid-cols-6 gap-2;
}

.layer-grid {
  @apply grid grid-cols-4 gap-2;
}

.align-item, .layer-item, .rotation-button {
  @apply h-10 flex justify-center items-center cursor-pointer rounded-xl bg-white transition-all duration-200;

  &:hover {
    @apply bg-blue-50 text-primary-default transform -translate-y-1 shadow-sm;
  }
}

.rotation-controls {
  @apply flex items-center gap-2;
}

.rotation-button {
  @apply flex-1;
}

.angle-display {
  @apply flex justify-center items-center h-10 bg-gray-50 rounded-xl px-4 font-medium text-gray-700;
  width: 60px;
}
</style>
