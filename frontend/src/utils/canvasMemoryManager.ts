// Canvas-specific memory management to prevent reloads
import { FabricObject } from 'fabric'

interface MemoryStats {
  objectCount: number
  estimatedMemoryMB: number
  cacheSize: number
  lastCleanup: number
}

class CanvasMemoryManager {
  private objectCache = new Map<string, any>()
  private imageCache = new Map<string, HTMLImageElement>()
  private disposalQueue: FabricObject[] = []
  private memoryStats: MemoryStats = {
    objectCount: 0,
    estimatedMemoryMB: 0,
    cacheSize: 0,
    lastCleanup: Date.now()
  }

  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB
  private readonly MAX_OBJECTS = 1000
  private readonly CLEANUP_INTERVAL = 60000 // 1 minute

  init() {
    console.log('🧠 Initializing Canvas Memory Manager...')
    
    // Start periodic cleanup
    setInterval(() => {
      this.performPeriodicCleanup()
    }, this.CLEANUP_INTERVAL)

    // Listen for cleanup events
    window.addEventListener('memory:cleanup', () => {
      this.performDeepCleanup()
    })

    window.addEventListener('memory:emergency-cleanup', () => {
      this.performEmergencyCleanup()
    })

    window.addEventListener('canvas:cleanup-cache', () => {
      this.clearImageCache()
    })

    // Monitor memory usage
    this.startMemoryMonitoring()
  }

  addObject(obj: FabricObject) {
    this.memoryStats.objectCount++
    this.updateMemoryEstimate()

    // Add to disposal queue if we have too many objects
    if (this.memoryStats.objectCount > this.MAX_OBJECTS) {
      this.performObjectCleanup()
    }
  }

  removeObject(obj: FabricObject) {
    this.memoryStats.objectCount = Math.max(0, this.memoryStats.objectCount - 1)
    this.updateMemoryEstimate()

    // Properly dispose of the object
    this.disposeObject(obj)
  }

  cacheImage(url: string, image: HTMLImageElement) {
    // Check cache size before adding
    if (this.getCurrentCacheSize() > this.MAX_CACHE_SIZE) {
      this.clearOldestCacheEntries()
    }

    this.imageCache.set(url, image)
    this.memoryStats.cacheSize = this.getCurrentCacheSize()
  }

  getCachedImage(url: string): HTMLImageElement | undefined {
    return this.imageCache.get(url)
  }

  private performPeriodicCleanup() {
    const now = Date.now()
    const timeSinceLastCleanup = now - this.memoryStats.lastCleanup

    // Only cleanup if enough time has passed AND memory usage is high
    if (timeSinceLastCleanup > this.CLEANUP_INTERVAL) {
      const memoryPercent = this.memoryStats.estimatedMemoryMB / 100; // Rough percentage
      
      if (memoryPercent > 70 || this.memoryStats.objectCount > 200) {
        console.log('🧹 Performing memory-triggered cleanup - Usage:', memoryPercent + '%')
        this.clearOldestCacheEntries(0.2) // Clear 20% of cache
        this.processDisposalQueue()
        this.memoryStats.lastCleanup = now
      } else {
        console.log('✅ Periodic cleanup skipped - Memory OK:', memoryPercent + '%')
        this.memoryStats.lastCleanup = now // Update timestamp anyway
      }
    }
  }

  private performDeepCleanup() {
    console.log('🧽 Performing deep canvas cleanup...')
    
    // Clear 50% of cache
    this.clearOldestCacheEntries(0.5)
    
    // Process all disposal queue
    this.processDisposalQueue()
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc()
    }
    
