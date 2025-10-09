// Hook for optimized image upload and processing
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { advancedImageOptimizer } from '@/utils/imageOptimizer'
import useCanvas from '@/views/Canvas/useCanvas'
import { FabricImage } from 'fabric'

export function useImageUploadOptimization() {
  const isProcessing = ref(false)
  const uploadProgress = ref(0)

  // Optimized image upload with automatic compression
  const optimizedImageUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    if (fileArray.length === 0) return

    isProcessing.value = true
    uploadProgress.value = 0

    try {
      console.log('🖼️ Starting optimized image upload for', fileArray.length, 'files')

      // Check each image and show warnings if needed
      for (const file of fileArray) {
        const checkResult = advancedImageOptimizer.shouldOptimize(file)
        if (checkResult.needed) {
          ElMessage.warning(`${file.name}: ${checkResult.reason} - Will be optimized`)
        }
      }

      // Process images in parallel with progress tracking
      const results = await processImagesWithProgress(fileArray)
      
      // Add optimized images to canvas
      await addImagesToCanvas(results)
      
      ElMessage.success(`Successfully uploaded ${results.length} optimized images`)
      
    } catch (error) {
      console.error('Image upload failed:', error)
      ElMessage.error('Image upload failed. Please try again.')
    } finally {
      isProcessing.value = false
      uploadProgress.value = 0
    }
  }

  // Process images with progress updates
  const processImagesWithProgress = async (files: File[]): Promise<Blob[]> => {
    const results: Blob[] = []
    const total = files.length

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        // Show current file being processed
        ElMessage.info(`Processing ${file.name}...`, { duration: 1000 })
        
        // Optimize the image
        const optimizedBlob = await advancedImageOptimizer.optimizeForCanvas(file)
        results.push(optimizedBlob)
        
        // Update progress
        uploadProgress.value = Math.round(((i + 1) / total) * 100)
        
        // Log size reduction
        const reduction = Math.round((1 - optimizedBlob.size / file.size) * 100)
        if (reduction > 0) {
          console.log(`✅ ${file.name}: ${reduction}% size reduction`)
        }
        
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error)
        // Use original file as fallback
        results.push(file)
      }
    }

    return results
  }

  // Add optimized images to canvas
  const addImagesToCanvas = async (blobs: Blob[]) => {
    const [canvas] = useCanvas()
    if (!canvas) return

    console.log('🎨 Adding', blobs.length, 'images to canvas')

    // Disable rendering during batch operations
    canvas.renderOnAddRemove = false

    for (const blob of blobs) {
      try {
        const imageUrl = URL.createObjectURL(blob)
        
        // Create fabric image
        const fabricImage = await FabricImage.fromURL(imageUrl)
        
        // Position image (you can customize this logic)
        fabricImage.set({
          left: Math.random() * (canvas.width || 400),
          top: Math.random() * (canvas.height || 400),
          scaleX: 0.5,
          scaleY: 0.5
        })

        // Add to canvas
        canvas.add(fabricImage)
        
        // Clean up blob URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(imageUrl)
        }, 1000)
        
      } catch (error) {
        console.error('Failed to add image to canvas:', error)
      }
    }

    // Re-enable rendering and render once
    canvas.renderOnAddRemove = true
    canvas.requestRenderAll()
  }

  // Validate file before processing
  const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large (max 10MB)' }
    }

    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!supportedFormats.includes(file.type)) {
      return { valid: false, error: 'Unsupported image format' }
    }

    return { valid: true }
  }

  // Batch upload with validation
  const uploadWithValidation = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles: File[] = []
    const errors: string[] = []

    // Validate all files first
    for (const file of fileArray) {
      const validation = validateImageFile(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    }

    // Show validation errors
    if (errors.length > 0) {
      ElMessage.error(`Some files were skipped: ${errors.join(', ')}`)
    }

    // Process valid files
    if (validFiles.length > 0) {
      await optimizedImageUpload(validFiles)
    }
  }

  // Get image info without loading full image
  const getImagePreview = async (file: File) => {
    try {
      const info = await advancedImageOptimizer.getImageInfo(file)
      const memoryUsage = advancedImageOptimizer.estimateMemoryUsage(info.width, info.height)
      
      return {
        ...info,
        fileSize: file.size,
        estimatedMemoryMB: Math.round(memoryUsage / 1024 / 1024),
        optimizationNeeded: advancedImageOptimizer.shouldOptimize(file)
      }
    } catch (error) {
      console.error('Failed to get image preview:', error)
      return null
    }
  }

  return {
    isProcessing: readonly(isProcessing),
    uploadProgress: readonly(uploadProgress),
    optimizedImageUpload,
    uploadWithValidation,
    getImagePreview,
    validateImageFile
  }
}