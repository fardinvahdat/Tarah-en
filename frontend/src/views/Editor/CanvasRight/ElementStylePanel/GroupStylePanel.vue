<template>
  <div class="multi-style-panel">
    <ElementPosition />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store'
import { FontSizeLibs, LineHeightLibs, CharSpaceLibs } from '@/configs/texts'
import { WEB_FONTS } from '@/configs/fonts'
import { ElementNames, FontGroupOption } from '@/types/elements'
import { CanvasElement, GroupElement, ImageElement, PathElement, TextboxElement } from '@/types/canvas'
import ElementPosition from '../Components/ElementPosition.vue'
import ElementEffects from '../Components/ElementEffects.vue'
import useCanvas from '@/views/Canvas/useCanvas'
// ویرایش عناصر ترکیبی
// http://jsfiddle.net/crandellws/1cad3e4o/
const [ canvas ] = useCanvas()
const { activeElementList, canvasObject, systemFonts } = storeToRefs(useMainStore())

const handleGroupElement = computed(() => canvasObject.value as GroupElement)
const handleTextboxElement = computed(() => {
  if (!handleGroupElement.value) return
  if (!handleGroupElement.value.objects) return
  const textboxElements = handleGroupElement.value._objects.filter(obj => obj.type === ElementNames.TEXTBOX)
  return textboxElements[0] as TextboxElement
})
const handleOutlineElement = computed(() => {
  if (!handleGroupElement.value) return
  if (!handleGroupElement.value._objects) return
  const outlineElements = handleGroupElement.value._objects.filter(obj => obj.type === ElementNames.IMAGE || obj.type === ElementNames.PATH)
  return outlineElements[0] as ImageElement | PathElement
})
const hasTextbox = computed(() => handleTextboxElement.value ? true : false)

const fillColor = ref('#fff')
const outlineColor = ref('#fff')
const fontColor = ref('#fff')
const backgroundColor = ref('#fff')

const outlineStyle = ref(0)
const outlineWidth = ref(0)

// watch(handleGroupElement, () => {
//   if (!handleGroupElement.value) return
//   if (handleTextboxElement.value) {
//     fontColor.value = handleTextboxElement.value.fill as string
//   }
//   if (handleOutlineElement.value && handleOutlineElement.value.stroke && handleOutlineElement.value.strokeWidth) {
//     outlineColor.value = handleOutlineElement.value.stroke as string
//     outlineWidth.value = handleOutlineElement.value.strokeWidth
//   }
// })
const computedFillColor = computed(() => {
  if (!handleGroupElement.value) return ''
})


const fontOptionGroups = ref<FontGroupOption[]>([
  {
    label: 'فونت سیستم',
    options: systemFonts.value
  },
  {
    label: 'فونت های آنلاین',
    options: WEB_FONTS
  }
])


// اندازه فونت را تغییر دهید
const handleElementFontsize = (mode: string) => {
  if (mode === '+') {
    handleGroupElement.value._objects.forEach(obj => {
      if (obj.type === ElementNames.TEXTBOX) {
        const textbox = obj as TextboxElement
        const fontSize = textbox.fontSize ? textbox.fontSize : 36
        textbox.set({fontSize: fontSize + 1})
      }
    })
  }
  else {
    handleGroupElement.value._objects.forEach(obj => {
      if (obj.type === ElementNames.TEXTBOX) {
        const textbox = obj as TextboxElement
        const fontSize = textbox.fontSize ? textbox.fontSize : 36
        textbox.set({fontSize: fontSize - 1})
      }
    })
  }
  canvas.renderAll()
}

// نسخه ی نمایشی پر را اصلاح کنید
const updateFillColor = (color: string) => {
  fillColor.value = color
  const setFill = (groupElement: GroupElement) => {
    groupElement._objects.forEach(obj => {
      const canvasElement = obj as CanvasElement
      if (canvasElement.type === ElementNames.GROUP) {
        setFill(canvasElement as GroupElement)
        return
      }
      canvasElement.fill = color
    })
  }
  setFill(handleGroupElement.value)
  canvas.renderAll()
}

