
import { ref, onMounted, onUnmounted } from 'vue'
import { throttle, debounce } from 'lodash-es'

interface GestureCallbacks {
  onPinch?: (scale: number, center: { x: number; y: number }) => void
  onPan?: (delta: { x: number; y: number }) => void
  onTap?: (point: { x: number; y: number }) => void
  onDoubleTap?: (point: { x: number; y: number }) => void
  onLongPress?: (point: { x: number; y: number }) => void
}

export function useMobileGestures(element: HTMLElement | null, callbacks: GestureCallbacks = {}) {
  const isGesturing = ref(false)
  const gestureState = ref({
    startDistance: 0,
    startCenter: { x: 0, y: 0 },
    lastPanPoint: { x: 0, y: 0 },
    touchStartTime: 0,
    tapCount: 0,
    lastTapTime: 0
  })

  let longPressTimer: NodeJS.Timeout | null = null

  const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchCenter = (touch1: Touch, touch2: Touch) => ({
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  })

  const handleTouchStart = (e: TouchEvent) => {
    if (!element) return
    
    const touches = e.touches
    gestureState.value.touchStartTime = Date.now()

    // Clear any existing long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    if (touches.length === 1) {
      const touch = touches[0]
      const point = { x: touch.clientX, y: touch.clientY }
      
      // Handle tap detection
      const currentTime = Date.now()
      if (currentTime - gestureState.value.lastTapTime < 300) {
        gestureState.value.tapCount++
        if (gestureState.value.tapCount === 2) {
          callbacks.onDoubleTap?.(point)
          gestureState.value.tapCount = 0
          return
        }
      } else {
        gestureState.value.tapCount = 1
      }
      gestureState.value.lastTapTime = currentTime

      // Set up long press detection
      longPressTimer = setTimeout(() => {
        if (!isGesturing.value) {
          callbacks.onLongPress?.(point)
        }
      }, 500)

      gestureState.value.lastPanPoint = point
    } else if (touches.length === 2) {
      // Two-finger gesture (pinch/zoom)
      isGesturing.value = true
      const touch1 = touches[0]
      const touch2 = touches[1]
      
      gestureState.value.startDistance = getTouchDistance(touch1, touch2)
      gestureState.value.startCenter = getTouchCenter(touch1, touch2)
    }
  }

  const handleTouchMove = throttle((e: TouchEvent) => {
    if (!element) return
    
    const touches = e.touches

    // Clear long press timer on movement
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    if (touches.length === 1 && !isGesturing.value) {
      // Single finger pan
      const touch = touches[0]
      const currentPoint = { x: touch.clientX, y: touch.clientY }
      
      const delta = {
        x: currentPoint.x - gestureState.value.lastPanPoint.x,
        y: currentPoint.y - gestureState.value.lastPanPoint.y
      }

      // Only trigger pan if movement is significant
      if (Math.abs(delta.x) > 2 || Math.abs(delta.y) > 2) {
        callbacks.onPan?.(delta)
        gestureState.value.lastPanPoint = currentPoint
      }
    } else if (touches.length === 2) {
      // Two finger pinch/zoom
      const touch1 = touches[0]
      const touch2 = touches[1]
      
      const currentDistance = getTouchDistance(touch1, touch2)
      const currentCenter = getTouchCenter(touch1, touch2)
      
      const scale = currentDistance / gestureState.value.startDistance
      
      callbacks.onPinch?.(scale, currentCenter)
    }
  }, 8) // Higher frequency for smoother gestures

  const handleTouchEnd = (e: TouchEvent) => {
    const touchDuration = Date.now() - gestureState.value.touchStartTime

    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    if (e.touches.length === 0) {
      isGesturing.value = false
      
      // Handle single tap
      if (touchDuration < 200 && gestureState.value.tapCount === 1) {
        setTimeout(() => {
          if (gestureState.value.tapCount === 1) {
            callbacks.onTap?.(gestureState.value.lastPanPoint)
            gestureState.value.tapCount = 0
          }
        }, 300) // Wait for potential double tap
      }
    }
  }

  const handleTouchCancel = () => {
    isGesturing.value = false
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  onMounted(() => {
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: false })
      element.addEventListener('touchmove', handleTouchMove, { passive: false })
      element.addEventListener('touchend', handleTouchEnd, { passive: true })
      element.addEventListener('touchcancel', handleTouchCancel, { passive: true })
    }
  })

  onUnmounted(() => {
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)
    }
    
    if (longPressTimer) {
      clearTimeout(longPressTimer)
    }
  })

  return {
    isGesturing,
    gestureState
  }
}
