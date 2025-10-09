// Selection performance optimization hook for mobile devices
import { ref, onMounted, onUnmounted } from 'vue'
import { Canvas, FabricObject } from 'fabric'
import { debounce, throttle } from 'lodash-es'

interface SelectionState {
  isSelecting: boolean
  selectedObjects: FabricObject[]
  lastSelectionTime: number
  controlsVisible: boolean
}

export function useSelectionPerformance(canvas: Canvas) {
  const selectionState = ref<SelectionState>({
    isSelecting: false,
    selectedObjects: [],
    lastSelectionTime: 0,
    controlsVisible: false
  })

  const performanceMode = ref(false)

  // Debounced control visibility to prevent rapid toggles
  const debouncedShowControls = debounce(() => {
    selectionState.value.controlsVisible = true
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      activeObject.setControlsVisibility({
        tl: true, tr: true, bl: true, br: true,
        ml: true, mr: true, mt: true, mb: true,
        mtr: true
      })
      canvas.requestRenderAll()
    }
  }, 100) // 100ms delay for smoother experience

  // Hide controls immediately for responsiveness
  const hideControls = () => {
    selectionState.value.controlsVisible = false
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      activeObject.setControlsVisibility({
        tl: false, tr: false, bl: false, br: false,
        ml: false, mr: false, mt: false, mb: false,
        mtr: false
      })
    }
  }

  // Optimized selection handler with performance monitoring
  const handleSelectionCreated = (e: any) => {
    const startTime = performance.now()
    
    selectionState.value.isSelecting = true
    selectionState.value.lastSelectionTime = startTime
    selectionState.value.selectedObjects = canvas.getActiveObjects()

    // Check if we're dealing with heavy objects
    const heavyObject = selectionState.value.selectedObjects.find(obj => 
      obj.type === 'image' && (obj as any)._originalElement?.src?.length > 1000000 // >1MB estimated
    )

    if (heavyObject) {
      console.log('🚨 Heavy object selected, enabling performance mode')
      performanceMode.value = true
      
      // Reduce canvas quality temporarily
      // canvas.enableRetinaScaling = false
      canvas.imageSmoothingEnabled = false
      
      // Trigger memory cleanup
      window.dispatchEvent(new CustomEvent('memory:emergency-cleanup'))
    }

    // Defer control rendering for smoother selection
    requestAnimationFrame(() => {
      debouncedShowControls()
    })

    const endTime = performance.now()
    console.log(`⚡ Selection created in ${endTime - startTime}ms`)
  }

  const handleSelectionCleared = () => {
    selectionState.value.isSelecting = false
    selectionState.value.selectedObjects = []
    hideControls()

    // Restore canvas quality if it was reduced
    if (performanceMode.value) {
      console.log('🔄 Restoring canvas quality')
      performanceMode.value = false
      // canvas.enableRetinaScaling = true
      canvas.imageSmoothingEnabled = true
      canvas.requestRenderAll()
    }
  }

  // Throttled selection update to prevent excessive updates
  const throttledSelectionUpdate = throttle((e: any) => {
    selectionState.value.selectedObjects = canvas.getActiveObjects()
    
    // Only update controls if selection has stabilized
    if (selectionState.value.controlsVisible) {
      debouncedShowControls()
    }
  }, 50)

  // Emergency performance optimization
  const enableEmergencyMode = () => {
    console.log('🚨 Emergency performance mode activated')
    
    // Reduce all visual effects
    canvas.renderOnAddRemove = false
    canvas.skipTargetFind = true
    canvas.perPixelTargetFind = false
    
    // Hide all non-essential elements
    hideControls()
    
    // Force immediate cleanup
    window.dispatchEvent(new CustomEvent('canvas:cleanup-cache'))
    
    // Restore after 2 seconds
    setTimeout(() => {
      canvas.renderOnAddRemove = true
      canvas.skipTargetFind = false
      canvas.perPixelTargetFind = false
      canvas.requestRenderAll()
      console.log('✅ Emergency mode deactivated')
    }, 2000)
  }

  // Setup event listeners
  const setupSelectionOptimization = () => {
    canvas.on('selection:created', handleSelectionCreated)
    canvas.on('selection:updated', throttledSelectionUpdate)
    canvas.on('selection:cleared', handleSelectionCleared)
    
    // Listen for emergency optimization events
    window.addEventListener('selection:emergency-optimize', enableEmergencyMode)
  }

  // Cleanup
  const cleanup = () => {
    canvas.off('selection:created', handleSelectionCreated)
    canvas.off('selection:updated', throttledSelectionUpdate)
    canvas.off('selection:cleared', handleSelectionCleared)
    
    window.removeEventListener('selection:emergency-optimize', enableEmergencyMode)
    
    debouncedShowControls.cancel()
    throttledSelectionUpdate.cancel()
  }

  // Auto-setup on mount
  onMounted(() => {
    if (canvas) {
      setupSelectionOptimization()
    }
  })

  onUnmounted(cleanup)

  return {
    selectionState: readonly(selectionState),
    performanceMode: readonly(performanceMode),
    enableEmergencyMode,
    cleanup
  }
}