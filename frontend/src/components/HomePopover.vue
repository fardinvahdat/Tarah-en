<template>
  <div>
    <el-popover placement="right" width="220" trigger="click" popper-class="home-pop" @before-enter="setHome(true)"
      @hide="setHome(false)" :ref="props.menuPopoverRef" :virtual-ref="props.menuRef" virtual-triggering>
      <!-- <el-row class="pop-row">
        <IconHome class="pop-icon"/>
        <span class="pop-text">Back to Home</span>
      </el-row> -->
      <el-row class="pop-row" @click="createTemplate()">
        <span class="pop-text">Add a pattern</span>
        <IconPlus class="pop-icon" />
      </el-row>
      <el-row class="pop-row" @click="openUpload">
        <span class="pop-text">Upload</span>
        <IconUpload class="pop-icon" />
      </el-row>
    </el-popover>
    <FileUpload :visible="dialogVisible" @close="closeUpload" />
    <ReferencePopover :reference-ref="referenceRef" :reference-popover-ref="referencePopoverRef" />
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue'

import useHandleTemplate from '@/hooks/useHandleTemplate'
import ReferencePopover from '@/components/ReferencePopover.vue'
const { createTemplate } = useHandleTemplate()


const hasHelp = ref(false)
const popoverVisible = ref(false)
const dialogVisible = ref(false)
const referenceRef = ref()
const referencePopoverRef = ref()
const props = defineProps({
  menuRef: {
    type: null,
  },
  menuPopoverRef: {
    type: null
  },
  menuVisibleRef: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  (event: 'hide'): void
}>()

const setHome = (val: boolean) => {
  hasHelp.value = val
}

const openUpload = () => {
  dialogVisible.value = true
}

const closeUpload = () => {
  dialogVisible.value = false
}

</script>
<style lang="scss" scoped>
.home-pop {
  margin: 10px;
  padding: 0;
}
.pop-row {
  margin: 0 10px;
  font-size: 15px;
  padding: 10px 15px;
  cursor: pointer;
  .pop-icon {
    font-size: 20px;
  }

  .pop-text {
    padding-left: 15px;
  } 
}
.pop-row:hover {
  border-radius: $borderRadius;
  background-color: $hoverColor;
}
</style>