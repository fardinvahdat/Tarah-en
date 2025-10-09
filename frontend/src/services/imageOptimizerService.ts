/**
 * Image Optimizer Service for Mobile Performance
 * Handles adaptive quality loading, memory classification, and resource pooling
 */

import { FabricImage } from 'fabric'

export interface ImageClassification {
  size: 'small' | 'medium' | 'large' | 'extra-large'
  complexity: 'low' | 'medium' | 'high'
  memoryImpact: 'minimal' | 'moderate' | 'high' | 'critical'
  recommendedQuality: number
  shouldUseWebGL: boolean
  cacheStrategy: 'aggressive' | 'standard' | 'minimal' | 'none'
}

export interface OptimizedImageData {
  original: HTMLImageElement | HTMLCanvasElement
  optimized: HTMLImageElement | HTMLCanvasElement
  thumbnail: HTMLCanvasElement
  classification: ImageClassification
  memoryUsage: number
  loadTime: number
}

export class ImageOptimizerService {
  private imagePool: Map<string, OptimizedImageData> = new Map()
  private memoryThreshold = 50 * 1024 * 1024 // 50MB
  private maxPoolSize = 20
  private qualitySettings = {
    mobile: { low: 0.3, medium: 0.5, high: 0.7 },
    desktop: { low: 0.5, medium: 0.7, high: 0.9 }
  }

  constructor() {
    this.detectDeviceCapabilities()
    this.setupMemoryMonitoring()
  }

  private detectDeviceCapabilities() {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    
    if (gl) {
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
      const renderer = gl.getParameter(gl.RENDERER).toLowerCase()
      
      // Adjust thresholds based on device capabilities
      if (renderer.includes('adreno') || renderer.includes('mali')) {
        // Mobile GPU detected
        this.memoryThreshold = 30 * 1024 * 1024 // 30MB for mobile
        this.maxPoolSize = 10
      }
    }
  }

  private setupMemoryMonitoring() {
    // Monitor memory usage and clean up when needed
    setInterval(() => {
      this.checkMemoryPressure()
    }, 5000)

    // Listen for memory pressure events
    window.addEventListener('memory:emergency-cleanup', () => {
      this.emergencyCleanup()
    })
  }

  public async optimizeImage(
    imageElement: HTMLImageElement | HTMLCanvasElement,
    options?: {
      forceQuality?: number
      skipCaching?: boolean
      targetWidth?: number
      targetHeight?: number
    }
  ): Promise<OptimizedImageData> {
    const startTime = performance.now()
    const imageId = this.generateImageId(imageElement)

    // Check if already optimized and cached
    if (!options?.skipCaching && this.imagePool.has(imageId)) {
      return this.imagePool.get(imageId)!
    }

    // Classify the image
    const classification = this.classifyImage(imageElement)
    
    // Create optimized version
    const optimized = await this.createOptimizedVersion(imageElement, classification, options)
    
    // Create thumbnail for preview
    const thumbnail = this.createThumbnail(imageElement)
    
    // Calculate memory usage
    const memoryUsage = this.calculateMemoryUsage(optimized)
    
    const optimizedData: OptimizedImageData = {
      original: imageElement,
      optimized,
      thumbnail,
      classification,
      memoryUsage,
      loadTime: performance.now() - startTime
    }

    // Cache if memory allows
    if (!options?.skipCaching && this.shouldCache(optimizedData)) {
      this.addToPool(imageId, optimizedData)
    }

    return optimizedData
  }

  public classifyImage(imageElement: HTMLImageElement | HTMLCanvasElement): ImageClassification {
    const width = imageElement.width || (imageElement as HTMLImageElement).naturalWidth
    const height = imageElement.height || (imageElement as HTMLImageElement).naturalHeight
    const pixelCount = width * height
    const fileSize = this.estimateFileSize(imageElement)

    // Size classification
    let size: ImageClassification['size'] = 'small'
    if (pixelCount > 4000000) size = 'extra-large' // > 4MP
    else if (pixelCount > 2000000) size = 'large' // > 2MP
    else if (pixelCount > 500000) size = 'medium' // > 0.5MP

    // Complexity classification (based on estimated compression)
    let complexity: ImageClassification['complexity'] = 'low'
    if (fileSize > 2000000) complexity = 'high' // > 2MB
    else if (fileSize > 500000) complexity = 'medium' // > 500KB

    // Memory impact
    let memoryImpact: ImageClassification['memoryImpact'] = 'minimal'
    const estimatedMemory = pixelCount * 4 // RGBA
    if (estimatedMemory > 16000000) memoryImpact = 'critical' // > 16MB
    else if (estimatedMemory > 8000000) memoryImpact = 'high' // > 8MB
    else if (estimatedMemory > 4000000) memoryImpact = 'moderate' // > 4MB

    // Quality recommendation
    const isMobile = this.isMobileDevice()
    let recommendedQuality = 0.7
    
    if (isMobile) {
      if (size === 'extra-large') recommendedQuality = 0.3
      else if (size === 'large') recommendedQuality = 0.4
      else if (size === 'medium') recommendedQuality = 0.5
    } else {
      if (size === 'extra-large') recommendedQuality = 0.5
      else if (size === 'large') recommendedQuality = 0.6
      else if (size === 'medium') recommendedQuality = 0.7
    }

    // WebGL recommendation
    const shouldUseWebGL = memoryImpact !== 'critical' && !this.isLowEndDevice()

    // Cache strategy
    let cacheStrategy: ImageClassification['cacheStrategy'] = 'standard'
    if (memoryImpact === 'critical') cacheStrategy = 'none'
    else if (memoryImpact === 'high') cacheStrategy = 'minimal'
    else if (size === 'small' && complexity === 'low') cacheStrategy = 'aggressive'

    return {
      size,
      complexity,
      memoryImpact,
      recommendedQuality,
      shouldUseWebGL,
      cacheStrategy
    }
  }

