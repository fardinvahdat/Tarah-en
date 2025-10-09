
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Canvas, FabricObject, Point } from 'fabric'
import { useFabricStore } from '@/store/modules/fabric'
import { useElementBounding } from '@vueuse/core'
import { FabricCanvas } from '@/app/fabricCanvas'
import useCanvasPerformance from '@/hooks/useCanvasPerformance'
import { optimizedImageService } from '@/services/optimizedImageService'

let canvas: null | FabricCanvas = null
let isInitialized = false

// Optimized canvas initialization with performance enhancements
const initOptimizedCanvas = () => {
  if (isInitialized) return
  
  const fabricStore = useFabricStore()
  const { canvasRef } = storeToRefs(fabricStore)
  const { debouncedSetTransform, disposeObjects } = useCanvasPerformance()
  
  if (!canvasRef.value) return
  
  const fabricWidth = fabricStore.getWidth()
  const fabricHeight = fabricStore.getHeight()
  
  canvas = new FabricCanvas(canvasRef.value, {
    width: fabricWidth,
    height: fabricHeight,
    renderOnAddRemove: true,
    skipTargetFind: false,
    selection: true,
    preserveObjectStacking: true,
    // enableRetinaScaling: false, // Disable for better performance
    imageSmoothingEnabled: true
  })

  // Optimize canvas performance settings
  canvas.freeDrawingBrush.limitedToCanvasSize = true
  canvas.perPixelTargetFind = false // Faster object detection
  canvas.targetFindTolerance = 4 // Reasonable tolerance for selection
  
  // Add optimized event handlers
  setupOptimizedEventHandlers()
  
  isInitialized = true
}

// Setup optimized event handlers with debouncing
const setupOptimizedEventHandlers = () => {
  if (!canvas) return
  
  const { debouncedSetTransform } = useCanvasPerformance()
  
  // Debounced object modification
  canvas.on('object:modified', debouncedSetTransform(() => {
    canvas?.requestRenderAll()
  }))
  
  // Optimized selection events with memory cleanup
  canvas.on('selection:created', (e) => {
    // Defer rendering to next frame for smoother selection
    requestAnimationFrame(() => {
      canvas?.requestRenderAll()
    })
    
    // Trigger cleanup for heavy objects
    const activeObject = canvas.getActiveObject()
    if (activeObject && activeObject.type === 'image') {
      window.dispatchEvent(new CustomEvent('memory:emergency-cleanup'))
    }
  })
  
  // Memory cleanup on object removal
  canvas.on('object:removed', (e) => {
    if (e.target) {
      // Clean up any associated resources
      if (e.target.dispose) {
        e.target.dispose()
      }
    }
  })
  
  // Optimized mouse events for better performance  
  let mouseMoveTicker = 0
  canvas.on('mouse:move', () => {
    mouseMoveTicker++
    const activeObject = canvas.getActiveObject()
    // Reduce frequency even more during selection (every 16th) for better mobile performance
    const frequency = activeObject ? 16 : 8
    if (mouseMoveTicker % frequency === 0) {
      canvas?.requestRenderAll()
    }
  })
}

// Optimized canvas transform with performance considerations
const setOptimizedCanvasTransform = () => {
  if (!canvas) return
  
  const fabricStore = useFabricStore()
  const { zoom, wrapperRef, scalePercentage } = storeToRefs(fabricStore)
  const { width, height } = useElementBounding(wrapperRef.value)
  
  // Batch canvas updates
  canvas.renderOnAddRemove = false
  
  canvas.setDimensions({ width: width.value, height: height.value })
  
  const objects = canvas.getObjects().filter(ele => 
    !['workspaceClip', 'workspaceSafe', 'workspaceDraw'].includes(ele.id || '')
  )
  
  if (objects.length === 0) {
    canvas.renderOnAddRemove = true
    return
  }
  
  // Efficient bounding box calculation
  const bounds = objects.reduce((acc, obj) => {
    const objBounds = obj.getBoundingRect()
    return {
      minX: Math.min(acc.minX, objBounds.left),
      minY: Math.min(acc.minY, objBounds.top),
      maxX: Math.max(acc.maxX, objBounds.left + objBounds.width),
      maxY: Math.max(acc.maxY, objBounds.top + objBounds.height)
    }
  }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })
  
  const boxWidth = bounds.maxX - bounds.minX
  const boxHeight = bounds.maxY - bounds.minY
  const centerX = bounds.minX + boxWidth / 2
  const centerY = bounds.minY + boxHeight / 2
  
  zoom.value = Math.min(
    canvas.getWidth() / boxWidth,
    canvas.getHeight() / boxHeight
  ) * scalePercentage.value / 100
  
  canvas.setZoom(zoom.value)
  canvas.absolutePan(
    new Point(centerX, centerY)
      .scalarMultiply(zoom.value)
      .subtract(canvas.getCenterPoint()),
    true
  )
  
  // Re-enable rendering and render once
  canvas.renderOnAddRemove = true
  canvas.requestRenderAll()
}

// Optimized template loading with image optimization
const initOptimizedTemplate = async (templateId?: number) => {
  if (!canvas) return
  
  const templatesStore = useTemplatesStore()
  const { currentTemplate } = storeToRefs(templatesStore)
  
  if (templateId && Number(templateId) > 0) return
  
  // Optimize images in template before loading
  const optimizedTemplate = await optimizeTemplateImages(currentTemplate.value)
  
  await canvas.loadFromJSON(optimizedTemplate)
  setOptimizedCanvasTransform()
}

// Optimize images in template data
const optimizeTemplateImages = async (template: any) => {
  if (!template || !template.objects) return template
  
  const optimizedObjects = await Promise.all(
    template.objects.map(async (obj: any) => {
      if (obj.type === 'image' && obj.src && obj.src.startsWith('data:')) {
        try {
          obj.src = await optimizedImageService.base64ToBlobUrl(obj.src)
        } catch (error) {
          console.warn('Failed to optimize image:', error)
        }
      }
      return obj
    })
  )
  
  return { ...template, objects: optimizedObjects }
}

export const initOptimizedEditor = async (templateId?: number) => {
  const fabricStore = useFabricStore()
  const { wrapperRef } = storeToRefs(fabricStore)
  
  initOptimizedCanvas()
  await initOptimizedTemplate(templateId)
  
  const { width, height } = useElementBounding(wrapperRef.value)
  watch([width, height], () => {
    setOptimizedCanvasTransform()
  }, { flush: 'post' }) // Use post flush for better performance
}

export default (): [FabricCanvas] => [canvas as FabricCanvas]
