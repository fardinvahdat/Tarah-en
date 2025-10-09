
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFabricStore } from '@/store'
import { Point } from 'fabric'
import useCanvas from '@/views/Canvas/useCanvas'
import useCenter from '@/views/Canvas/useCenter'
import useCanvasPerformance from './useCanvasPerformance'

export default function useOptimizedCanvasScale() {
  const fabricStore = useFabricStore()
  const { zoom, scalePercentage } = storeToRefs(fabricStore)
  const { throttledZoom, debouncedSetTransform } = useCanvasPerformance()
  const isScaling = ref(false)

  const canvasScalePercentage = computed(() => Math.round(zoom.value * 100) + '%')

  // Optimized canvas scaling with performance considerations
  const scaleCanvas = (command: '+' | '-') => {
    if (isScaling.value) return
    
    const [canvas] = useCanvas()
    if (!canvas) return

    isScaling.value = true
    
    let percentage = Math.round(zoom.value * 100)
    const step = 5
    const max = 500
    const min = 10
    
    if (command === '+' && percentage <= max) percentage += step
    if (command === '-' && percentage >= min) percentage -= step
    
    const { centerPoint } = useCenter()
    
    // Use throttled zoom for smooth performance
    throttledZoom(percentage / 100, centerPoint)
    
    // Debounced pan operation
    debouncedSetTransform(() => {
      const newCenter = new Point(centerPoint.x, centerPoint.y)
        .scalarMultiply(canvas.getZoom())
        .subtract(canvas.getCenterPoint())
      canvas.absolutePan(newCenter, true)
      isScaling.value = false
    })
  }

  // Optimized canvas transform with minimal recalculations
  const setCanvasTransformOptimized = () => {
    const [canvas] = useCanvas()
    if (!canvas || isScaling.value) return

    debouncedSetTransform(() => {
      const objects = canvas.getObjects().filter(ele => 
        !['workspaceClip', 'workspaceSafe'].includes(ele.id || '')
      )
      
      if (objects.length === 0) return

      // Calculate bounds more efficiently
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      
      objects.forEach(obj => {
        const bounds = obj.getBoundingRect()
        minX = Math.min(minX, bounds.left)
        minY = Math.min(minY, bounds.top)
        maxX = Math.max(maxX, bounds.left + bounds.width)
        maxY = Math.max(maxY, bounds.top + bounds.height)
      })

      const width = maxX - minX
      const height = maxY - minY
      const centerX = minX + width / 2
      const centerY = minY + height / 2

      const newZoom = Math.min(
        canvas.getWidth() / width,
        canvas.getHeight() / height
      ) * scalePercentage.value / 100

      zoom.value = newZoom
      canvas.setZoom(newZoom)
      
      const newCenter = new Point(centerX, centerY)
        .scalarMultiply(newZoom)
        .subtract(canvas.getCenterPoint())
      canvas.absolutePan(newCenter, true)
    })
  }

  return {
    canvasScalePercentage,
    scaleCanvas,
    setCanvasTransformOptimized,
    isScaling
  }
}
