/**
 * Aggressive optimizations for low-end mobile devices
 * Targets 10-20 FPS improvement on devices with <2 CPU cores
 */

import { ref, onMounted, onUnmounted, watch } from 'vue'
import { debounce, throttle } from 'lodash-es'
import { FabricCanvas } from '@/app/fabricCanvas'
import { FabricObject } from 'fabric'

interface DeviceCapabilities {
  hardwareConcurrency: number
  memoryGB: number
  devicePixelRatio: number
  isLowEnd: boolean
  isCriticallyLowEnd: boolean
}

interface PerformanceState {
  averageFPS: number
  frameDrops: number
  renderTime: number
  memoryPressure: 'low' | 'medium' | 'high' | 'critical'
}

export function useLowEndMobileOptimizations(canvas: FabricCanvas) {
  const deviceCapabilities = ref<DeviceCapabilities>({
    hardwareConcurrency: navigator.hardwareConcurrency || 1,
    memoryGB: (navigator as any).deviceMemory || 1,
    devicePixelRatio: window.devicePixelRatio || 1,
    isLowEnd: false,
    isCriticallyLowEnd: false
  })

  const performanceState = ref<PerformanceState>({
    averageFPS: 60,
    frameDrops: 0,
    renderTime: 0,
    memoryPressure: 'low'
  })

  const isOptimizationActive = ref(false)
  const emergencyMode = ref(false)

  // Detect device capabilities
  const detectDeviceCapabilities = () => {
    const caps = deviceCapabilities.value
    
    // Low-end: ≤2 cores, ≤2GB RAM, or very old devices
    caps.isLowEnd = caps.hardwareConcurrency <= 2 || caps.memoryGB <= 2
    
    // Critically low-end: 1 core, ≤1GB RAM
    caps.isCriticallyLowEnd = caps.hardwareConcurrency === 1 || caps.memoryGB <= 1
    
    console.log('🔍 Device Capabilities:', caps)
  }

  // Performance monitoring with frame time tracking
  const performanceMonitor = (() => {
    let frameCount = 0
    let totalFrameTime = 0
    let lastFrameTime = performance.now()
    let frameDropCounter = 0
    
    const measureFrame = () => {
      const currentTime = performance.now()
      const frameTime = currentTime - lastFrameTime
      
      frameCount++
      totalFrameTime += frameTime
      
      // Count frame drops (frames taking >33ms for 30fps)
      if (frameTime > 33) {
        frameDropCounter++
      }
      
      // Update metrics every 60 frames
      if (frameCount >= 60) {
        performanceState.value.averageFPS = Math.round(1000 / (totalFrameTime / frameCount))
        performanceState.value.frameDrops = frameDropCounter
        performanceState.value.renderTime = totalFrameTime / frameCount
        
        // Reset counters
        frameCount = 0
        totalFrameTime = 0
        frameDropCounter = 0
        
        checkPerformanceThresholds()
      }
      
      lastFrameTime = currentTime
      requestAnimationFrame(measureFrame)
    }
    
    return { measureFrame }
  })()

  // Check performance thresholds and trigger optimizations
  const checkPerformanceThresholds = () => {
    const { averageFPS, frameDrops } = performanceState.value
    const { isLowEnd, isCriticallyLowEnd } = deviceCapabilities.value
    
    // Emergency mode: FPS below 15 or excessive frame drops
    if (averageFPS < 15 || frameDrops > 30) {
      if (!emergencyMode.value) {
        console.warn('🚨 Emergency Performance Mode Activated')
        emergencyMode.value = true
        activateEmergencyOptimizations()
      }
    }
    // Standard low-end optimizations: FPS below 25 on low-end devices
    else if ((averageFPS < 25 && isLowEnd) || (averageFPS < 20 && isCriticallyLowEnd)) {
      if (!isOptimizationActive.value) {
        console.log('⚡ Low-End Optimizations Activated')
        isOptimizationActive.value = true
        activateStandardOptimizations()
      }
    }
    // Disable optimizations if performance improves
    else if (averageFPS > 35 && isOptimizationActive.value && !emergencyMode.value) {
      console.log('✅ Performance Improved - Disabling Optimizations')
      deactivateOptimizations()
    }
  }

  // Standard optimizations for low-end devices
  const activateStandardOptimizations = () => {
    if (!canvas) return
    
    console.log('📱 Applying Standard Low-End Optimizations...')
    
    // 1. Disable retina scaling and image smoothing
    // canvas.enableRetinaScaling = false
    canvas.imageSmoothingEnabled = false
    
    // 2. Reduce selection tolerance and disable per-pixel targeting
    canvas.targetFindTolerance = 12
    canvas.perPixelTargetFind = false
    
    // 3. Disable object caching for all objects to reduce memory pressure
    canvas.getObjects().forEach(obj => {
      obj.objectCaching = false
      obj.noScaleCache = true
      obj.needsItsOwnCache = false
    })
    
    // 4. Reduce rendering frequency during interactions
    setupThrottledRendering()
    
    // 5. Implement aggressive memory management
    setupMemoryManagement()
    
    // 6. Optimize text rendering
    optimizeTextRendering()
    
    // 7. Reduce canvas resolution on extremely low-end devices
    if (deviceCapabilities.value.isCriticallyLowEnd) {
      reduceCanvasResolution()
    }
  }

  // Emergency optimizations for critically poor performance
  const activateEmergencyOptimizations = () => {
    if (!canvas) return
    
    console.log('🚨 Applying Emergency Performance Optimizations...')
    
    // All standard optimizations plus:
    activateStandardOptimizations()
    
    // 1. Disable all animations and transitions
    disableAnimations()
    
    // 2. Limit visible objects to essential ones only
    limitVisibleObjects(10)
    
    // 3. Disable real-time object updates during movement
    disableRealTimeUpdates()
    
    // 4. Force canvas to lower resolution
    forceCanvasDownscaling()
    
    // 5. Disable hover effects and secondary interactions
    disableSecondaryInteractions()
    
    // 6. Emergency memory cleanup
    performEmergencyMemoryCleanup()
  }

  // Setup throttled rendering for interactions
  const setupThrottledRendering = () => {
    if (!canvas) return
    
    const originalRenderAll = canvas.requestRenderAll.bind(canvas)
    
    // Throttle render calls based on device capability
    const renderThrottle = deviceCapabilities.value.isCriticallyLowEnd ? 200 : 100
    
    canvas.requestRenderAll = throttle(() => {
      originalRenderAll()
    }, renderThrottle)
    
    // Debounce object modifications
    const originalSetCoords = canvas.forEachObject.bind(canvas)
    canvas.forEachObject = debounce((callback: any) => {
      originalSetCoords(callback)
    }, 20)
  }

  // Setup aggressive memory management
  const setupMemoryManagement = () => {
    // Monitor memory usage
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit
        
        if (usageRatio > 0.8) {
          performanceState.value.memoryPressure = 'critical'
          performEmergencyMemoryCleanup()
        } else if (usageRatio > 0.6) {
          performanceState.value.memoryPressure = 'high'
          performMemoryCleanup()
        }
      }
    }
    
    setInterval(checkMemory, 3000) // Check every 3 seconds
  }

  // Optimize text rendering for mobile
  const optimizeTextRendering = () => {
    if (!canvas) return
    
    canvas.getObjects().forEach(obj => {
      if (obj.type === 'textbox' || obj.type === 'text') {
        // Disable sub-pixel rendering
        obj.set({
          fontSubPixel: false,
          pathOffset: { x: 0, y: 0 }
        })
      }
    })
  }

  // Reduce canvas resolution for critically low-end devices
  const reduceCanvasResolution = () => {
    if (!canvas) return
    
    const scaleFactor = 0.75 // Reduce to 75% resolution
    const currentWidth = canvas.getWidth()
    const currentHeight = canvas.getHeight()
    
    canvas.setDimensions({
      width: currentWidth * scaleFactor,
      height: currentHeight * scaleFactor
    })
    
    // Scale zoom to compensate
    const currentZoom = canvas.getZoom()
    canvas.setZoom(currentZoom * scaleFactor)
    
    console.log(`📱 Reduced canvas resolution by ${(1 - scaleFactor) * 100}%`)
  }

  // Disable animations and transitions
  const disableAnimations = () => {
    if (!canvas) return
    
    // Disable fabric.js animations
    canvas.getObjects().forEach(obj => {
      obj.set({
        hasRotatingPoint: false,
        transparentCorners: true,
        borderOpacityWhenMoving: 1,
        borderScaleFactor: 1
      })
    })
    
    // Disable CSS transitions
    const style = document.createElement('style')
    style.textContent = `
      .canvas-container * {
        transition: none !important;
        animation: none !important;
      }
    `
    document.head.appendChild(style)
  }

  // Limit visible objects to essential ones
  const limitVisibleObjects = (maxObjects: number) => {
    if (!canvas) return
    
    const objects = canvas.getObjects()
    const activeObject = canvas.getActiveObject()
    
    // Hide objects beyond the limit, except for the active object
    objects.forEach((obj, index) => {
      if (index >= maxObjects && obj !== activeObject) {
        obj.set({ visible: false })
      }
    })
    
    console.log(`🔍 Limited visible objects to ${maxObjects}`)
  }

  // Disable real-time updates during object movement
  const disableRealTimeUpdates = () => {
    if (!canvas) return
    
    let isMoving = false
    
    canvas.on('object:moving', () => {
      if (!isMoving) {
        isMoving = true
        canvas.renderOnAddRemove = false
      }
    })
    
    canvas.on('object:modified', debounce(() => {
      isMoving = false
      canvas.renderOnAddRemove = true
      canvas.requestRenderAll()
    }, 200))
  }

  // Force canvas downscaling for emergency situations
  const forceCanvasDownscaling = () => {
    if (!canvas) return
    
    const scaleFactor = 0.5 // 50% resolution
    const currentWidth = canvas.getWidth()
    const currentHeight = canvas.getHeight()
    
    canvas.lowerCanvasEl.style.transform = `scale(${1/scaleFactor})`
    canvas.upperCanvasEl.style.transform = `scale(${1/scaleFactor})`
    
    canvas.setDimensions({
      width: currentWidth * scaleFactor,
      height: currentHeight * scaleFactor
    })
    
    console.log('🚨 Emergency canvas downscaling applied')
  }

  // Disable secondary interactions
  const disableSecondaryInteractions = () => {
    if (!canvas) return
    
    // Disable hover effects
    canvas.hoverCursor = 'default'
    canvas.moveCursor = 'default'
    
    // Disable object hover detection
    canvas.findTarget = () => undefined
    
    // Disable non-essential event listeners
    canvas.off('mouse:over')
    canvas.off('mouse:out')
    canvas.off('object:over')
    canvas.off('object:out')
  }

  // Perform emergency memory cleanup
  const performEmergencyMemoryCleanup = () => {
    console.log('🧹 Emergency Memory Cleanup')
    
    // Clear all cached textures and images
    if (canvas) {
      canvas.getObjects().forEach(obj => {
        if (obj.type === 'image' && (obj as any)._cacheCanvas) {
          (obj as any)._cacheCanvas = null
          (obj as any)._cacheContext = null
        }
        
        // Clear object cache
        obj.objectCaching = false
        obj.needsItsOwnCache = false
      })
    }
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc()
    }
    
    // Clear any stored references
    window.dispatchEvent(new CustomEvent('memory:emergency-cleanup'))
  }

  // Perform regular memory cleanup
  const performMemoryCleanup = () => {
    console.log('🧹 Memory Cleanup')
    
    // Clear texture cache
    window.dispatchEvent(new CustomEvent('canvas:cleanup-cache'))
    
    // Clean up disposed objects
    if (canvas) {
      const objects = canvas.getObjects()
      objects.forEach(obj => {
        if (!obj.visible && obj !== canvas.getActiveObject()) {
          // Temporarily remove invisible objects from canvas
          canvas.remove(obj)
          setTimeout(() => {
            if (obj.visible) {
              canvas.add(obj)
            }
          }, 5000)
        }
      })
    }
  }

  // Deactivate optimizations when performance improves
  const deactivateOptimizations = () => {
    if (!canvas) return
    
    console.log('✅ Deactivating Performance Optimizations')
    
    isOptimizationActive.value = false
    emergencyMode.value = false
    
    // Restore normal settings
    // canvas.enableRetinaScaling = deviceCapabilities.value.devicePixelRatio > 1
    canvas.imageSmoothingEnabled = true
    canvas.targetFindTolerance = 4
    canvas.perPixelTargetFind = true
    canvas.renderOnAddRemove = true
    
    // Re-enable object caching
    canvas.getObjects().forEach(obj => {
      obj.objectCaching = true
      obj.set({ visible: true })
    })
    
    // Remove emergency styles
    const emergencyStyles = document.head.querySelector('style')
    if (emergencyStyles) {
      emergencyStyles.remove()
    }
  }

  // Watch for device orientation changes
  const handleOrientationChange = debounce(() => {
    if (isOptimizationActive.value && canvas) {
      // Reapply optimizations after orientation change
      setTimeout(() => {
        activateStandardOptimizations()
      }, 500)
    }
  }, 500)

  // Setup
  onMounted(() => {
    detectDeviceCapabilities()
    performanceMonitor.measureFrame()
    
    window.addEventListener('orientationchange', handleOrientationChange)
    
    // Auto-activate optimizations for known low-end devices
    if (deviceCapabilities.value.isCriticallyLowEnd) {
      console.log('🔧 Auto-activating optimizations for critically low-end device')
      setTimeout(activateStandardOptimizations, 1000)
    }
  })

  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('orientationchange', handleOrientationChange)
    deactivateOptimizations()
  })

  // Watch for canvas changes
  watch(() => canvas, (newCanvas) => {
    if (newCanvas && (isOptimizationActive.value || emergencyMode.value)) {
      // Reapply optimizations to new canvas
      setTimeout(() => {
        if (emergencyMode.value) {
          activateEmergencyOptimizations()
        } else {
          activateStandardOptimizations()
        }
      }, 100)
    }
  })

  return {
    deviceCapabilities: readonly(deviceCapabilities),
    performanceState: readonly(performanceState),
    isOptimizationActive: readonly(isOptimizationActive),
    emergencyMode: readonly(emergencyMode),
    activateStandardOptimizations,
    activateEmergencyOptimizations,
    deactivateOptimizations,
    performEmergencyMemoryCleanup
  }
}