
import { defineStore } from "pinia"
import { Point } from "fabric/fabric-impl"
import { verticalLine, horizontalLine } from "@/types/elements"
import { useMobileOptimizedStore } from "@/composables/useMobileOptimizedStore"
import { useShallowReactiveState } from "@/composables/useOptimizedVueReactivity"

export interface IOptimizedFabricState {
  wrapperRef: null | HTMLDivElement
  canvasRef: null | HTMLCanvasElement
  zoom: number
  clip: number
  safe: number
  round: number
  diagonal: number
  opacity: number
  showClip: boolean
  showSafe: boolean
  isDragging: boolean
  isDrawing: boolean
  isCropping: boolean
  isTexting: boolean
  isCtrlKey: boolean
  isModified: boolean
  isChecked: boolean
  verticalLines: verticalLine[]
  horizontalLines: horizontalLine[]
  elementCoords: Point[]
  elementHover: string
  scalePercentage: number
  
  // Mobile-specific optimizations
  isMobile: boolean
  touchGestures: {
    pinchZoom: boolean
    panGesture: boolean
    lastTouchDistance: number
  }
  performance: {
    renderQuality: 'high' | 'medium' | 'low'
    enableAnimations: boolean
    maxObjectsRendered: number
  }
}

export const useOptimizedFabricStore = defineStore({
  id: "optimizedFabricStore",
  state: (): IOptimizedFabricState => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    return {
      wrapperRef: null,
      canvasRef: null,
      zoom: 1,
      clip: 2,
      safe: 5,
      round: 0,
      diagonal: 18,
      opacity: 0.1,
      showClip: false,
      showSafe: false,
      isDragging: false,
      isDrawing: false,
      isTexting: false,
      isCropping: false,
      isCtrlKey: false,
      isModified: false,
      isChecked: false,
      verticalLines: [],
      horizontalLines: [],
      elementCoords: [],
      elementHover: '',
      scalePercentage: 80,
      
      // Mobile optimizations
      isMobile,
      touchGestures: {
        pinchZoom: true,
        panGesture: true,
        lastTouchDistance: 0
      },
      performance: {
        renderQuality: isMobile ? 'medium' : 'high',
        enableAnimations: !isMobile || window.innerWidth > 768,
        maxObjectsRendered: isMobile ? 50 : 200
      }
    }
  },

  getters: {
    // Memoized getters for performance
    canvasSize: (state) => ({
      width: state.wrapperRef?.offsetWidth || (window.innerWidth - (state.isMobile ? 0 : 420)),
      height: state.wrapperRef?.offsetHeight || (window.innerHeight - 40)
    }),
    
    isLowPerformanceMode: (state) => state.isMobile && state.performance.renderQuality === 'low',
    
    optimizedZoom: (state) => {
      // Limit zoom levels on mobile for performance
      if (state.isMobile) {
        return Math.max(0.1, Math.min(3, state.zoom))
      }
      return state.zoom
    }
  },

  actions: {
    // Optimized actions with batching
    setZoom(val: number) {
      const { queueUpdate } = useMobileOptimizedStore(this)
      
      queueUpdate(() => {
        this.zoom = this.isMobile ? Math.max(0.1, Math.min(3, val)) : val
      })
    },
    
    setCanvasPercentage(val: number) {
      const { queueUpdate } = useMobileOptimizedStore(this)
      
      queueUpdate(() => {
        this.scalePercentage = val
      })
    },
    
    setIsDraggingState(flag: boolean) {
      // Don't batch this for immediate response
      this.isDragging = flag
    },
    
    // Mobile-specific actions
    updateTouchGestures(gestures: Partial<IOptimizedFabricState['touchGestures']>) {
      const { queueUpdate } = useMobileOptimizedStore(this)
      
      queueUpdate(() => {
        this.touchGestures = { ...this.touchGestures, ...gestures }
      })
    },
    
    optimizeForPerformance() {
      if (this.isMobile) {
        this.performance.renderQuality = 'medium'
        this.performance.enableAnimations = false
        this.performance.maxObjectsRendered = 30
      }
    },
    
    // Batch multiple state updates
    batchUpdate(updates: Partial<IOptimizedFabricState>) {
      const { queueUpdate } = useMobileOptimizedStore(this)
      
      queueUpdate(() => {
        Object.assign(this, updates)
      })
    }
  }
})
