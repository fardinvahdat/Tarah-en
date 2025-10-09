
<template>
  <div class="gap-1 absolute -bottom-12 z-[99999] w-full md:flex hidden items-center justify-center">
    <div class="flex items-center justify-center gap-1 bg-white p-2 rounded-lg shadow-lg">
      <button @click="handleZoomIn" class="handler-item md:px-2 text-black" :disabled="isScaling">
        <Icon name="zoom-in" class="w-6 h-6" />
      </button>

      <el-popover placement="bottom" trigger="click" width="100" popper-class="viewport-size">
        <template #reference>
          <span class="text text-black md:text-sm text-xs cursor-pointer">{{ canvasZoom }}</span>
        </template>
        <div class="viewport-size-preset">
          <div class="preset-item py-2 text-left cursor-pointer hover:bg-gray-100" v-for="preset in zoomPresets"
            :key="preset" @click="applyPresetScale(preset)">
            {{ preset }}%
          </div>
          <div class="preset-item text-right cursor-pointer hover:bg-gray-100" @click="resetCanvas">
            Full screen
          </div>
        </div>
      </el-popover>

      <button @click="handleZoomOut" class="handler-item md:px-2 text-black" :disabled="isScaling">
        <Icon name="zoom-out" class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useFabricStore } from '@/store'
import useOptimizedCanvasScale from '@/hooks/useOptimizedCanvasScale'
import useCanvas from '@/views/Canvas/useCanvas'
import useCenter from '@/views/Canvas/useCenter'

const fabricStore = useFabricStore()
const { zoom } = storeToRefs(fabricStore)

const { 
  canvasScalePercentage, 
  scaleCanvas, 
  setCanvasTransformOptimized,
  isScaling 
} = useOptimizedCanvasScale()

const zoomPresets = [200, 150, 100, 80, 50]
const canvasZoom = computed(() => Math.round(zoom.value * 100) + "%")

const handleZoomIn = () => scaleCanvas('+')
const handleZoomOut = () => scaleCanvas('-')
const resetCanvas = () => setCanvasTransformOptimized()

const applyPresetScale = (preset: number) => {
  const [canvas] = useCanvas()
  if (!canvas || isScaling.value) return
  
  const { centerPoint } = useCenter()
  canvas.zoomToPoint(centerPoint, preset / 100)
  zoom.value = canvas.getZoom()
}
</script>
