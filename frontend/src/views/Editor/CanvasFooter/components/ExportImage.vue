<template>
  <div class="export-img-dialog">
    <div class="configs">
      <div class="row">
        <div class="title">فرمت</div>
        <el-radio-group class="config-item" v-model="format">
          <el-radio-button style="width: 50%;" value="jpeg" label="jpeg">JPEG</el-radio-button>
          <el-radio-button style="width: 50%;" value="png" label="png">PNG</el-radio-button>
        </el-radio-group>
      </div>
      <div class="row">
        <div class="title">محدوده</div>
        <el-radio-group class="config-item" v-model="rangeType">
          <el-radio-button style="width: 50%;" value="all" label="all">تمامی صفحات</el-radio-button>
          <el-radio-button style="width: 50%;" value="current" label="current">صفحه کنونی</el-radio-button>
        </el-radio-group>
      </div>
      <div class="row" v-if="rangeType === 'custom'">
        <div class="title" :data-range="`（${range[0]} ~ ${range[1]}）`">محدوده خود</div>
        <el-slider class="config-item" range :min="1" :max="templates.length" :step="1" v-model="range" />
      </div>

      <div class="row">
        <div class="title">کیفیت</div>
        <el-slider class="config-item" :min="0" :max="1" :step="0.1" v-model="quality" />
      </div>

      <div class="row">
        <div class="title">رزولوشن</div>
        <el-radio-group class="config-item" v-model="dpiType">
          <el-radio-button style="width: 33.33%;" :value="72" :label="72">72DPI</el-radio-button>
          <el-radio-button style="width: 33.33%;" :value="150" :label="150">150DPI</el-radio-button>
          <el-radio-button style="width: 33.33%;" :value="300" :label="300">300DPI</el-radio-button>
        </el-radio-group>
      </div>


      <div class="row">
        <div class="title">خون ها را نادیده بگیرید</div>
        <div class="config-item">
          <el-switch v-model="ignoreClip" />
        </div>
      </div>
    </div>

    <div class="btns">
      <el-button class="btn export" type="primary" @click="downloaImage()" v-loading.fullscreen.lock="Exporting">دریافت تصاویر</el-button>
      <el-button class="btn close" @click="emit('close')">بستن</el-button>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTemplatesStore } from '@/store'
import { ImageFormat } from 'fabric'

import useCanvasExport from '@/hooks/useCanvasExport'

const emit = defineEmits<{
  (event: 'close'): void
}>()

const { templates } = storeToRefs(useTemplatesStore())

const { Exporting, exportImage } = useCanvasExport()


const rangeType = ref<'all' | 'current' | 'custom'>('current')
const dpiType = ref<number>(300)
const range = ref<[number, number]>([1, templates.value.length])
const format = ref<ImageFormat>("jpeg")
const quality = ref(1)
const ignoreWebfont = ref(false)
const ignoreClip = ref(true)

const downloaImage = () => {
  exportImage(format.value, quality.value, dpiType.value, ignoreClip.value)
}
</script>

<style lang="scss" scoped>
.export-img-dialog {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.thumbnails-view {
  @include absolute-0();

  &::after {
    content: '';
    background-color: #fff;
    @include absolute-0();
  }
}
.configs {
  width: 350px;
  height: calc(100% - 100px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 1;

  .row {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 25px;
  }

  .title {
    width: 120px;
    position: relative;

    &::after {
      content: attr(data-range);
      position: absolute;
      top: 20px;
      left: 0;
    }
  }
  .config-item {
    flex: 1;
  }
}
.btns {
  width: 300px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;

  .export {
    flex: 1;
  }
  .close {
    width: 100px;
    margin-left: 10px;
  }
}
</style>
<style>
.config-item .el-radio-button__inner {
  width: 100%;
}
</style>