// تغییر رنگ فونت
const updateFontColor = (color: string) => {
  fontColor.value = color
  handleGroupElement.value._objects.forEach(obj => {
    if (obj.type === ElementNames.TEXTBOX) {
      const textbox = obj as TextboxElement
      textbox.set({fill: color})
    }
  })
  canvas.renderAll()
}

// تغییر رنگ پس زمینه
const updateBackgroundColor = (color: string) => {
  backgroundColor.value = color
  handleGroupElement.value._objects.forEach(obj => {
    if (obj.type === ElementNames.TEXTBOX) {
      const textbox = obj as TextboxElement
      textbox.set({backgroundColor: color})
    }
  })
  canvas.renderAll()
}

// اندازه فونت را تغییر دهید
const changeFontSize = () => {
  if (!handleTextboxElement.value) return
  handleGroupElement.value._objects.forEach(obj => {
    if (obj.type === ElementNames.TEXTBOX) {
      const textbox = obj as TextboxElement
      textbox.set({fontSize: handleTextboxElement.value?.fontSize})
    }
  })
  canvas.renderAll()
}

// تغییر سبک فونت
const changeFontFamily = () => {
  if (!handleTextboxElement.value) return
  handleGroupElement.value._objects.forEach(obj => {
    if (obj.type === ElementNames.TEXTBOX) {
      const textbox = obj as TextboxElement
      textbox.set({fontFamily: handleTextboxElement.value?.fontFamily})
    }
  })
  canvas.renderAll()
}

// رنگ حاشیه را تغییر دهید
const updateOutlineColor = (color: string) => {
  outlineColor.value = color
  handleGroupElement.value._objects.forEach(obj => {
    if (obj.type === ElementNames.IMAGE || obj.type === ElementNames.PATH) {
      const element = obj as PathElement | ImageElement
      element.stroke = color
    }
  })
  canvas.renderAll()
}

// عرض حاشیه را تغییر دهید
const changeOutlineWidth = () => {
  handleGroupElement.value._objects.forEach(obj => {
    if (obj.type === ElementNames.IMAGE || obj.type === ElementNames.PATH) {
      const element = obj as PathElement | ImageElement
      element.strokeWidth = outlineWidth.value
    }
  })
  canvas.renderAll()
}

// تغییر سبک حاشیه
const changeOutlineStyle = () => {
  handleGroupElement.value._objects.forEach(obj => {
    if (obj.type === ElementNames.IMAGE || obj.type === ElementNames.PATH) {
      const element = obj as PathElement | ImageElement
      element.strokeWidth = outlineWidth.value
    }
  })
  canvas.renderAll()
}

// 
// const updateOutline = (outlineProps: Partial<PPTElementOutline>) => {

  // for (const el of activeElementList.value) {
  //   if (
  //     el.type === 'text' ||
  //     el.type === 'image' ||
  //     el.type === 'shape' ||
  //     el.type === 'table' ||
  //     el.type === 'chart'
  //   ) {
  //     const outline = el.outline || { width: 2, color: '#000', style: 'solid' }
  //     const props = { outline: { ...outline, ...outlineProps } }
  // }
  // outline.value = { ...outline.value, ...outlineProps }
// }
</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.font-size-btn {
  padding: 0;
}
.mt-10 {
  margin-top: 10px;
}
.full-group {
  display: flex;
  flex: 1;
  .el-button {
    width: 50%;
  }
}
.tooltip-popover {
  .el-button {
    width: 100%;
    border-radius: 0;
  }
  .font-color {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    border-right: 0;
  }
  .high-light {
    border-right: 0;
  }
}
.font-size {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.full-ratio {
  display: flex;
  flex: 1;
  .el-radio-button {
    position: relative;
    display: inline-flex;
    outline: 0;
    flex: 1;
  }
  .el-radio-button__inner {
    width: 100%
  }
}
</style>

<style scoped>
:deep(.full-ratio .el-radio-button__inner) {
  width: 100%;
}
:deep(.full-ratio .el-radio-button) {
  position: relative;
  display: inline-flex;
  outline: 0;
  flex: 1;
}
</style>