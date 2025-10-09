/**
 * WebGL Context Manager for FabricJS
 * Handles context loss detection, recovery, and state preservation
 */

import { FabricCanvas } from '@/app/fabricCanvas'
import { FabricObject } from 'fabric'

export interface WebGLContextState {
  canvasState: any
  objects: any[]
  viewportTransform: number[]
  zoom: number
  selection: any
  timestamp: number
}

export class WebGLContextManager {
  private canvas: FabricCanvas
  private savedState: WebGLContextState | null = null
  private contextLostHandler: EventListener
  private contextRestoredHandler: EventListener
  private isContextLost = false
  private retryCount = 0
  private maxRetries = 3
  private recoveryTimeout: number | null = null

  constructor(canvas: FabricCanvas) {
    this.canvas = canvas
    this.setupContextHandlers()
    this.attachEventListeners()
  }

  private setupContextHandlers() {
    this.contextLostHandler = (event: Event) => {
      console.warn('🚨 WebGL context lost detected')
      event.preventDefault()
      this.handleContextLost()
    }

    this.contextRestoredHandler = () => {
      console.log('✅ WebGL context restored')
      this.handleContextRestored()
    }
  }

  private attachEventListeners() {
    const canvasElement = this.canvas.lowerCanvasEl
    if (canvasElement) {
      canvasElement.addEventListener('webglcontextlost', this.contextLostHandler)
      canvasElement.addEventListener('webglcontextrestored', this.contextRestoredHandler)
    }

    // Also listen on upper canvas for touch interactions
    const upperCanvasElement = this.canvas.upperCanvasEl
    if (upperCanvasElement) {
      upperCanvasElement.addEventListener('webglcontextlost', this.contextLostHandler)
      upperCanvasElement.addEventListener('webglcontextrestored', this.contextRestoredHandler)
    }
  }

  private handleContextLost() {
    if (this.isContextLost) return

    this.isContextLost = true
    this.saveCanvasState()
    
    // Disable interactions during recovery
    this.canvas.selection = false
    this.canvas.evented = false
    
    // Emit custom event for UI feedback
    window.dispatchEvent(new CustomEvent('canvas:context-lost', {
      detail: { retryCount: this.retryCount }
    }))

    // Schedule recovery attempt
    this.scheduleRecovery()
  }

