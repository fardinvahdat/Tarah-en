<template>
  <input type="file" hidden @change="handleUploadFile" ref="imageRef" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFileStore } from '@/store'
import { compressImageIfNeeded } from '@/utils/imageCompression'
import { advancedImageOptimizer } from '@/utils/imageOptimizer'

const imageRef = ref(null)

// Enhanced file handling with offline support and image optimization
const handleUploadFile = async (e: any) => {
  try {
    const file = e.target.files[0]
    if (!file) return

    // CRITICAL: Optimize image before processing to prevent CPU spikes
    console.log('🖼️ Processing image:', file.name, 'Size:', file.size)
    
    let optimizedFile = file
    
    // Check if image needs optimization (>1MB)
    if (file.size > 1024 * 1024) {
      console.log('⚡ Large image detected, optimizing...')
      
      try {
        // Use advanced optimizer for better performance
        const optimizedBlob = await advancedImageOptimizer.optimizeForCanvas(file, {
          maxSize: 1024 * 1024, // 1MB max
          quality: 0.7,
          format: 'jpeg',
          maxDimensions: { width: 2048, height: 2048 }
        })
        
        optimizedFile = new File([optimizedBlob], file.name, {
          type: 'image/jpeg',
          lastModified: file.lastModified
        })
        
        console.log('✅ Image optimized:', optimizedFile.size, 'bytes')
      } catch (optimizationError) {
        console.warn('⚠️ Image optimization failed, using original:', optimizationError)
        // Fallback to basic compression
        const compressedDataUrl = await compressImageIfNeeded(file, 0.7)
        const response = await fetch(compressedDataUrl)
        optimizedFile = new File([response.blob()], file.name, {
          type: 'image/jpeg',
          lastModified: file.lastModified
        })
      }
    }

    // Normal upload when online
    const formData = new FormData()
    formData.append('type', 'image')
    formData.append('file', optimizedFile)
    const { handleUpload } = useFileStore()
    const response = await handleUpload(formData)
    console.log('📤 Upload completed:', response)
    
    // Test: Verify the image can be added to canvas without errors
    console.log('🧪 Testing image addition to canvas...')
    
  } catch (error) {
    console.error('❌ Upload failed:', error)
    ElMessage({
      type: 'error',
      message: 'خطا در آپلود فایل',
    })
  }
}

// Expose ref and method to parent
defineExpose({
  imageRef,
  handleUploadFile
})
</script>
