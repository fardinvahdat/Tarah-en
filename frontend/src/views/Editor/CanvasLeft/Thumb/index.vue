<template>
  <div @mousedown="() => setThumbnailsFocus(true)" v-click-outside="() => setThumbnailsFocus(false)"
    v-contextmenu="contextMenusThumbnails">
    <el-row class="thumb-handle items-center">
      <el-col :span="12" class="flex justify-center text-[16px]">
        <div>
          <el-button text ref="menuRef">Document</el-button>
          <HomePopover :menu-ref="menuRef" :menu-popover-ref="menuPopoverRef" />
        </div>
      </el-col>
    </el-row>
    <Draggable class="thumb-content" :modelValue="templates" :animation="300" :scroll="true" :scrollSensitivity="50"
      :setData="null" @end="handleDragEnd" itemKey="id">
      <template #item="{ element, index }">
        <div :class="{
            'thumbnail-item': true,
            'active': templateIndex === index,
            'selected': selectedTemplatesIndex.includes(index),
          }" @mousedown="($event: MouseEvent) => handleClickTemplateThumbnail($event, index)"
          v-contextmenu="contextmenusThumbnailItem">
          <div class="label" :class="{ 'offset-left': index >= 99 }">{{ fillDigit(index + 1, 2) }}</div>
          <!-- <ThumbnailTemplate class="thumbnail" :template="element" :size="120" :visible="index < templatesLoadLimit" /> -->
        </div>
      </template>
    </Draggable>

    <div class="thumb-number">Page {{ templateIndex + 1 }} / {{ templates.length }}</div>
  </div>
</template>

<script lang="ts" setup>
import useLoadTemplates from '@/hooks/useLoadTemplates'
import useHandleTemplate from '@/hooks/useHandleTemplate'
import Draggable from 'vuedraggable'
import { contextMenusThumbnails } from '@/configs/contextMenu'
import { useMainStore, useTemplatesStore, useKeyboardStore } from '@/store'
import { ContextMenu } from '@/components/Contextmenu/types'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { fillDigit } from '@/utils/common/common'

const mainStore = useMainStore()
const templatesStore = useTemplatesStore()
const keyboardStore = useKeyboardStore()
const { templatesLoadLimit } = useLoadTemplates()
const { templates, templateIndex } = storeToRefs(templatesStore)
const { selectedTemplatesIndex: _selectedTemplatesIndex, thumbnailsFocus } = storeToRefs(mainStore)
const { ctrlKeyState, shiftKeyState } = storeToRefs(keyboardStore)
const { createTemplate, deleteTemplate, sortTemplates, cutTemplate, pasteTemplate } = useHandleTemplate()

const selectedTemplatesIndex = computed(() => [..._selectedTemplatesIndex.value, templateIndex.value])
const menuRef = ref();
const menuPopoverRef = ref();
const contextmenusThumbnailItem = (): ContextMenu[] => {
  return [
    {
      text: 'برش',
      subText: 'Ctrl + X',
      handler: cutTemplate,
    },
    {
      text: 'کپی',
      subText: 'Ctrl + C',
      // handler: copySlide,
    },
    {
      text: 'الحاق',
      subText: 'Ctrl + V',
      handler: pasteTemplate,
    },
    {
      text: 'انتخاب همه',
      subText: 'Ctrl + A',
      // handler: selectAllSlide,
    },
    { divider: true },
    {
      text: 'صفحه جدید',
      subText: 'Enter',
      handler: createTemplate,
    },
    {
      text: 'کپی ',
      subText: 'Ctrl + D',
      // handler: copyAndPasteSlide,
    },
    {
      text: 'حدف',
      subText: 'Delete',
      handler: () => deleteTemplate(),
    },
    { divider: true },
    {
      text: 'از پیش نمایش',
      subText: 'Shift + F5',
      // handler: enterScreening,
    },
  ]
}

