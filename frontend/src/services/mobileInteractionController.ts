/**
 * Mobile Interaction Controller for FabricJS
 * Handles delayed drag activation, touch event normalization, and gesture cooldown
 */

import { FabricCanvas } from '@/app/fabricCanvas'
import { FabricObject, Point } from 'fabric'

export interface TouchGestureState {
  isActive: boolean
  startTime: number
  startPoint: Point
  lastTouchTime: number
  touchCount: number
  gestureType: 'tap' | 'drag' | 'pinch' | 'pan' | 'none'
}

export interface DragConfig {
  delayMs: number
  threshold: number
  enabledForLargeObjects: boolean
  enabledForMobile: boolean
}

export class MobileInteractionController {
  private canvas: FabricCanvas
  private gestureState: TouchGestureState
  private dragConfig: DragConfig
  private cooldownTimers: Map<string, number> = new Map()
  private activeInteraction: FabricObject | null = null
  private isDragDelayed = false
  private dragStartTimer: number | null = null

  // Performance thresholds
  private readonly LARGE_OBJECT_THRESHOLD = 100000 // pixels
  private readonly COMPLEX_OBJECT_TYPES = ['path', 'image', 'group']
  private readonly TOUCH_COOLDOWN_MS = 50
  private readonly DRAG_COOLDOWN_MS = 100
  private readonly GESTURE_DEBOUNCE_MS = 16

  constructor(canvas: FabricCanvas, config?: Partial<DragConfig>) {
    this.canvas = canvas
    this.gestureState = this.initGestureState()
    this.dragConfig = {
      delayMs: 150,
      threshold: 5,
      enabledForLargeObjects: true,
      enabledForMobile: true,
      ...config
    }

    this.setupEventListeners()
    this.configureMobileOptimizations()
  }

  private initGestureState(): TouchGestureState {
    return {
      isActive: false,
      startTime: 0,
      startPoint: new Point(0, 0),
      lastTouchTime: 0,
      touchCount: 0,
      gestureType: 'none'
    }
  }

  private setupEventListeners() {
    // Override default FabricJS touch events with optimized handlers
    this.canvas.off('mouse:down')
    this.canvas.off('mouse:move')
    this.canvas.off('mouse:up')

    this.canvas.on('mouse:down', this.handleInteractionStart.bind(this))
    this.canvas.on('mouse:move', this.handleInteractionMove.bind(this))
    this.canvas.on('mouse:up', this.handleInteractionEnd.bind(this))
    
    // Touch-specific events
    this.canvas.on('touch:gesture', this.handleTouchGesture.bind(this))
    this.canvas.on('touch:drag', this.handleTouchDrag.bind(this))

    // Object selection events
    this.canvas.on('selection:created', this.handleObjectSelected.bind(this))
    this.canvas.on('selection:updated', this.handleObjectSelected.bind(this))
    this.canvas.on('selection:cleared', this.handleSelectionCleared.bind(this))
  }

  private configureMobileOptimizations() {
    if (this.isMobileDevice()) {
      // Optimize touch target finding
      this.canvas.perPixelTargetFind = false
      this.canvas.targetFindTolerance = 8 // Larger touch targets
      
      // Disable certain features that cause lag on mobile
      this.canvas.preserveObjectStacking = true
      // this.canvas.enableRetinaScaling = false
      
      // Optimize selection behavior
      this.canvas.selection = true
      this.canvas.selectionBorderColor = '#4A90E2'
      this.canvas.selectionLineWidth = 2
    }
  }

  private handleInteractionStart(event: any) {
    const currentTime = performance.now()
    const pointer = this.canvas.getPointer(event.e)
    
    // Check cooldown
    if (this.isInCooldown('interaction')) return

    this.gestureState = {
      isActive: true,
      startTime: currentTime,
      startPoint: new Point(pointer.x, pointer.y),
      lastTouchTime: currentTime,
      touchCount: 1,
      gestureType: 'tap'
    }

    const target = this.canvas.findTarget(event.e, false)
    
    if (target && this.shouldDelayDrag(target)) {
      this.startDelayedDrag(target, event)
    } else {
      this.startImmediateDrag(target, event)
    }

    this.setCooldown('interaction', this.TOUCH_COOLDOWN_MS)
  }

