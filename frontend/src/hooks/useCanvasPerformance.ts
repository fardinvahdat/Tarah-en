
import { debounce, throttle } from 'lodash-es'
import { ref, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useFabricStore } from '@/store'
import useCanvas from '@/views/Canvas/useCanvas'

export default function useCanvasPerformance() {
  const fabricStore = useFabricStore()
  const { zoom } = storeToRefs(fabricStore)
  const isProcessing = ref(false)
  const rafId = ref<number | null>(null)

  // Debounced canvas transform to prevent excessive re-calculations
  const debouncedSetTransform = debounce((callback: () => void) => {
    if (isProcessing.value) return
    isProcessing.value = true
    
    if (rafId.value) {
      cancelAnimationFrame(rafId.value)
    }
    
    rafId.value = requestAnimationFrame(() => {
      callback()
      isProcessing.value = false
      rafId.value = null
    })
  }, 16) // 60fps

  // Throttled zoom operations
  const throttledZoom = throttle((zoomLevel: number, centerPoint: any) => {
    const [canvas] = useCanvas()
    if (!canvas || isProcessing.value) return
    
    canvas.zoomToPoint(centerPoint, zoomLevel)
    zoom.value = canvas.getZoom()
  }, 50)

  // Optimized object selection with minimal re-renders
  const optimizedSelectObject = (object: any) => {
    const [canvas] = useCanvas()
    if (!canvas || canvas.getActiveObject() === object) return
    
    // Disable automatic rendering during selection
    canvas.renderOnAddRemove = false
    canvas.setActiveObject(object)
    canvas.renderOnAddRemove = true
    // canvas.requestRenderAll()
  }

  // Memory-efficient object disposal
  const disposeObjects = (objects: any[]) => {
    objects.forEach(obj => {
      if (obj.dispose) {
        obj.dispose()
      }
    })
  }

  // Cleanup function
  const cleanup = () => {
    if (rafId.value) {
      cancelAnimationFrame(rafId.value)
    }
    debouncedSetTransform.cancel()
    throttledZoom.cancel()
  }

  onUnmounted(cleanup)

  return {
    debouncedSetTransform,
    throttledZoom,
    optimizedSelectObject,
    disposeObjects,
    isProcessing,
    cleanup
  }
}
