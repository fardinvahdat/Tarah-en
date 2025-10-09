
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { throttle, debounce } from 'lodash-es'
import { FabricCanvas } from '@/app/fabricCanvas'

export function useMobileCanvasOptimizations(canvas: FabricCanvas) {
  const isMobile = ref(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
  const isLowMemoryDevice = ref(navigator.hardwareConcurrency <= 2)
  const connectionSpeed = ref<'slow' | 'fast'>('fast')
  
  // Touch gesture handling
  const touchState = ref({
    isTouch: false,
    startDistance: 0,
    startZoom: 1,
    lastPinchCenter: null as { x: number; y: number } | null
  })
  
  // Performance monitoring
  const performanceMetrics = ref({
    frameRate: 60,
    renderTime: 0,
    objectCount: 0
  })
  
  // Detect connection speed
  const detectConnectionSpeed = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connectionSpeed.value = connection.effectiveType === '4g' || connection.effectiveType === '3g' ? 'fast' : 'slow'
    }
  }
  
  // Optimized touch handling for mobile
  const setupMobileTouchHandling = () => {
    if (!canvas || !isMobile.value) return
    
    const handleTouchStart = throttle((e: TouchEvent) => {
      if (e.touches.length === 2) {
        touchState.value.isTouch = true
        touchState.value.startDistance = getTouchDistance(e.touches[0], e.touches[1])
        touchState.value.startZoom = canvas.getZoom()
        touchState.value.lastPinchCenter = getTouchCenter(e.touches[0], e.touches[1])
        e.preventDefault()
      }
    }, 16)
    
    const handleTouchMove = throttle((e: TouchEvent) => {
      if (e.touches.length === 2 && touchState.value.isTouch) {
        const currentDistance = getTouchDistance(e.touches[0], e.touches[1])
        const currentCenter = getTouchCenter(e.touches[0], e.touches[1])
        
        // Calculate zoom
        const scale = currentDistance / touchState.value.startDistance
        const newZoom = Math.max(0.1, Math.min(3, touchState.value.startZoom * scale))
        
        // Apply zoom with center point
        canvas.zoomToPoint(currentCenter, newZoom)
        
        e.preventDefault()
      }
    }, 16)
    
    const handleTouchEnd = () => {
      touchState.value.isTouch = false
      touchState.value.lastPinchCenter = null
    }
    
    canvas.upperCanvasEl.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.upperCanvasEl.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.upperCanvasEl.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      canvas.upperCanvasEl.removeEventListener('touchstart', handleTouchStart)
      canvas.upperCanvasEl.removeEventListener('touchmove', handleTouchMove)
      canvas.upperCanvasEl.removeEventListener('touchend', handleTouchEnd)
    }
  }
  
  // Performance optimization based on device capabilities
  const optimizeCanvasForDevice = () => {
    if (!canvas) return
    
    if (isMobile.value || isLowMemoryDevice.value) {
      // Reduce canvas quality for mobile/low-memory devices
      // canvas.enableRetinaScaling = false
      canvas.imageSmoothingEnabled = false
      canvas.renderOnAddRemove = false
      
      // Limit object caching
      canvas.getObjects().forEach(obj => {
        obj.objectCaching = false
      })
      
      // Reduce selection tolerance for better performance
      canvas.targetFindTolerance = 8
      canvas.perPixelTargetFind = false
    }
    
    if (connectionSpeed.value === 'slow') {
      // Further optimizations for slow connections
      canvas.skipTargetFind = true
    }
  }
  
  // Monitor performance and adjust settings
  const monitorPerformance = () => {
    let frameCount = 0
    let lastTime = performance.now()
    
    const checkPerformance = () => {
      const currentTime = performance.now()
      frameCount++
      
      if (currentTime - lastTime >= 1000) {
        performanceMetrics.value.frameRate = frameCount
        performanceMetrics.value.objectCount = canvas?.getObjects().length || 0
        
        // Auto-adjust quality based on performance
        if (performanceMetrics.value.frameRate < 30 && isMobile.value) {
          // Reduce quality further
          canvas?.getObjects().forEach(obj => {
            obj.selectable = false
          })
        }
        
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(checkPerformance)
    }
    
    checkPerformance()
  }
  
  // Utility functions
  const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }
  
  const getTouchCenter = (touch1: Touch, touch2: Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }
  
  // Cleanup function
  let cleanupTouchHandling: (() => void) | null = null
  
  onMounted(() => {
    detectConnectionSpeed()
    optimizeCanvasForDevice()
    monitorPerformance()
    cleanupTouchHandling = setupMobileTouchHandling()
  })
  
  onUnmounted(() => {
    if (cleanupTouchHandling) {
      cleanupTouchHandling()
    }
  })
  
  return {
    isMobile,
    isLowMemoryDevice,
    connectionSpeed,
    performanceMetrics,
    touchState,
    optimizeCanvasForDevice,
    monitorPerformance
  }
}