  private handleInteractionMove(event: any) {
    if (!this.gestureState.isActive) return

    const currentTime = performance.now()
    const pointer = this.canvas.getPointer(event.e)
    const currentPoint = new Point(pointer.x, pointer.y)
    
    // Calculate movement distance
    const distance = this.gestureState.startPoint.distanceFrom(currentPoint)
    
    // Update gesture type based on movement
    if (distance > this.dragConfig.threshold) {
      this.gestureState.gestureType = 'drag'
    }

    // Handle delayed drag activation
    if (this.isDragDelayed && distance > this.dragConfig.threshold) {
      this.activateDelayedDrag()
    }

    // Throttle move events for performance
    const timeSinceLastTouch = currentTime - this.gestureState.lastTouchTime
    if (timeSinceLastTouch < this.GESTURE_DEBOUNCE_MS) return

    this.gestureState.lastTouchTime = currentTime

    // Continue with normal move handling if not delayed
    if (!this.isDragDelayed) {
      this.handleNormalMove(event)
    }
  }

  private handleInteractionEnd(event: any) {
    const interactionDuration = performance.now() - this.gestureState.startTime

    // Clear delayed drag timer
    if (this.dragStartTimer) {
      clearTimeout(this.dragStartTimer)
      this.dragStartTimer = null
    }

    // Handle tap vs drag distinction
    if (this.gestureState.gestureType === 'tap' && interactionDuration < 200) {
      this.handleTap(event)
    }

    // Clean up state
    this.gestureState = this.initGestureState()
    this.isDragDelayed = false
    this.activeInteraction = null

    // Set cooldown based on interaction complexity
    const cooldownMs = this.activeInteraction && this.isComplexObject(this.activeInteraction) 
      ? this.DRAG_COOLDOWN_MS * 2 
      : this.DRAG_COOLDOWN_MS

    this.setCooldown('interaction', cooldownMs)
  }

  private shouldDelayDrag(target: FabricObject): boolean {
    if (!this.dragConfig.enabledForMobile || !this.isMobileDevice()) return false
    if (!this.dragConfig.enabledForLargeObjects) return false
    if (!target) return false

    // Check if object is large or complex
    const isLarge = this.isLargeObject(target)
    const isComplex = this.isComplexObject(target)
    
    return isLarge || isComplex
  }

  private startDelayedDrag(target: FabricObject, event: any) {
    this.isDragDelayed = true
    this.activeInteraction = target

    // Provide visual feedback for delayed drag
    this.showDragDelayFeedback(target)

    // Start timer for drag activation
    this.dragStartTimer = setTimeout(() => {
      this.activateDelayedDrag()
    }, this.dragConfig.delayMs)

    // Prevent immediate drag
    event.e.preventDefault()
    event.e.stopPropagation()
  }

  private activateDelayedDrag() {
    if (!this.activeInteraction) return

    this.isDragDelayed = false
    this.hideDragDelayFeedback()

    // Enable object manipulation
    this.activeInteraction.set({
      lockMovementX: false,
      lockMovementY: false,
      selectable: true,
      evented: true
    })

    // Optimize object for dragging
    this.optimizeObjectForDragging(this.activeInteraction)

    this.canvas.requestRenderAll()
  }

  private startImmediateDrag(target: FabricObject | undefined, event: any) {
    if (target) {
      this.activeInteraction = target
      this.optimizeObjectForDragging(target)
    }
  }

  private optimizeObjectForDragging(object: FabricObject) {
    // Temporarily disable expensive features during drag
    object.set({
      shadow: null, // Remove shadows during drag
      strokeWidth: Math.min(object.strokeWidth || 0, 2) // Limit stroke width
    })

    // Disable filters during drag for complex objects
    if (this.isComplexObject(object) && (object as any).filters) {
      (object as any)._originalFilters = (object as any).filters
      ;(object as any).filters = []
    }

    // Reduce quality for images during drag
    if (object.type === 'image') {
      const imageObj = object as any
      if (imageObj.filters && imageObj.filters.length > 0) {
        imageObj._originalFilters = [...imageObj.filters]
        imageObj.filters = []
      }
    }
  }

  private restoreObjectAfterDrag(object: FabricObject) {
    // Restore original properties after drag ends
    setTimeout(() => {
      // Restore filters
      if ((object as any)._originalFilters) {
        ;(object as any).filters = (object as any)._originalFilters
        delete (object as any)._originalFilters
      }

      // Restore shadows and other properties can be added here
      this.canvas.requestRenderAll()
    }, 100) // Small delay to avoid lag during drag end
  }

  private handleTouchGesture(event: any) {
    // Handle multi-touch gestures like pinch-to-zoom
    const touchCount = event.e.touches?.length || 0
    
    if (touchCount === 2) {
      this.gestureState.gestureType = 'pinch'
      // Handle pinch gesture with throttling
      this.throttledPinchHandler(event)
    }
  }