  private handleContextRestored() {
    if (!this.isContextLost) return

    this.isContextLost = false
    
    // Clear any pending recovery timeout
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout)
      this.recoveryTimeout = null
    }

    // Attempt to restore canvas state
    this.restoreCanvasState()
  }

  private saveCanvasState() {
    try {
      console.log('💾 Saving canvas state before context loss')
      
      const activeObject = this.canvas.getActiveObject()
      
      this.savedState = {
        canvasState: this.canvas.toJSON(['id', 'name', 'selectable', 'evented']),
        objects: this.canvas.getObjects().map(obj => ({
          id: obj.id,
          type: obj.type,
          data: obj.toObject(['id', 'name', 'selectable', 'evented'])
        })),
        viewportTransform: [...this.canvas.viewportTransform],
        zoom: this.canvas.getZoom(),
        selection: activeObject ? {
          id: activeObject.id,
          type: activeObject.type
        } : null,
        timestamp: Date.now()
      }

      console.log('✅ Canvas state saved successfully')
    } catch (error) {
      console.error('❌ Failed to save canvas state:', error)
    }
  }

  private async restoreCanvasState() {
    if (!this.savedState) {
      console.warn('⚠️ No saved state available for recovery')
      this.fallbackToCanvas2D()
      return
    }

    try {
      console.log('🔄 Restoring canvas state after context recovery')

      // Clear current canvas
      this.canvas.clear()

      // Restore canvas from saved JSON
      await this.canvas.loadFromJSON(this.savedState.canvasState)

      // Restore viewport transform
      this.canvas.setViewportTransform(this.savedState.viewportTransform)
      this.canvas.setZoom(this.savedState.zoom)

      // Restore selection if any
      if (this.savedState.selection) {
        const objToSelect = this.canvas.getObjects().find(
          obj => obj.id === this.savedState!.selection.id
        )
        if (objToSelect) {
          this.canvas.setActiveObject(objToSelect)
        }
      }

      // Re-enable interactions
      this.canvas.selection = true
      this.canvas.evented = true

      // Render the restored canvas
      this.canvas.requestRenderAll()

      // Reset retry count on successful recovery
      this.retryCount = 0

      // Emit recovery success event
      window.dispatchEvent(new CustomEvent('canvas:context-restored', {
        detail: { success: true, timestamp: this.savedState.timestamp }
      }))

      console.log('✅ Canvas state restored successfully')

    } catch (error) {
      console.error('❌ Failed to restore canvas state:', error)
      this.handleRecoveryFailure()
    }
  }

  private scheduleRecovery() {
    // Progressive delay for retry attempts
    const delay = Math.min(500 * Math.pow(2, this.retryCount), 5000)
    
    this.recoveryTimeout = setTimeout(() => {
      this.attemptRecovery()
    }, delay)
  }

  private async attemptRecovery() {
    this.retryCount++
    
    if (this.retryCount > this.maxRetries) {
      console.error('❌ Max recovery attempts reached, falling back to Canvas2D')
      this.fallbackToCanvas2D()
      return
    }

    console.log(`🔄 Attempting recovery ${this.retryCount}/${this.maxRetries}`)

    try {
      // Try to reinitialize WebGL context
      await this.reinitializeWebGL()
      
      // If successful, restore state
      if (!this.isContextLost) {
        this.restoreCanvasState()
      }
    } catch (error) {
      console.error(`❌ Recovery attempt ${this.retryCount} failed:`, error)
      this.scheduleRecovery()
    }
  }

  private async reinitializeWebGL() {
    try {
      // Force WebGL context recreation
      const canvas = this.canvas.lowerCanvasEl
      if (canvas) {
        const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })
        if (gl) {
          // Check if context is working
          const isContextValid = !gl.isContextLost()
          if (isContextValid) {
            console.log('✅ WebGL context successfully reinitialized')
            this.isContextLost = false
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to reinitialize WebGL:', error)
      throw error
    }
  }

  private fallbackToCanvas2D() {
    console.warn('⚠️ Falling back to Canvas2D renderer')
    
    try {
      // Create new canvas with Canvas2D renderer
      const newCanvas = new FabricCanvas(this.canvas.lowerCanvasEl, {
        width: this.canvas.width,
        height: this.canvas.height,
        renderOnAddRemove: false,
        renderer: undefined // This forces Canvas2D
      })

      // Restore state to new canvas if available
      if (this.savedState) {
        newCanvas.loadFromJSON(this.savedState.canvasState)
        newCanvas.setViewportTransform(this.savedState.viewportTransform)
        newCanvas.setZoom(this.savedState.zoom)
      }

      // Re-enable interactions
      newCanvas.selection = true
      newCanvas.evented = true
      newCanvas.requestRenderAll()

      // Emit fallback event
      window.dispatchEvent(new CustomEvent('canvas:fallback-to-2d', {
        detail: { reason: 'webgl-context-loss' }
      }))

      console.log('✅ Successfully fell back to Canvas2D')

    } catch (error) {
      console.error('❌ Failed to fallback to Canvas2D:', error)
      
      // Last resort: reload the page
      window.dispatchEvent(new CustomEvent('canvas:critical-error', {
        detail: { error: error.message }
      }))
    }
  }

  private handleRecoveryFailure() {
    console.error('❌ Canvas recovery failed completely')
    
    // Emit recovery failure event
    window.dispatchEvent(new CustomEvent('canvas:recovery-failed', {
      detail: { retryCount: this.retryCount }
    }))

    // Attempt fallback
    this.fallbackToCanvas2D()
  }

  public forceContextLoss() {
    // For testing purposes - simulate context loss
    const canvas = this.canvas.lowerCanvasEl
    if (canvas) {
      const gl = canvas.getContext('webgl')
      if (gl) {
        const loseContext = gl.getExtension('WEBGL_lose_context')
        if (loseContext) {
          loseContext.loseContext()
        }
      }
    }
  }

  public getContextInfo() {
    const canvas = this.canvas.lowerCanvasEl
    if (!canvas) return null

    const gl = canvas.getContext('webgl')
    if (!gl) return null

    return {
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      isContextLost: gl.isContextLost(),
      hasLoseContextExtension: !!gl.getExtension('WEBGL_lose_context')
    }
  }

  public cleanup() {
    // Clear recovery timeout
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout)
    }

    // Remove event listeners
    const canvasElement = this.canvas.lowerCanvasEl
    if (canvasElement) {
      canvasElement.removeEventListener('webglcontextlost', this.contextLostHandler)
      canvasElement.removeEventListener('webglcontextrestored', this.contextRestoredHandler)
    }

    const upperCanvasElement = this.canvas.upperCanvasEl
    if (upperCanvasElement) {
      upperCanvasElement.removeEventListener('webglcontextlost', this.contextLostHandler)
      upperCanvasElement.removeEventListener('webglcontextrestored', this.contextRestoredHandler)
    }

    // Clear saved state
    this.savedState = null
  }
}