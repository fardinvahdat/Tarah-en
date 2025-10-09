// Real-time performance monitoring for canvas applications
import { ref, onMounted, onUnmounted } from 'vue'

interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  canvasObjects: number
  renderTime: number
  memoryPressure: 'low' | 'medium' | 'high' | 'critical'
}

export function usePerformanceMonitor() {
  const metrics = ref<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    canvasObjects: 0,
    renderTime: 0,
    memoryPressure: 'low'
  })

  const isMonitoring = ref(false)
  const warnings = ref<string[]>([])
  
  let monitoringInterval: number | null = null
  let fpsCounter = 0
  let lastFpsTime = performance.now()
  let frameRequestId: number | null = null

  // FPS monitoring
  const measureFPS = () => {
    const now = performance.now()
    fpsCounter++
    
    if (now - lastFpsTime >= 1000) {
      metrics.value.fps = Math.round((fpsCounter * 1000) / (now - lastFpsTime))
      fpsCounter = 0
      lastFpsTime = now
    }
    
    if (isMonitoring.value) {
      // frameRequestId = requestAnimationFrame(measureFPS)
    }
  }

  // Memory monitoring
  const measureMemory = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      metrics.value.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
      
      // Calculate memory pressure
      const pressureRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit
      if (pressureRatio > 0.9) {
        metrics.value.memoryPressure = 'critical'
      } else if (pressureRatio > 0.7) {
        metrics.value.memoryPressure = 'high'
      } else if (pressureRatio > 0.5) {
        metrics.value.memoryPressure = 'medium'
      } else {
        metrics.value.memoryPressure = 'low'
      }
    }
  }

  // Canvas objects monitoring
  const measureCanvasObjects = () => {
    try {
      const canvas = (window as any).canvas
      if (canvas) {
        metrics.value.canvasObjects = canvas.getObjects().length
      }
    } catch (error) {
      // Silently handle canvas access errors
    }
  }

  // Render time monitoring
  const measureRenderTime = () => {
    const start = performance.now()
    
    // Hook into canvas render if available
    try {
      const canvas = (window as any).canvas
      if (canvas && canvas.requestRenderAll) {
        const originalRender = canvas.requestRenderAll
        canvas.requestRenderAll = function() {
          const renderStart = performance.now()
          const result = originalRender.call(this)
          metrics.value.renderTime = performance.now() - renderStart
          return result
        }
      }
    } catch (error) {
      // Silently handle errors
    }
  }

  // Performance warnings
  const checkPerformanceWarnings = () => {
    const newWarnings: string[] = []
    
    if (metrics.value.fps < 30) {
      newWarnings.push('Low FPS detected (<30fps)')
    }
    
    if (metrics.value.memoryPressure === 'critical') {
      newWarnings.push('Critical memory usage (>90%)')
    } else if (metrics.value.memoryPressure === 'high') {
      newWarnings.push('High memory usage (>70%)')
    }
    
    if (metrics.value.canvasObjects > 200) {
      newWarnings.push('Too many canvas objects (>200)')
    }
    
    if (metrics.value.renderTime > 16) {
      newWarnings.push('Slow rendering detected (>16ms)')
    }
    
    warnings.value = newWarnings
  }

  // Emergency performance optimization
  const triggerEmergencyOptimization = () => {
    console.log('🚨 Emergency performance optimization triggered')
    
    // Trigger cleanup events
    window.dispatchEvent(new CustomEvent('memory:emergency-cleanup'))
    window.dispatchEvent(new CustomEvent('canvas:cleanup-cache'))
    window.dispatchEvent(new CustomEvent('canvas:webgl-recovery'))
    
    // Disable expensive features temporarily
    window.dispatchEvent(new CustomEvent('canvas:disable-filters'))
    window.dispatchEvent(new CustomEvent('canvas:reduce-quality'))
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc()
    }
  }

  // Start monitoring
  const startMonitoring = () => {
    if (isMonitoring.value) return
    
    console.log('📊 Starting performance monitoring')
    isMonitoring.value = true
    
    // Start FPS monitoring
    measureFPS()
    
    // Start periodic monitoring
    monitoringInterval = setInterval(() => {
      measureMemory()
      measureCanvasObjects()
      checkPerformanceWarnings()
      
      // Auto-trigger emergency optimization if critical
      if (metrics.value.memoryPressure === 'critical' && metrics.value.fps < 20) {
        triggerEmergencyOptimization()
      }
    }, 2000) // Every 2 seconds
    
    measureRenderTime()
  }

  // Stop monitoring
  const stopMonitoring = () => {
    console.log('📊 Stopping performance monitoring')
    isMonitoring.value = false
    
    if (frameRequestId) {
      cancelAnimationFrame(frameRequestId)
      frameRequestId = null
    }
    
    if (monitoringInterval) {
      clearInterval(monitoringInterval)
      monitoringInterval = null
    }
  }

  // Get performance summary
  const getPerformanceSummary = () => {
    return {
      overall: getOverallScore(),
      details: {
        fps: metrics.value.fps,
        memory: `${metrics.value.memoryUsage}MB`,
        objects: metrics.value.canvasObjects,
        pressure: metrics.value.memoryPressure,
        warnings: warnings.value.length
      }
    }
  }

  // Calculate overall performance score
  const getOverallScore = (): number => {
    let score = 100
    
    // FPS penalty
    if (metrics.value.fps < 60) score -= (60 - metrics.value.fps) * 2
    if (metrics.value.fps < 30) score -= 20
    
    // Memory penalty
    if (metrics.value.memoryPressure === 'high') score -= 15
    if (metrics.value.memoryPressure === 'critical') score -= 30
    
    // Objects penalty
    if (metrics.value.canvasObjects > 150) score -= 10
    if (metrics.value.canvasObjects > 250) score -= 20
    
    // Render time penalty
    if (metrics.value.renderTime > 16) score -= 10
    if (metrics.value.renderTime > 33) score -= 20
    
    return Math.max(0, Math.min(100, score))
  }

  // Auto-start monitoring when component mounts
  onMounted(() => {
    startMonitoring()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    metrics: readonly(metrics),
    warnings: readonly(warnings),
    isMonitoring: readonly(isMonitoring),
    startMonitoring,
    stopMonitoring,
    getPerformanceSummary,
    triggerEmergencyOptimization
  }
}