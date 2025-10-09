/**
 * Safari-specific Performance Optimizer
 * Addresses Safari's unique rendering and memory management characteristics
 */

import { Canvas, FabricObject } from 'fabric'

interface SafariOptimizationConfig {
  enableAggressiveOptimization: boolean
  maxImageSize: number
  disableWebGL: boolean
  reduceQuality: boolean
}

export class SafariOptimizer {
  private canvas: Canvas | null = null
  private isSafari: boolean
  private config: SafariOptimizationConfig
  private originalMethods: Map<string, Function> = new Map()
  private isInitialized = false

  constructor(canvas?: Canvas, config?: Partial<SafariOptimizationConfig>) {
    this.canvas = canvas || null
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    this.config = {
      enableAggressiveOptimization: this.isSafari,
      maxImageSize: 2048 * 2048, // 4MP max for Safari
      disableWebGL: this.isSafari,
      reduceQuality: this.isSafari,
      ...config
    }

    if (this.isSafari) {
      this.initializeSafariOptimizations()
    }
  }

  private initializeSafariOptimizations() {
    console.log('🦁 Initializing Safari-specific optimizations')
    
    // Set up Safari-specific event handlers
    this.setupSafariEventHandlers()
    
    // Apply Safari-specific canvas settings
    this.applySafariCanvasSettings()
  }

  private setupSafariEventHandlers() {
    if (!this.canvas || !this.isSafari) return

    // Optimize selection events for Safari
    this.canvas.on('selection:created', (e) => {
      if (e.selected && e.selected.length === 1) {
        const obj = e.selected[0]
        if (obj.type === 'image') {
          // Disable expensive operations for images in Safari
          obj.set({
            objectCaching: false,
            perPixelTargetFind: false,
            selectable: true,
            evented: true
          })
        }
      }
    })

    // Handle WebGL context loss in Safari
    this.canvas.on('webgl:context-lost', () => {
      console.log('🔄 Safari WebGL context lost, recovering...')
      this.handleWebGLContextLoss()
    })

    // Optimize touch events for Safari
    this.canvas.on('mouse:down', (e) => {
      if (e.e.type === 'touchstart') {
        // Disable expensive operations during touch
        this.canvas?.set({
          skipTargetFind: true,
          selection: false
        })
      }
    })

    this.canvas.on('mouse:up', (e) => {
      if (e.e.type === 'touchend') {
        // Re-enable features after touch
        setTimeout(() => {
          this.canvas?.set({
            skipTargetFind: false,
            selection: true
          })
        }, 100)
      }
    })

    // CRITICAL: Handle object:added to ensure proper initialization
    this.canvas.on('object:added', (e) => {
      if (e.target && this.isSafari) {
        // Ensure object is properly initialized before applying optimizations
        setTimeout(() => {
          if (e.target && e.target.type === 'image') {
            e.target.set({
              objectCaching: false,
              perPixelTargetFind: false,
              selectable: true,
              evented: true
            })
          }
        }, 50)
      }
    })
  }

  private applySafariCanvasSettings() {
    if (!this.canvas || !this.isSafari) return

    this.canvas.set({
      renderOnAddRemove: false,
      skipTargetFind: false,
      perPixelTargetFind: false, // Critical for Safari
      // enableRetinaScaling: false, // Reduce pixel density
      imageSmoothingEnabled: false, // Reduce GPU load
      selection: true,
      preserveObjectStacking: true,
      allowTouchScrolling: false // Disable touch scrolling in Safari
    })
  }

  private handleWebGLContextLoss() {
    if (!this.canvas) return

    // Clear any cached data
    if ('clearCache' in this.canvas) {
      (this.canvas as any).clearCache()
    }
    
    // Force re-render after a delay
    setTimeout(() => {
      this.canvas?.requestRenderAll()
    }, 100)

    // Re-apply Safari settings
    this.applySafariCanvasSettings()
  }

  public optimizeImageForSafari(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!this.isSafari) {
        resolve(file)
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate optimal size for Safari
        const maxDimension = 2048
        let { width, height } = img

        if (width > maxDimension || height > maxDimension) {
          const aspectRatio = width / height
          if (width > height) {
            width = maxDimension
            height = width / aspectRatio
          } else {
            height = maxDimension
            width = height * aspectRatio
          }
        }

        canvas.width = width
        canvas.height = height

        // Apply Safari-specific rendering settings
        ctx!.imageSmoothingEnabled = false
        ctx!.drawImage(img, 0, 0, width, height)

        // Convert to blob with reduced quality
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: file.lastModified
            })
            resolve(optimizedFile)
          } else {
            reject(new Error('Failed to optimize image'))
          }
        }, 'image/jpeg', 0.7) // Reduced quality for Safari
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  public setCanvas(canvas: Canvas) {
    this.canvas = canvas
    if (this.isSafari) {
      this.setupSafariEventHandlers()
      this.applySafariCanvasSettings()
      this.isInitialized = true
    }
  }

  public getOptimizationStats() {
    return {
      isSafari: this.isSafari,
      aggressiveOptimization: this.config.enableAggressiveOptimization,
      maxImageSize: this.config.maxImageSize,
      disableWebGL: this.config.disableWebGL,
      reduceQuality: this.config.reduceQuality,
      isInitialized: this.isInitialized
    }
  }

  public dispose() {
    this.originalMethods.clear()
    this.canvas = null
    this.isInitialized = false
  }
}

// Singleton instance
export const safariOptimizer = new SafariOptimizer() 