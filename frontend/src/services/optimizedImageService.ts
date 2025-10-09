
interface ImageCache {
  [key: string]: {
    blob: Blob
    url: string
    timestamp: number
    size: number
  }
}

class OptimizedImageService {
  private cache: ImageCache = {}
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB
  private readonly MAX_CACHE_AGE = 30 * 60 * 1000 // 30 minutes
  private currentCacheSize = 0

  // Convert base64 to blob URL with caching
  async base64ToBlobUrl(base64: string, mimeType = 'image/jpeg'): Promise<string> {
    const cacheKey = this.generateCacheKey(base64)
    
    // Check cache first
    if (this.cache[cacheKey] && this.isCacheValid(cacheKey)) {
      return this.cache[cacheKey].url
    }

    try {
      // Clean base64 string
      const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '')
      
      // Convert to blob in chunks to avoid memory spikes
      const blob = await this.base64ToBlob(cleanBase64, mimeType)
      const url = URL.createObjectURL(blob)
      
      // Cache the result
      this.addToCache(cacheKey, blob, url)
      
      return url
    } catch (error) {
      console.error('Failed to convert base64 to blob URL:', error)
      return base64 // Fallback to original
    }
  }

  // Convert base64 to blob efficiently
  private async base64ToBlob(base64: string, mimeType: string): Promise<Blob> {
    return new Promise((resolve) => {
      const chunkSize = 1024
      const byteCharacters = atob(base64)
      const chunks = []
      
      for (let offset = 0; offset < byteCharacters.length; offset += chunkSize) {
        const chunk = byteCharacters.slice(offset, offset + chunkSize)
        const byteNumbers = new Array(chunk.length)
        
        for (let i = 0; i < chunk.length; i++) {
          byteNumbers[i] = chunk.charCodeAt(i)
        }
        
        chunks.push(new Uint8Array(byteNumbers))
      }
      
      resolve(new Blob(chunks, { type: mimeType }))
    })
  }

  // Compress image if it's too large
  async compressImage(file: File, maxSize = 1024 * 1024): Promise<Blob> {
    if (file.size <= maxSize) {
      return file
    }

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.sqrt(maxSize / file.size)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        // Draw compressed image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          resolve(blob || file)
        }, 'image/jpeg', 0.8)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  // Generate cache key from base64
  private generateCacheKey(base64: string): string {
    // Use a simple hash of the first and last parts to avoid processing entire string
    const start = base64.substring(0, 100)
    const end = base64.substring(base64.length - 100)
    return btoa(start + end).replace(/[^a-zA-Z0-9]/g, '')
  }

  // Check if cache entry is still valid
  private isCacheValid(key: string): boolean {
    const entry = this.cache[key]
    return entry && (Date.now() - entry.timestamp) < this.MAX_CACHE_AGE
  }

  // Add entry to cache with size management
  private addToCache(key: string, blob: Blob, url: string): void {
    // Clean old entries if cache is full
    if (this.currentCacheSize + blob.size > this.MAX_CACHE_SIZE) {
      this.cleanCache()
    }

    this.cache[key] = {
      blob,
      url,
      timestamp: Date.now(),
      size: blob.size
    }
    
    this.currentCacheSize += blob.size
  }

  // Clean old cache entries
  private cleanCache(): void {
    const entries = Object.entries(this.cache)
      .sort(([,a], [,b]) => a.timestamp - b.timestamp)
    
    // Remove oldest 30% of entries
    const removeCount = Math.floor(entries.length * 0.3)
    
    for (let i = 0; i < removeCount; i++) {
      const [key, entry] = entries[i]
      URL.revokeObjectURL(entry.url)
      this.currentCacheSize -= entry.size
      delete this.cache[key]
    }
  }

  // Clean up all cache
  cleanup(): void {
    Object.values(this.cache).forEach(entry => {
      URL.revokeObjectURL(entry.url)
    })
    this.cache = {}
    this.currentCacheSize = 0
  }
}

export const optimizedImageService = new OptimizedImageService()

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  optimizedImageService.cleanup()
})