  private throttledPinchHandler = this.throttle((event: any) => {
    // Handle pinch zoom with performance considerations
    const touches = event.e.touches
    if (touches.length === 2) {
      const touch1 = touches[0]
      const touch2 = touches[1]
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      
      // Implement zoom logic here
      this.handlePinchZoom(distance, event)
    }
  }, 50)

  private handlePinchZoom(distance: number, event: any) {
    // Implement smooth pinch zoom with performance optimization
    const center = new Point(
      (event.e.touches[0].clientX + event.e.touches[1].clientX) / 2,
      (event.e.touches[0].clientY + event.e.touches[1].clientY) / 2
    )

    // Use throttled zoom from existing optimization hooks
    window.dispatchEvent(new CustomEvent('canvas:pinch-zoom', {
      detail: { distance, center }
    }))
  }

  private handleTouchDrag(event: any) {
    if (this.isInCooldown('drag')) return
    
    this.handleNormalMove(event)
    this.setCooldown('drag', this.GESTURE_DEBOUNCE_MS)
  }

  private handleNormalMove(event: any) {
    // Let FabricJS handle normal move events
    // This is where the default canvas behavior continues
  }

  private handleTap(event: any) {
    // Handle single tap selection with optimizations
    const target = this.canvas.findTarget(event.e, false)
    
    if (target) {
      // Optimized selection for mobile
      this.canvas.setActiveObject(target)
      this.canvas.requestRenderAll()
    } else {
      this.canvas.discardActiveObject()
      this.canvas.requestRenderAll()
    }
  }

  private handleObjectSelected(event: any) {
    const target = event.selected?.[0] || event.target
    
    if (target && this.isComplexObject(target)) {
      // Pre-optimize complex objects when selected
      this.preOptimizeObject(target)
    }
  }

  private handleSelectionCleared() {
    // Restore any previously optimized objects
    if (this.activeInteraction) {
      this.restoreObjectAfterDrag(this.activeInteraction)
      this.activeInteraction = null
    }
  }

  private preOptimizeObject(object: FabricObject) {
    // Pre-cache object coordinates and bounds for smoother interactions
    object.setCoords()
    
    // Pre-calculate bounding rect
    object.getBoundingRect()
    
    // Enable object caching for complex objects
    object.set({
      objectCaching: true,
      statefullCache: true
    })
  }

  private isLargeObject(object: FabricObject): boolean {
    const bounds = object.getBoundingRect()
    const area = bounds.width * bounds.height
    return area > this.LARGE_OBJECT_THRESHOLD
  }

  private isComplexObject(object: FabricObject): boolean {
    return this.COMPLEX_OBJECT_TYPES.includes(object.type || '') ||
           (object as any).filters?.length > 0 ||
           (object as any).shadow !== null
  }

  private showDragDelayFeedback(object: FabricObject) {
    // Add visual feedback for delayed drag (e.g., highlight border)
    object.set({
      borderColor: '#FFB84D',
      borderScaleFactor: 2,
      borderOpacityWhenMoving: 0.8
    })
    this.canvas.requestRenderAll()
  }

  private hideDragDelayFeedback() {
    // Remove visual feedback
    if (this.activeInteraction) {
      this.activeInteraction.set({
        borderColor: '#4A90E2',
        borderScaleFactor: 1,
        borderOpacityWhenMoving: 1
      })
    }
  }

  private setCooldown(type: string, ms: number) {
    const timer = setTimeout(() => {
      this.cooldownTimers.delete(type)
    }, ms)
    
    this.cooldownTimers.set(type, timer)
  }

  private isInCooldown(type: string): boolean {
    return this.cooldownTimers.has(type)
  }

  private throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timeoutId: number | null = null
    let lastExecTime = 0
    
    return ((...args: any[]) => {
      const currentTime = performance.now()
      
      if (currentTime - lastExecTime > delay) {
        func(...args)
        lastExecTime = currentTime
      } else {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func(...args)
          lastExecTime = performance.now()
        }, delay - (currentTime - lastExecTime))
      }
    }) as T
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 1)
  }

  public updateConfig(newConfig: Partial<DragConfig>) {
    this.dragConfig = { ...this.dragConfig, ...newConfig }
  }

  public getGestureState(): TouchGestureState {
    return { ...this.gestureState }
  }

  public cleanup() {
    // Clear all timers
    this.cooldownTimers.forEach(timer => clearTimeout(timer))
    this.cooldownTimers.clear()
    
    if (this.dragStartTimer) {
      clearTimeout(this.dragStartTimer)
    }
  }
}