// Set the focus state of the thumbnail toolbar (the shortcut keys in this section will only take effect when it is in focus)
const setThumbnailsFocus = (focus: boolean) => {
  if (thumbnailsFocus.value === focus) return
  mainStore.setThumbnailsFocus(focus)

  if (!focus) mainStore.updateSelectedTemplatesIndex([])
}

// Drag and drop to adjust the order and synchronize the data
const handleDragEnd = (eventData: { newIndex: number; oldIndex: number }) => {
  const { newIndex, oldIndex } = eventData
  sortTemplates(newIndex, oldIndex)
}


// Click on the thumbnail
const handleClickTemplateThumbnail = (e: MouseEvent, index: number) => {
  const isMultiSelected = selectedTemplatesIndex.value.length > 1

  if (isMultiSelected && selectedTemplatesIndex.value.includes(index) && e.button !== 0) return

  // Hold down the Ctrl key and click on the page. Click on the selected page again to deselect it.
  if (ctrlKeyState.value) {
    if (templateIndex.value === index) {
      if (!isMultiSelected) return

      // const newSelectedSlidesIndex = selectedSlidesIndex.value.filter(item => item !== index)
      // mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
      // changeSlideIndex(selectedSlidesIndex.value[0])
    }
    else {
      if (selectedTemplatesIndex.value.includes(index)) {
        const newSelectedSlidesIndex = selectedTemplatesIndex.value.filter(item => item !== index)
        // mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
      }
      else {
        const newSelectedSlidesIndex = [...selectedTemplatesIndex.value, index]
        // mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
        // changeSlideIndex(index)
      }
    }
  }
    // Hold down the Shift key to select all pages in the range
  else if (shiftKeyState.value) {
    if (templateIndex.value === index && !isMultiSelected) return

    let minIndex = Math.min(...selectedTemplatesIndex.value)
    let maxIndex = index

    if (index < minIndex) {
      maxIndex = Math.max(...selectedTemplatesIndex.value)
      minIndex = index
    }

    const newSelectedSlidesIndex = []
    for (let i = minIndex; i <= maxIndex; i++) newSelectedSlidesIndex.push(i)
    // mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
    // changeSlideIndex(index)
  }
    // Normal page switching
  else {
    mainStore.updateSelectedTemplatesIndex([])
    changeSlideIndex(index)
  }
}

// Switch Page
const changeSlideIndex = (index: number) => {
  if (templateIndex.value === index) return
  templatesStore.setTemplateIndex(index)
  templatesStore.renderTemplate()
}

</script>

<style lang="scss" scoped>
.thumb-handle {
  height: $headerHeight;
  font-size: 12px;
  display: flex;
  flex-shrink: 0;
  border-bottom: 1px solid $borderColor;

  .btn {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      background-color: $lightGray;
    }
  }
  .select-btn {
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-left: 1px solid $borderColor;

    &:hover {
      background-color: $lightGray;
    }
  }

  .icon {
    margin-right: 3px;
    font-size: 14px;
  }
}
.thumb-content {
  padding: 5px 0;
  flex: 1;
  overflow: auto;
  border-left: 1px solid $borderColor;
}
.thumbnail-item {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 0;

  .thumbnail {
    outline: 1px solid rgba($color: $themeColor, $alpha: .15);
  }

  &.active {
    .label {
      color: $themeColor;
    }
    .thumbnail {
      outline-color: $themeColor;
    }
  }
  &.selected {
    .thumbnail {
      outline-color: $themeColor;
    }
  }
}
.label {
  font-size: 12px;
  color: #999;
  width: 20px;
  cursor: grab;

  &.offset-left {
    position: relative;
    left: -4px;
  }

  &:active {
    cursor: grabbing;
  }
}
.thumb-number {
  height: 0;
  font-size: 12px;
  border-top: 1px solid $borderColor;
  line-height: 40px;
  text-align: center;
  color: #666;
}
</style>