<template>
  <div class="canvas-design-panel"></div>
</template>

<script lang="ts" setup>
import { Image, Rect, Textbox, IText, Object as FabricObject, Group } from "fabric";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { ref, watch, onMounted, computed } from "vue";
import { mm2px, px2mm } from "@/utils/image";
import { ElementNames, RightStates, SupportEffects } from '@/types/elements'

import { useFabricStore, useMainStore, useTemplatesStore } from "@/store";
import useCanvas from "@/views/Canvas/useCanvas";
import Backgrounds from "../Backgrounds/index.vue";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import useCanvasScale from '@/hooks/useCanvasScale'
import { EffectItem } from "@/types/common";
import { nanoid } from "nanoid";


const mainStore = useMainStore();
const templatesStore = useTemplatesStore();
const fabricStore = useFabricStore();
const { addHistorySnapshot } = useHistorySnapshot();
const { canvasObject, rightState } = storeToRefs(mainStore);
const { currentTemplate } = storeToRefs(templatesStore);
const { clip, safe, zoom, opacity } = storeToRefs(fabricStore);
const { setCanvasSize, resetCanvas } = useCanvasScale();
const handleElement = computed(() => canvasObject.value as Image | IText | Group);

const handleReturn = () => {
  rightState.value = RightStates.ELEMENT_STYLE
}

const addStroke = () => {
  const strokeItem = {
    type: 0,
    id: nanoid(8),
    isFill: false,
    isStroke: false,
    isSkew: false,
    stroke: '#fff',
    strokeWidth: 1,
    strokeLineJoin: 'round' as CanvasLineJoin
  }
  if (!handleElement.value.effects) {
    handleElement.value.effects = [strokeItem]
  }
  else {
    handleElement.value.effects?.push(strokeItem)
  }
}

const subEffect = (key: string) => {
  handleElement.value.effects = handleElement.value.effects?.filter(item => item.id !== key)
  updateElement()
}

const addShadow = () => {

  const strokeItem = {
    type: 1,
    id: nanoid(8),
    isFill: false,
    isStroke: false,
    isSkew: false,
    stroke: '#fff',
    strokeWidth: 1,
    strokeLineJoin: 'round' as CanvasLineJoin
  }
  if (!handleElement.value.effects) {
    handleElement.value.effects = [strokeItem]
  }
  else {
    handleElement.value.effects?.push(strokeItem)
  }
}

const updateFill = (color: string) => {
  handleElement.value.fill = color
}

const updateStroke = (color: string, key: string) => {
  handleElement.value.effects?.filter(item => item.id === key).map(ele => ele.stroke = color)
  updateElement()
}

const updateStrokeWidth = () => {
  updateElement()
}

const updateElement = () => {

  if (!handleElement.value.effects) return
  const elementType = handleElement.value.type.toLowerCase()
  if (!SupportEffects.includes(elementType)) return

  if (elementType === ElementNames.GROUP || elementType === ElementNames.ACTIVE) {
    const groupObject = handleElement.value as Group
    groupObject._objects.forEach(item => {
      if (SupportEffects.includes(item.type.toLowerCase())) {
        const element = item as IText
        element.set({ effects: handleElement.value.effects })
        element.renderEffects()
      }
    })
  }
  else {
    (handleElement.value as IText | Image).renderEffects()
  }
  console.log(handleElement.value);
}

const updateStrokeLineJoin = (item: any) => {
  const { strokeLineJoin } = item
  if (!item) return
  item.set({ strokeLineJoin })
}
const handle = () => {
  console.log(handleElement.value);
}
</script>

<style lang="scss" scoped>
.row-info {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;

  .el-col {
    display: flex;
    align-items: center;
  }

  .info-handler {
    justify-content: end;
  }
}

.row-effect {
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;

  .effect-handler {
    justify-content: end;

    .el-col {
      justify-content: center;
      align-items: center;
    }
  }

  .effect-layer {
    display: flex;
    align-items: center;

    .layer-icon {
      font-size: 12px;
    }

    .icon-size {
      font-size: 14px;
    }
  }

  .effect-style {
    margin-top: 10px;
    justify-content: space-between;

    .style-row {
      justify-content: end;

      .el-col {
        .color-btn {
          margin-left: 1px;
        }
      }
    }

    .color-btn {
      width: 99%;
    }
  }
}

.handler-item {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 2px;
  border-radius: $borderRadius;
  font-size: 16px;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    background: #f1f1f1;

    .icon-down {
      margin-top: 3px;
    }
  }
}
</style>

<style lang="scss" scoped>
:deep(.effect-style .el-input .el-input__wrapper) {
  padding: 1px 1;
  margin-right: 1px;
}

:deep(.effect-style .el-input .el-input__inner) {
  text-align: left;
}

:deep(.effect-style .el-select .el-select__wrapper) {
  padding: 0 15px;
  @apply rounded-xl
}

:deep(.effect-style .el-select .el-select__placeholder) {
  width: 200%;
}

:deep(.style-row .el-input-number) {
  width: 60px;
}

:deep(.style-row .el-input-number span) {
  width: 12px;
  border-right: 1px solid var(--el-border-color);
}
</style>
<style>
.el-input__wrapper {
  min-width: 50px;
  padding: unset 10px !important;
  padding-right: 0 !important;
  border-bottom-left-radius: 15px;
  border-top-left-radius: 15px;
}
</style>