
import { Point, Canvas } from 'fabric'
import { debounce, throttle } from 'lodash-es'
import { Disposable } from '@/utils/lifecycle'
import { useFabricStore } from '@/store'

export const MIN_ZOOM = 0.03
export const MAX_ZOOM = 5

export class FabricTouch extends Disposable {
  isTwoTouch = false
  isDragging = false
  startDistance = 1
  startX = 0 
  startY = 0
  startScale = 1
  lastPan?: Point
  private touchStartTime = 0
  private lastTapTime = 0
  private tapCount = 0

  constructor(private readonly canvas: Canvas) {
    super()
    this.initOptimizedTouchEvent()
  }

  initOptimizedTouchEvent() {
    const canvas = this.canvas?.upperCanvasEl
    if (canvas) {
      // Use passive listeners where possible for better performance
      canvas.addEventListener('touchstart', this.touchStartHandle, { passive: false })
      canvas.addEventListener('touchmove', this.touchMoveHandle, { passive: false })
      canvas.addEventListener('touchend', this.touchEndHandle, { passive: true })
      canvas.addEventListener('touchcancel', this.touchCancelHandle, { passive: true })
    }
  }

  removeTouchEvent() {
    const canvas = this.canvas?.upperCanvasEl
    if (canvas) {
      canvas.removeEventListener('touchstart', this.touchStartHandle)
      canvas.removeEventListener('touchmove', this.touchMoveHandle)
      canvas.removeEventListener('touchend', this.touchEndHandle)
      canvas.removeEventListener('touchcancel', this.touchCancelHandle)
    }
  }

  touchStartHandle = (e: TouchEvent) => {
    e.preventDefault()
    const canvas = this.canvas
    if (!canvas) return
    
    const touches = e.touches
    this.touchStartTime = Date.now()

    // Handle double tap detection
    if (touches.length === 1) {
      const currentTime = Date.now()
      if (currentTime - this.lastTapTime < 300) {
        this.tapCount++
        if (this.tapCount === 2) {
          this.handleDoubleTap(touches[0])
          this.tapCount = 0
        }
      } else {
        this.tapCount = 1
      }
      this.lastTapTime = currentTime
    }

    if (touches.length === 2) {
      canvas.discardActiveObject()
      canvas.requestRenderAll()
      this.isTwoTouch = true
      
      const touch1 = touches[0]
      const touch2 = touches[1]
      
      this.startDistance = this.getTouchDistance(touch1, touch2)
      const center = this.getTouchCenter(touch1, touch2)
      this.startX = center.x
      this.startY = center.y
      this.startScale = canvas.getZoom()
    }
  }

  touchMoveHandle = throttle((e: TouchEvent) => {
    e.preventDefault()
    const canvas = this.canvas
    if (!canvas) return
    
    const touches = e.touches

    if (touches.length === 2 && this.isTwoTouch) {
      const touch1 = touches[0]
      const touch2 = touches[1]

      const currentDistance = this.getTouchDistance(touch1, touch2)
      const center = this.getTouchCenter(touch1, touch2)

      // Optimized zoom calculation
      let zoom = this.startScale * (currentDistance / this.startDistance)
      zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
      
      // CRITICAL: Use skipSetCoords to prevent coordinate recalculation during gesture
      canvas.zoomToPoint(new Point(this.startX, this.startY), zoom)

      // Optimized pan calculation
      const currentPan = new Point(center.x - this.startX, center.y - this.startY)
      
      if (!this.isDragging) {
        this.isDragging = true
        this.lastPan = currentPan
      } else if (this.lastPan) {
        const deltaX = currentPan.x - this.lastPan.x
        const deltaY = currentPan.y - this.lastPan.y
        
        // Only pan if movement is significant enough
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          // CRITICAL: Skip coordinates update during pan gesture
          canvas.relativePan(new Point(deltaX, deltaY), true)
          this.lastPan = currentPan
        }
      }

      // Update store zoom (debounced)
      this.updateZoomDebounced(zoom)
    }
  }, 12) // Reduced frequency for better performance

  touchEndHandle = (e: TouchEvent) => {
    const touchDuration = Date.now() - this.touchStartTime
    
    // Reset dragging state
    this.isDragging = false
    
    if (this.isTwoTouch && e.touches.length === 0) {
      this.isTwoTouch = false
      this.saveTransform()
    }

    // Handle quick tap (potential selection)
    if (touchDuration < 200 && e.touches.length === 0 && !this.isDragging) {
      // Allow fabric to handle object selection
      this.canvas.requestRenderAll()
    }
  }

  touchCancelHandle = () => {
    this.isDragging = false
    this.isTwoTouch = false
    this.canvas?.requestRenderAll()
  }

  handleDoubleTap = (touch: Touch) => {
    // CRITICAL: Disable double-tap zoom on mobile to prevent random jumps
    console.log('🚫 Double-tap zoom disabled on mobile devices')
    return
    
    // Original code kept for reference but disabled:
    // const canvas = this.canvas
    // if (!canvas) return
    // const pointer = canvas.getPointer(touch)
    // const currentZoom = canvas.getZoom()
    // const targetZoom = currentZoom < 1 ? 1 : 0.5
    // canvas.zoomToPoint(pointer, targetZoom)
    // const fabricStore = useFabricStore()
    // fabricStore.setZoom(targetZoom)
  }

  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.pageX - touch1.pageX
    const dy = touch2.pageY - touch1.pageY
    return Math.sqrt(dx * dx + dy * dy)
  }

  private getTouchCenter(touch1: Touch, touch2: Touch): Point {
    return new Point(
      (touch1.pageX + touch2.pageX) / 2,
      (touch1.pageY + touch2.pageY) / 2
    )
  }

  // Debounced zoom update to prevent store spam
  updateZoomDebounced = debounce((zoom: number) => {
    const fabricStore = useFabricStore()
    fabricStore.setZoom(zoom)
  }, 50)

  saveTransform = debounce(() => {
    const transform = this.canvas?.viewportTransform
    if (transform) {
      // Force coordinate update after gesture ends
      this.canvas?.getObjects().forEach(obj => {
        if (obj.setCoords) {
          obj.setCoords()
        }
      })
      this.canvas?.requestRenderAll()
    }
  }, 100)
}
