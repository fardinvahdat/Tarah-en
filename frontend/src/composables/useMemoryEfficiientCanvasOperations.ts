
import { ref, onUnmounted } from 'vue'
import { FabricObject } from 'fabric'
import { ObjectPool } from './useOptimizedVueReactivity'

// Memory-efficient canvas operations
export function useMemoryEfficientCanvasOperations() {
  const objectPool = new ObjectPool<FabricObject>(
    () => new FabricObject({}),
    (obj) => {
      obj.set({
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1,
        angle: 0
      })
    }
  )
  
  const imageCache = new Map<string, HTMLImageElement>()
  const maxCacheSize = 50
  
  // Optimized object creation with pooling
  const createOptimizedObject = <T extends FabricObject>(
    ObjectClass: new (...args: any[]) => T,
    options: any
  ): T => {
    // Try to reuse from pool for basic objects
    if (ObjectClass === FabricObject) {
      const pooledObj = objectPool.acquire()
      pooledObj.set(options)
      return pooledObj as T
    }
    
    // Create new instance for complex objects
    return new ObjectClass(options)
  }
  
  // Memory-efficient image loading with caching
  const loadImageWithCache = async (src: string): Promise<HTMLImageElement> => {
    if (imageCache.has(src)) {
      return imageCache.get(src)!
    }
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Manage cache size
        if (imageCache.size >= maxCacheSize) {
          const firstKey = imageCache.keys().next().value
          imageCache.delete(firstKey)
        }
        
        imageCache.set(src, img)
        resolve(img)
      }
      
      img.onerror = reject
      img.src = src
    })
  }
  
  // Batch object operations for better performance
  const batchObjectOperations = (objects: FabricObject[], operation: (obj: FabricObject) => void) => {
    // Process in chunks to avoid blocking UI
    const chunkSize = 10
    let index = 0
    
    const processChunk = () => {
      const endIndex = Math.min(index + chunkSize, objects.length)
      
      for (let i = index; i < endIndex; i++) {
        try {
          operation(objects[i])
        } catch (error) {
          console.warn('Batch operation failed for object:', objects[i], error)
        }
      }
      
      index = endIndex
      
      if (index < objects.length) {
        requestAnimationFrame(processChunk)
      }
    }
    
    processChunk()
  }
  
  // Memory cleanup utilities
  const cleanupObject = (obj: FabricObject) => {
    // Dispose of any textures or resources
    if (obj.dispose) {
      obj.dispose()
    }
    
    // Clear any cached data
    if ('_cacheCanvas' in obj) {
      (obj as any)._cacheCanvas = null
    }
    
    // Return to pool if applicable
    if (obj.constructor === FabricObject) {
      objectPool.release(obj)
    }
  }
  
  const cleanupImageCache = () => {
    imageCache.clear()
  }
  
  // WeakMap for object metadata to prevent memory leaks
  const objectMetadata = new WeakMap<FabricObject, {
    lastUsed: number
    memoryUsage: number
  }>()
  
  const trackObjectUsage = (obj: FabricObject) => {
    objectMetadata.set(obj, {
      lastUsed: Date.now(),
      memoryUsage: estimateObjectMemoryUsage(obj)
    })
  }
  
  const estimateObjectMemoryUsage = (obj: FabricObject): number => {
    // Rough estimation of memory usage
    let usage = 1000 // Base object overhead
    
    if (obj.type === 'image') {
      const img = obj as any
      usage += (img.width || 0) * (img.height || 0) * 4 // RGBA
    }
    
    if (obj.type === 'text' || obj.type === 'textbox') {
      const text = obj as any
      usage += (text.text?.length || 0) * 2 // Rough text size
    }
    
    return usage
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    objectPool.clear()
    cleanupImageCache()
  })
  
  return {
    createOptimizedObject,
    loadImageWithCache,
    batchObjectOperations,
    cleanupObject,
    cleanupImageCache,
    trackObjectUsage,
    estimateObjectMemoryUsage
  }
}