  private async createOptimizedVersion(
    imageElement: HTMLImageElement | HTMLCanvasElement,
    classification: ImageClassification,
    options?: any
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    const originalWidth = imageElement.width || (imageElement as HTMLImageElement).naturalWidth
    const originalHeight = imageElement.height || (imageElement as HTMLImageElement).naturalHeight

    // Calculate optimal dimensions
    const { width, height } = this.calculateOptimalDimensions(
      originalWidth, 
      originalHeight, 
      classification,
      options
    )

    canvas.width = width
    canvas.height = height

    // Apply optimization settings
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = classification.memoryImpact === 'critical' ? 'low' : 'high'

    // Draw optimized image
    ctx.drawImage(imageElement, 0, 0, width, height)

    // Apply additional optimizations for mobile
    if (this.isMobileDevice() && classification.memoryImpact === 'high') {
      return this.applyMobileOptimizations(canvas, classification)
    }

    return canvas
  }

  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    classification: ImageClassification,
    options?: any
  ): { width: number; height: number } {
    let width = originalWidth
    let height = originalHeight

    // Apply target dimensions if provided
    if (options?.targetWidth || options?.targetHeight) {
      const aspectRatio = originalWidth / originalHeight
      if (options.targetWidth) {
        width = options.targetWidth
        height = width / aspectRatio
      } else if (options.targetHeight) {
        height = options.targetHeight
        width = height * aspectRatio
      }
      return { width: Math.round(width), height: Math.round(height) }
    }

    // Apply size-based optimizations
    const maxDimensions = this.getMaxDimensions(classification)
    
    if (width > maxDimensions.width || height > maxDimensions.height) {
      const aspectRatio = width / height
      
      if (width > height) {
        width = maxDimensions.width
        height = width / aspectRatio
      } else {
        height = maxDimensions.height
        width = height * aspectRatio
      }
    }

    return { width: Math.round(width), height: Math.round(height) }
  }

  private getMaxDimensions(classification: ImageClassification) {
    const isMobile = this.isMobileDevice()
    
    if (isMobile) {
      switch (classification.memoryImpact) {
        case 'critical': return { width: 1024, height: 1024 }
        case 'high': return { width: 1536, height: 1536 }
        case 'moderate': return { width: 2048, height: 2048 }
        default: return { width: 2560, height: 2560 }
      }
    } else {
      switch (classification.memoryImpact) {
        case 'critical': return { width: 2048, height: 2048 }
        case 'high': return { width: 3072, height: 3072 }
        case 'moderate': return { width: 4096, height: 4096 }
        default: return { width: 8192, height: 8192 }
      }
    }
  }

  private applyMobileOptimizations(
    canvas: HTMLCanvasElement, 
    classification: ImageClassification
  ): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')!
    
    // Reduce color depth for critical memory situations
    if (classification.memoryImpact === 'critical') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      // Reduce color depth (quantize colors)
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.floor(data[i] / 32) * 32     // Red
        data[i + 1] = Math.floor(data[i + 1] / 32) * 32 // Green
        data[i + 2] = Math.floor(data[i + 2] / 32) * 32 // Blue
        // Alpha remains unchanged
      }
      
      ctx.putImageData(imageData, 0, 0)
    }

    return canvas
  }

  private createThumbnail(imageElement: HTMLImageElement | HTMLCanvasElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    const thumbnailSize = 128
    canvas.width = thumbnailSize
    canvas.height = thumbnailSize
    
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    const originalWidth = imageElement.width || (imageElement as HTMLImageElement).naturalWidth
    const originalHeight = imageElement.height || (imageElement as HTMLImageElement).naturalHeight
    
    // Calculate aspect ratio preserving dimensions
    const aspectRatio = originalWidth / originalHeight
    let drawWidth = thumbnailSize
    let drawHeight = thumbnailSize
    let offsetX = 0
    let offsetY = 0
    
    if (aspectRatio > 1) {
      drawHeight = thumbnailSize / aspectRatio
      offsetY = (thumbnailSize - drawHeight) / 2
    } else {
      drawWidth = thumbnailSize * aspectRatio
      offsetX = (thumbnailSize - drawWidth) / 2
    }
    
    ctx.drawImage(imageElement, offsetX, offsetY, drawWidth, drawHeight)
    
    return canvas
  }

  private generateImageId(imageElement: HTMLImageElement | HTMLCanvasElement): string {
    // Generate a unique ID based on image properties
    const width = imageElement.width || (imageElement as HTMLImageElement).naturalWidth
    const height = imageElement.height || (imageElement as HTMLImageElement).naturalHeight
    const src = (imageElement as HTMLImageElement).src || 'canvas'
    
    return `${src}-${width}x${height}-${Date.now()}`
  }

  private estimateFileSize(imageElement: HTMLImageElement | HTMLCanvasElement): number {
    // Rough estimation based on dimensions and type
    const width = imageElement.width || (imageElement as HTMLImageElement).naturalWidth
    const height = imageElement.height || (imageElement as HTMLImageElement).naturalHeight
    const pixelCount = width * height
    
    // Assume JPEG compression ratio of ~10:1 for photos
    return pixelCount * 0.4 // bytes per pixel estimation
  }

  private calculateMemoryUsage(element: HTMLImageElement | HTMLCanvasElement): number {
    const width = element.width || (element as HTMLImageElement).naturalWidth
    const height = element.height || (element as HTMLImageElement).naturalHeight
    return width * height * 4 // RGBA bytes
  }

  private shouldCache(optimizedData: OptimizedImageData): boolean {
    if (optimizedData.classification.cacheStrategy === 'none') return false
    
    const currentMemoryUsage = this.getCurrentPoolMemoryUsage()
    const wouldExceedThreshold = currentMemoryUsage + optimizedData.memoryUsage > this.memoryThreshold
    
    if (wouldExceedThreshold && this.imagePool.size >= this.maxPoolSize) {
      this.cleanupLeastUsed()
    }
    
    return optimizedData.classification.cacheStrategy !== 'none'
  }

  private addToPool(imageId: string, optimizedData: OptimizedImageData): void {
    // Remove oldest if at capacity
    if (this.imagePool.size >= this.maxPoolSize) {
      const oldestKey = this.imagePool.keys().next().value
      this.imagePool.delete(oldestKey)
    }
    
    this.imagePool.set(imageId, optimizedData)
  }

  private getCurrentPoolMemoryUsage(): number {
    let total = 0
    for (const data of this.imagePool.values()) {
      total += data.memoryUsage
    }
    return total
  }

  private cleanupLeastUsed(): void {
    // Remove half of the cached images (simple FIFO for now)
    const keysToRemove = Array.from(this.imagePool.keys()).slice(0, Math.floor(this.imagePool.size / 2))
    keysToRemove.forEach(key => this.imagePool.delete(key))
  }

  private checkMemoryPressure(): void {
    const currentUsage = this.getCurrentPoolMemoryUsage()
    const usagePercentage = currentUsage / this.memoryThreshold
    
    if (usagePercentage > 0.9) {
      console.warn('⚠️ High memory usage in image pool:', usagePercentage.toFixed(2))
      this.emergencyCleanup()
    }
  }

  private emergencyCleanup(): void {
    console.log('🧹 Emergency cleanup of image pool')
    
    // Remove all non-essential cached images
    const entriesToKeep = Array.from(this.imagePool.entries())
      .filter(([_, data]) => data.classification.cacheStrategy === 'aggressive')
      .slice(0, 5) // Keep only 5 most important ones
    
    this.imagePool.clear()
    entriesToKeep.forEach(([key, data]) => this.imagePool.set(key, data))
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc()
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  private isLowEndDevice(): boolean {
    // Simple heuristic based on available features
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    
    if (!gl) return true
    
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
    const renderer = gl.getParameter(gl.RENDERER).toLowerCase()
    
    // Check for low-end mobile GPUs
    const lowEndGPUs = ['adreno 3', 'adreno 4', 'mali-4', 'mali-t6', 'mali-t7', 'powervr sgx']
    const isLowEndGPU = lowEndGPUs.some(gpu => renderer.includes(gpu))
    
    return maxTextureSize < 2048 || isLowEndGPU
  }

  public getOptimizedImageForFabric(fabricImage: FabricImage): Promise<OptimizedImageData> {
    return this.optimizeImage(fabricImage.getElement() as HTMLImageElement)
  }

  public clearPool(): void {
    this.imagePool.clear()
  }

  public getPoolStats() {
    return {
      size: this.imagePool.size,
      memoryUsage: this.getCurrentPoolMemoryUsage(),
      memoryThreshold: this.memoryThreshold,
      usagePercentage: (this.getCurrentPoolMemoryUsage() / this.memoryThreshold) * 100
    }
  }
}

// Singleton instance
export const imageOptimizerService = new ImageOptimizerService()
