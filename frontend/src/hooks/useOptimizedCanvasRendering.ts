
import { ref, computed, watch, onUnmounted } from 'vue'
import { debounce, throttle } from 'lodash-es'
import { FabricCanvas } from '@/app/fabricCanvas'
import { FabricObject } from 'fabric'

interface RenderQueue {
  id: string
  priority: 'high' | 'medium' | 'low'
  callback: () => void
  timestamp: number
}

export default function useOptimizedCanvasRendering() {
  const renderQueue = ref<RenderQueue[]>([])
  const isRendering = ref(false)
  const frameId = ref<number | null>(null)
  const lastRenderTime = ref(0)
  const dirtyRegions = ref<Set<string>>(new Set())

  // Minimum time between renders (60fps = 16.67ms)
  const MIN_RENDER_INTERVAL = 16

  // Optimized render scheduling with priority queue
  const scheduleRender = (
    id: string, 
    callback: () => void, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    // Remove existing render for same ID
    renderQueue.value = renderQueue.value.filter(item => item.id !== id)
    
    // Add new render to queue
    renderQueue.value.push({
      id,
      priority,
      callback,
      timestamp: performance.now()
    })

    // Sort by priority and timestamp
    renderQueue.value.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority]
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp
    })

    if (!isRendering.value) {
      requestOptimizedRender()
    }
  }

  // Request optimized render with frame rate limiting
  const requestOptimizedRender = () => {
    if (frameId.value) {
      cancelAnimationFrame(frameId.value)
    }

    frameId.value = requestAnimationFrame(() => {
      const now = performance.now()
      const timeSinceLastRender = now - lastRenderTime.value

      if (timeSinceLastRender >= MIN_RENDER_INTERVAL) {
        processRenderQueue()
        lastRenderTime.value = now
      } else {
        // Schedule for next available frame
        const delay = MIN_RENDER_INTERVAL - timeSinceLastRender
        setTimeout(requestOptimizedRender, delay)
      }
    })
  }

  // Process render queue with batching
  const processRenderQueue = () => {
    if (renderQueue.value.length === 0) {
      isRendering.value = false
      return
    }

    isRendering.value = true
    const batchSize = 3 // Process max 3 renders per frame
    const batch = renderQueue.value.splice(0, batchSize)

    batch.forEach(item => {
      try {
        item.callback()
      } catch (error) {
        console.error(`Render error for ${item.id}:`, error)
      }
    })

    if (renderQueue.value.length > 0) {
      // Continue processing in next frame
      requestOptimizedRender()
    } else {
      isRendering.value = false
    }
  }

  // Dirty region tracking for partial rendering
  const markRegionDirty = (regionId: string) => {
    dirtyRegions.value.add(regionId)
  }

  const clearDirtyRegions = () => {
    dirtyRegions.value.clear()
  }

  // Optimized canvas object rendering
  const renderObjectOptimized = debounce((canvas: FabricCanvas, object: FabricObject) => {
    if (!canvas || !object) return

    scheduleRender(`object-${object.id}`, () => {
      // Only render if object is visible in viewport
      if (isObjectInViewport(canvas, object)) {
        object.setCoords()
        canvas.requestRenderAll()
      }
    }, 'high')
  }, 10)

  // Check if object is in viewport for culling
  const isObjectInViewport = (canvas: FabricCanvas, object: FabricObject): boolean => {
    const vp = canvas.calcViewportBoundaries()
    const objBounds = object.getBoundingRect()
    
    return !(
      objBounds.left > vp.br.x ||
      objBounds.top > vp.br.y ||
      objBounds.left + objBounds.width < vp.tl.x ||
      objBounds.top + objBounds.height < vp.tl.y
    )
  }

  // Batch multiple object updates
  const batchObjectUpdates = throttle((canvas: FabricCanvas, objects: FabricObject[]) => {
    scheduleRender('batch-update', () => {
      canvas.renderOnAddRemove = false
      
      objects.forEach(obj => {
        if (isObjectInViewport(canvas, obj)) {
          obj.setCoords()
        }
      })
      
      canvas.renderOnAddRemove = true
      canvas.requestRenderAll()
    }, 'medium')
  }, 50)

  // Performance monitoring
  const renderStats = computed(() => ({
    queueLength: renderQueue.value.length,
    isRendering: isRendering.value,
    dirtyRegionsCount: dirtyRegions.value.size,
    lastRenderTime: lastRenderTime.value
  }))

  // Cleanup
  onUnmounted(() => {
    if (frameId.value) {
      cancelAnimationFrame(frameId.value)
    }
    renderQueue.value = []
    dirtyRegions.value.clear()
  })

  return {
    scheduleRender,
    renderObjectOptimized,
    batchObjectUpdates,
    markRegionDirty,
    clearDirtyRegions,
    renderStats,
    isRendering
  }
}