    this.memoryStats.lastCleanup = Date.now()
  }

  private performEmergencyCleanup() {
    console.log('🚨 Performing emergency canvas cleanup...')
    
    // Clear entire cache
    this.clearImageCache()
    
    // Dispose all queued objects immediately
    this.processDisposalQueue()
    
    // Try to free up canvas resources
    this.freeCanvasResources()
    
    this.memoryStats.lastCleanup = Date.now()
  }

  private performObjectCleanup() {
    console.log('📦 Performing object cleanup...')
    
    // Find objects that can be safely removed
    const canvas = this.getCanvasInstance()
    if (!canvas) return

    const objects = canvas.getObjects()
    const nonEssentialObjects = objects.filter(obj => 
      !obj.visible || 
      obj.opacity === 0 || 
      this.isOffscreen(obj)
    )

    // Remove some non-essential objects
    const toRemove = nonEssentialObjects.slice(0, Math.min(10, nonEssentialObjects.length))
    toRemove.forEach(obj => {
      canvas.remove(obj)
      this.disposeObject(obj)
    })
  }

  private disposeObject(obj: FabricObject) {
    try {
      // Clear any image sources
      if ('src' in obj && obj.src) {
        if (typeof obj.src === 'string' && obj.src.startsWith('blob:')) {
          URL.revokeObjectURL(obj.src)
        }
      }

      // Call object's dispose method if available
      if (typeof obj.dispose === 'function') {
        obj.dispose()
      }

      // Clear references
      obj.canvas = null
    } catch (error) {
      console.warn('Error disposing object:', error)
    }
  }

  private clearImageCache() {
    console.log('🖼️ Clearing image cache...')
    
    // Revoke blob URLs to free memory
    this.imageCache.forEach((image, url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })

    this.imageCache.clear()
    this.memoryStats.cacheSize = 0
  }

  private clearOldestCacheEntries(percentage: number = 0.3) {
    const entriesToRemove = Math.floor(this.imageCache.size * percentage)
    const entries = Array.from(this.imageCache.entries())
    
    // Remove oldest entries (assuming insertion order)
    for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
      const [url] = entries[i]
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
      this.imageCache.delete(url)
    }

    this.memoryStats.cacheSize = this.getCurrentCacheSize()
  }

  private processDisposalQueue() {
    const toDispose = this.disposalQueue.splice(0, 10) // Dispose max 10 per cycle
    toDispose.forEach(obj => this.disposeObject(obj))
  }

  private getCurrentCacheSize(): number {
    // Rough estimation of cache size
    return this.imageCache.size * 100 * 1024 // Assume ~100KB per image
  }

  private updateMemoryEstimate() {
    // Rough estimation: 50KB per object + cache size
    this.memoryStats.estimatedMemoryMB = 
      (this.memoryStats.objectCount * 50 * 1024 + this.memoryStats.cacheSize) / (1024 * 1024)
  }

  private isOffscreen(obj: FabricObject): boolean {
    const canvas = this.getCanvasInstance()
    if (!canvas) return false

    const viewport = canvas.viewportTransform
    if (!viewport) return false

    const objBounds = obj.getBoundingRect()
    const canvasWidth = canvas.width || 0
    const canvasHeight = canvas.height || 0

    return objBounds.left > canvasWidth || 
           objBounds.top > canvasHeight ||
           objBounds.left + objBounds.width < 0 ||
           objBounds.top + objBounds.height < 0
  }

  private freeCanvasResources() {
    const canvas = this.getCanvasInstance()
    if (!canvas) return

    try {
      // Clear canvas context
      const ctx = canvas.getContext()
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width || 0, canvas.height || 0)
      }

      // Force garbage collection on canvas
      canvas.requestRenderAll()
    } catch (error) {
      console.warn('Error freeing canvas resources:', error)
    }
  }

  private getCanvasInstance() {
    // You'll need to adapt this to your canvas instance access method
    return window.canvas || null
  }

  private startMemoryMonitoring() {
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usagePercent = memory.usedJSHeapSize / memory.jsHeapSizeLimit
        
        if (usagePercent > 0.7) {
          console.warn('Canvas memory usage high:', usagePercent)
          this.performDeepCleanup()
        }
      }
    }, 30000)
  }

  getMemoryStats(): MemoryStats {
    return { ...this.memoryStats }
  }

  forceCleanup() {
    this.performDeepCleanup()
  }
}

export const canvasMemoryManager = new CanvasMemoryManager()