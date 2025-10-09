
import { ref, onMounted, onUnmounted } from 'vue'
import { debounce } from 'lodash-es'

export function useMobileKeyboard() {
  const isKeyboardVisible = ref(false)
  const keyboardHeight = ref(0)
  const originalViewportHeight = ref(window.innerHeight)

  const detectKeyboard = debounce(() => {
    const currentHeight = window.innerHeight
    const heightDifference = originalViewportHeight.value - currentHeight
    
    // Keyboard is likely visible if height decreased by more than 150px
    if (heightDifference > 150) {
      isKeyboardVisible.value = true
      keyboardHeight.value = heightDifference
    } else {
      isKeyboardVisible.value = false
      keyboardHeight.value = 0
    }
  }, 100)

  const handleResize = () => {
    detectKeyboard()
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Reset viewport height when app becomes visible
      originalViewportHeight.value = window.innerHeight
    }
  }

  onMounted(() => {
    originalViewportHeight.value = window.innerHeight
    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    isKeyboardVisible,
    keyboardHeight,
    originalViewportHeight
  }
}
