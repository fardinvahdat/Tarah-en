// Fabric.js Canvas cleanup utilities to prevent memory leaks
import { Canvas, FabricObject } from 'fabric'

export class FabricCanvasCleanup {
  private canvas: Canvas | null = null
  private eventListeners: Map<string, Function[]> = new Map()
  private cleanupInterval?: number

  constructor(canvas: Canvas) {
    this.canvas = canvas
    this.setupCleanupListeners()
  }

  private setupCleanupListeners() {
    // Listen for cleanup events
    window.addEventListener('memory:cleanup', this.performCleanup.bind(this))
    window.addEventListener('canvas:cleanup-cache', this.clearCanvasCache.bind(this))
    window.addEventListener('beforeunload', this.cleanup.bind(this))
    
    // Smart periodic cleanup - only when needed
    this.cleanupInterval = setInterval(() => {
      this.performSmartCleanup()
    }, 600000) // Every 10 minutes (reduced frequency)
  }

  addEventListenerTracking(eventName: string, handler: Function) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, [])
    }
    this.eventListeners.get(eventName)!.push(handler)
  }

  removeEventListenerTracking(eventName: string, handler: Function) {
    const handlers = this.eventListeners.get(eventName)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  performCleanup() {
    console.log('🧹 Performing Fabric.js canvas cleanup...')
    
    if (!this.canvas) return

    try {
      // Clear selection to prevent memory leaks
      this.canvas.discardActiveObject()
      
      // Dispose of invisible objects
      this.removeInvisibleObjects()
      
      // Clear cached textures
      this.clearTextureCache()
      
      // Force garbage collection on fabric objects
      this.canvas.requestRenderAll()
      
    } catch (error) {
      console.error('Error during canvas cleanup:', error)
    }
  }

  performPeriodicCleanup() {
    if (!this.canvas) return

    const objectCount = this.canvas.getObjects().length
    
    // Only cleanup if we have many objects
    if (objectCount > 100) {
      console.log('📦 Performing periodic object cleanup...')
      this.removeOffscreenObjects()
    }
  }

  performSmartCleanup() {
    if (!this.canvas) return

    // Check memory usage before cleanup
    const memoryEstimate = this.getMemoryEstimate()
    const objectCount = this.canvas.getObjects().length
    
    // Only cleanup if memory usage is high OR too many objects
    if (memoryEstimate > 50 * 1024 * 1024 || objectCount > 150) { // 50MB or 150+ objects
      console.log('🧠 Smart cleanup triggered - Memory:', memoryEstimate, 'Objects:', objectCount)
      this.performPeriodicCleanup()
    } else {
      console.log('✅ Smart cleanup skipped - Memory OK:', memoryEstimate, 'Objects:', objectCount)
    }
  }

  private removeInvisibleObjects() {
    if (!this.canvas) return

    const objects = this.canvas.getObjects()
    const toRemove: FabricObject[] = []

    objects.forEach(obj => {
      if (!obj.visible || obj.opacity === 0) {
        toRemove.push(obj)
      }
    })

    toRemove.forEach(obj => {
      this.canvas!.remove(obj)
      this.disposeObject(obj)
    })

    if (toRemove.length > 0) {
      console.log(`🗑️ Removed ${toRemove.length} invisible objects`)
    }
  }

  private removeOffscreenObjects() {
    if (!this.canvas) return

    const objects = this.canvas.getObjects()
    const viewport = this.canvas.viewportTransform
    const canvasWidth = this.canvas.width || 0
    const canvasHeight = this.canvas.height || 0
    const toRemove: FabricObject[] = []

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect(true)
      
      // Check if object is far offscreen
      const margin = 1000 // 1000px margin
      if (bounds.left > canvasWidth + margin ||
          bounds.top > canvasHeight + margin ||
          bounds.left + bounds.width < -margin ||
          bounds.top + bounds.height < -margin) {
        toRemove.push(obj)
      }
    })

    // Only remove if we have too many offscreen objects
    if (toRemove.length > 10) {
      const removeCount = Math.min(5, toRemove.length)
      for (let i = 0; i < removeCount; i++) {
        this.canvas.remove(toRemove[i])
        this.disposeObject(toRemove[i])
      }
      console.log(`🔄 Removed ${removeCount} offscreen objects`)
    }
  }

  private clearTextureCache() {
    // Clear any cached images/textures
    if (this.canvas && 'textureCache' in this.canvas) {
      (this.canvas as any).textureCache = {}
    }
  }

  private clearCanvasCache() {
    if (!this.canvas) return
    
    try {
      // Clear fabric's internal caches
      (this.canvas as any).clearCache?.()
      
      // Clear render cache
      this.canvas.requestRenderAll()
      
      console.log('🖼️ Canvas cache cleared')
    } catch (error) {
      console.warn('Error clearing canvas cache:', error)
    }
  }

  private disposeObject(obj: FabricObject) {
    try {
      // Clear any image sources
      if ('_originalElement' in obj && obj._originalElement) {
        const element = obj._originalElement as any
        if (element.src && element.src.startsWith('blob:')) {
          URL.revokeObjectURL(element.src)
        }
      }

      // Dispose of object properly
      if (typeof obj.dispose === 'function') {
        obj.dispose()
      }

      // Clear references
      obj.canvas = null as any
    } catch (error) {
      console.warn('Error disposing fabric object:', error)
    }
  }

  cleanup() {
    console.log('🧽 Final fabric canvas cleanup...')
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Remove all tracked event listeners
    this.eventListeners.forEach((handlers, eventName) => {
      handlers.forEach(handler => {
        this.canvas?.off(eventName as any, handler as any)
      })
    })

    this.eventListeners.clear()

    // Final cleanup
    if (this.canvas) {
      this.performCleanup()
      
      // Clear all objects
      this.canvas.clear()
      
      // Dispose canvas
      this.canvas.dispose()
    }

    this.canvas = null
  }

  // Helper method to get memory usage estimate
  getMemoryEstimate(): number {
    if (!this.canvas) return 0
    
    const objects = this.canvas.getObjects()
    let estimate = 0
    
    objects.forEach(obj => {
      // Rough estimate based on object type
      if (obj.type === 'image') {
        estimate += 1024 * 1024 // ~1MB per image
      } else if (obj.type === 'textbox' || obj.type === 'text') {
        estimate += 10 * 1024 // ~10KB per text
      } else {
        estimate += 50 * 1024 // ~50KB per other object
      }
    })
    
    return estimate
  }
}

// Global cleanup manager
let globalCanvasCleanup: FabricCanvasCleanup | null = null

export function initFabricCanvasCleanup(canvas: Canvas) {
  if (globalCanvasCleanup) {
    globalCanvasCleanup.cleanup()
  }
  
  globalCanvasCleanup = new FabricCanvasCleanup(canvas)
  return globalCanvasCleanup
}

export function getFabricCanvasCleanup(): FabricCanvasCleanup | null {
  return globalCanvasCleanup
}