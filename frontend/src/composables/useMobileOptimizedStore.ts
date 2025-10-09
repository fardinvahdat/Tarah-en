
import { computed, ref, watchEffect, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { throttle, debounce } from 'lodash-es'

// Mobile-optimized store wrapper
export function useMobileOptimizedStore<T>(store: any) {
  const optimizedRefs = new Map()
  const updateQueue = ref<Array<() => void>>([])
  const isProcessingUpdates = ref(false)
  
  // Batch state updates for mobile performance
  const batchedUpdate = throttle(() => {
    if (isProcessingUpdates.value || updateQueue.value.length === 0) return
    
    isProcessingUpdates.value = true
    
    requestAnimationFrame(() => {
      const updates = [...updateQueue.value]
      updateQueue.value.length = 0
      
      updates.forEach(update => {
        try {
          update()
        } catch (error) {
          console.warn('Batched update failed:', error)
        }
      })
      
      isProcessingUpdates.value = false
    })
  }, 16) // 60fps
  
  const queueUpdate = (updateFn: () => void) => {
    updateQueue.value.push(updateFn)
    batchedUpdate()
  }
  
  // Create memory-efficient refs
  const createOptimizedRef = (key: string, storeRef: any) => {
    if (optimizedRefs.has(key)) {
      return optimizedRefs.get(key)
    }
    
    // Use different strategies based on data type
    let optimizedRef
    if (typeof storeRef.value === 'object' && storeRef.value !== null) {
      // Use shallow ref for objects to reduce reactivity overhead
      optimizedRef = computed(() => storeRef.value)
    } else {
      // Use regular ref for primitives
      optimizedRef = storeRef
    }
    
    optimizedRefs.set(key, optimizedRef)
    return optimizedRef
  }
  
  const cleanup = () => {
    optimizedRefs.clear()
    updateQueue.value.length = 0
    batchedUpdate.cancel()
  }
  
  onUnmounted(cleanup)
  
  return {
    createOptimizedRef,
    queueUpdate,
    cleanup,
    isProcessingUpdates
  }
}

// Mobile-specific memory management
export function useMobileMemoryManager() {
  const memoryStats = ref({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0
  })
  
  const checkMemoryUsage = debounce(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      memoryStats.value = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      }
      
      // Trigger garbage collection if memory usage is high
      const memoryUsagePercent = memory.usedJSHeapSize / memory.jsHeapSizeLimit
      if (memoryUsagePercent > 0.8) {
        console.warn('High memory usage detected:', memoryUsagePercent)
        // Suggest cleanup actions
        window.dispatchEvent(new CustomEvent('memory:cleanup'))
      }
    }
  }, 5000)
  
  // Monitor memory usage
  const startMemoryMonitoring = () => {
    const interval = setInterval(checkMemoryUsage, 10000) // Check every 10s
    
    onUnmounted(() => {
      clearInterval(interval)
      checkMemoryUsage.cancel()
    })
  }
  
  return {
    memoryStats,
    startMemoryMonitoring,
    checkMemoryUsage
  }
}
