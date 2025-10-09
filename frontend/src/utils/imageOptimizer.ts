// Advanced image optimization for better canvas performance
import { optimizedImageService } from '@/services/optimizedImageService'

interface ImageProcessingOptions {
  maxSize?: number
  quality?: number
  format?: 'jpeg' | 'webp' | 'png'
  maxDimensions?: { width: number; height: number }
}

class AdvancedImageOptimizer {
  private readonly DEFAULT_MAX_SIZE = 1024 * 1024 // 1MB
  private readonly LARGE_IMAGE_THRESHOLD = 2 * 1024 * 1024 // 2MB
  private readonly MAX_DIMENSIONS = { width: 2048, height: 2048 }

  // Main optimization function for canvas images
  async optimizeForCanvas(file: File, options: ImageProcessingOptions = {}): Promise<Blob> {
    console.log('🖼️ Optimizing image for canvas:', file.name, 'Size:', file.size)

    const config = {
      maxSize: options.maxSize || this.DEFAULT_MAX_SIZE,
      quality: options.quality || 0.85,
      format: options.format || 'jpeg',
      maxDimensions: options.maxDimensions || this.MAX_DIMENSIONS
    }

    // For large images, apply aggressive optimization
    if (file.size > this.LARGE_IMAGE_THRESHOLD) {
      console.warn('⚠️ Large image detected, applying aggressive compression')
      return await this.aggressiveOptimization(file, config)
    }

    // For smaller images, light optimization
    if (file.size > config.maxSize) {
      return await this.lightOptimization(file, config)
    }

    // Image is already optimized
    console.log('✅ Image size OK, no optimization needed')
    return file
  }

  // Aggressive optimization for images >2MB
  private async aggressiveOptimization(file: File, config: ImageProcessingOptions): Promise<Blob> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = await this.loadImage(file)

    // Calculate new dimensions (more aggressive reduction)
    const scaleFactor = Math.min(
      config.maxDimensions!.width / img.width,
      config.maxDimensions!.height / img.height,
      0.7 // Max 70% of original size for large images
    )

    canvas.width = Math.floor(img.width * scaleFactor)
    canvas.height = Math.floor(img.height * scaleFactor)

    // Use better scaling algorithm
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Convert to blob with quality adjustment
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob && blob.size > config.maxSize!) {
          // If still too large, reduce quality
          canvas.toBlob((secondBlob) => {
            resolve(secondBlob || blob)
          }, `image/${config.format}`, config.quality! * 0.7)
        } else {
          resolve(blob || file)
        }
      }, `image/${config.format}`, config.quality)
    })
  }

  // Light optimization for moderately large images
  private async lightOptimization(file: File, config: ImageProcessingOptions): Promise<Blob> {
    return await optimizedImageService.compressImage(file, config.maxSize)
  }

  // Load image with error handling
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Get image metadata without full load
  async getImageInfo(file: File): Promise<{ width: number; height: number; aspectRatio: number }> {
    const img = await this.loadImage(file)
    return {
      width: img.width,
      height: img.height,
      aspectRatio: img.width / img.height
    }
  }

  // Estimate memory usage of an image
  estimateMemoryUsage(width: number, height: number): number {
    return width * height * 4 // RGBA bytes
  }

  // Check if image needs optimization
  shouldOptimize(file: File): { needed: boolean; reason: string } {
    if (file.size > this.LARGE_IMAGE_THRESHOLD) {
      return { needed: true, reason: 'File size too large (>2MB)' }
    }
    if (file.size > this.DEFAULT_MAX_SIZE) {
      return { needed: true, reason: 'File size above recommended limit (>1MB)' }
    }
    return { needed: false, reason: 'File size is optimal' }
  }

  // Batch optimize multiple images
  async batchOptimize(files: File[], options: ImageProcessingOptions = {}): Promise<Blob[]> {
    console.log('🔄 Batch optimizing', files.length, 'images')
    
    const results: Blob[] = []
    
    // Process in chunks to avoid blocking UI
    const chunkSize = 3
    for (let i = 0; i < files.length; i += chunkSize) {
      const chunk = files.slice(i, i + chunkSize)
      const chunkResults = await Promise.all(
        chunk.map(file => this.optimizeForCanvas(file, options))
      )
      results.push(...chunkResults)
      
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    return results
  }
}

export const advancedImageOptimizer = new AdvancedImageOptimizer()