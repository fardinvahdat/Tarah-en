<template>
  <div>
    <el-dialog v-model="state.show" align-center width="90%" @close="state.showMatting = false">
      <template #header>
        <div class="tool-wrap">
          <el-button type="primary" plain @click="done">درخواست را تایید کنید</el-button>
          <el-radio-group v-model="state.isErasing" style="margin-left: 35px">
            <el-radio :value="false" size="large"> <b>قلم مو نقاشی</b> <i class="icon sd-xiubu" /></el-radio>
            <el-radio :value="true" size="large"> <b>برس پاک کن</b> <i class="icon sd-cachu" /></el-radio>
          </el-radio-group>
          <number-slider v-model="state.radius" class="slider-wrap" label="Brush size" :showInput="false"
            labelWidth="90px" :maxValue="state.constants?.RADIUS_SLIDER_MAX"
            :minValue="state.constants?.RADIUS_SLIDER_MIN" :step="state.constants?.RADIUS_SLIDER_STEP" /> <number-slider
            v-model="state.hardness" class="slider-wrap" label="سختی" :showInput="false" labelWidth="90px"
            :maxValue="state.constants?.HARDNESS_SLIDER_MAX" :minValue="state.constants?.HARDNESS_SLIDER_MIN"
            :step="state.constants?.HARDNESS_SLIDER_STEP" />
        </div>
      </template>
      <matting v-if="state.showMatting" :hasHeader="false" @register="mattingStart" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRefs, nextTick, DefineComponent } from 'vue'
import matting from './matting.vue'
import { ElRadioGroup, ElRadio } from 'element-plus'
// import numberSlider from '@/components/modules/settings/numberSlider.vue'

interface TImageExtractionState {
  show: boolean
  showMatting: boolean
  isErasing: boolean
  radius: number | string
  brushSize: string
  hardness: number | string
  hardnessText: string
  constants: null;
}

type TParams = {
  raw: string
  result: string
}

type TCallback = ((base64: string) => void) | null

const props: TParams = {
  raw: '',
  result: ''
}

let callback: TCallback = null // Return the callback for automatic cutout

const state = reactive<TImageExtractionState>({
  show: false,
  showMatting: false,
  isErasing: false,
  radius: 0, // Brush Size
  brushSize: '', // Brush Size: Computed Property, Displayed Value
  hardness: 0, // Brush Hardness
  hardnessText: '', // Brush Hardness: Calculated Property, Displayed Value
  constants: null,
})

// let mattingParam: MattingType | null

const mattingStart = (mattingOptions: any) => {
  // mattingOptions.initLoadImages(props.raw, props.result)
  // state.isErasing = mattingOptions.isErasing
  // state.radius = mattingOptions.radius
  // state.hardness = mattingOptions.hardness
  // state.constants = mattingOptions.constants
  // mattingParam = mattingOptions
}

const open = async (raw: string, result: string, cb: TCallback) => {
  state.show = true
  props.raw = raw
  props.result = result
  await nextTick()
  setTimeout(() => {
    state.showMatting = true
  }, 300)
  callback = cb
}

defineExpose({
  open
})

const done = () => {
  state.show = false
  callback
}

</script>


<style lang="less" scoped>
:deep(.el-dialog__body) {
  padding: 0 !important;
}
:deep(.el-dialog__header) {
  padding: 10px 35px;
  // var(--el-dialog-padding-primary)
}
.tool-wrap {
  display: flex;
  align-items: center;
}
// .tool-left {
//   display: inline-flex;
//   flex: 1;
// }
.slider-wrap {
  margin-left: 35px;
  width: 240px;
}
</style>

