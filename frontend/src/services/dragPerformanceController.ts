// Critical Drag Performance Controller - Eliminates setCoords Spam
import { Canvas, FabricObject } from 'fabric';
import { debounce, throttle } from 'lodash-es';

interface DragState {
  isDragging: boolean;
  dragStartTime: number;
  object: FabricObject;
  initialPosition: { x: number; y: number };
  lastCoordsUpdate: number;
}

export class DragPerformanceController {
  private canvas: Canvas;
  private dragStates = new Map<string, DragState>();
  private isGlobalDragMode = false;
  private coordsUpdateQueue = new Set<string>();
  private isSafari: boolean;
  
  // Performance critical: Prevent coordinate spam
  private batchCoordsUpdate: any;
  private renderThrottle: any;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // Initialize debounce/throttle after isSafari is set (less aggressive)
    this.batchCoordsUpdate = debounce(this.executeCoordsUpdate.bind(this), 100); // Normal delay
    this.renderThrottle = throttle(this.performRender.bind(this), 16); // Normal 60fps
    
    this.initialize();
  }

  private initialize() {
    this.overrideDragMethods();
    this.setupDragEvents();
  }

  private overrideDragMethods() {
    // Override setCoords to prevent spam during drag
    const originalSetCoords = FabricObject.prototype.setCoords;
    const controller = this;

    FabricObject.prototype.setCoords = function(this: FabricObject) {
      // CRITICAL: Check if object is properly initialized
      if (!this.canvas || !this.id) {
        return originalSetCoords.call(this);
      }

      const dragState = controller.dragStates.get(this.id || '');
      
      // If object is being dragged, queue coords update instead of immediate execution
      if (dragState?.isDragging) {
        controller.queueCoordsUpdate(this.id || '');
        return;
      }

      // Normal execution for non-dragging objects
      return originalSetCoords.call(this);
    };

    // Override requestRenderAll during drag
    const originalRequestRenderAll = this.canvas.requestRenderAll;
    this.canvas.requestRenderAll = function() {
      if (controller.isGlobalDragMode) {
        controller.renderThrottle();
      } else {
        originalRequestRenderAll.call(this);
      }
    };
  }

  private setupDragEvents() {
    // Optimize object:moving event
    this.canvas.on('object:moving', (e) => {
      this.handleDragStart(e.target);
    });

    // Optimize object:modified event  
    this.canvas.on('object:modified', (e) => {
      this.handleDragEnd(e.target);
    });

    // Handle selection events
    this.canvas.on('selection:created', (e) => {
      if (e.selected && e.selected.length === 1) {
        this.prepareDragOptimization(e.selected[0]);
      }
    });

    this.canvas.on('selection:cleared', () => {
      this.clearAllDragStates();
    });

    // Emergency cleanup on mouse up
    this.canvas.on('mouse:up', () => {
      this.emergencyCleanup();
    });
  }

  private handleDragStart(object: FabricObject | undefined) {
    if (!object?.id) return;

    const dragState: DragState = {
      isDragging: true,
      dragStartTime: performance.now(),
      object,
      initialPosition: { x: object.left || 0, y: object.top || 0 },
      lastCoordsUpdate: 0
    };

    this.dragStates.set(object.id, dragState);
    this.isGlobalDragMode = true;

    // Optimize canvas for dragging
    this.enableDragMode();
    
    console.log(`🎯 Drag optimization started for object: ${object.type}`);
  }

  private handleDragEnd(object: FabricObject | undefined) {
    if (!object?.id) return;

    const dragState = this.dragStates.get(object.id);
    if (!dragState) return;

    const dragDuration = performance.now() - dragState.dragStartTime;
    console.log(`✅ Drag completed in ${dragDuration.toFixed(2)}ms`);

    // Mark as not dragging
    dragState.isDragging = false;

    // Force coords update now that drag is finished
    this.executeCoordsUpdate();

    // Clean up drag state
    this.dragStates.delete(object.id);

    // Disable drag mode if no more objects dragging
    if (this.dragStates.size === 0) {
      this.disableDragMode();
    }
  }

  private enableDragMode() {
    console.log('🚀 Global drag mode ENABLED');
    
    // Safari-specific drag optimizations
    if (this.isSafari) {
      this.canvas.set({
        renderOnAddRemove: false,
        skipTargetFind: false,
        perPixelTargetFind: false, // Critical for Safari performance
        imageSmoothingEnabled: false, // Reduce GPU load
        // enableRetinaScaling: false, // Reduce pixel density
        selection: true
      });
    } else {
      this.canvas.set({
        renderOnAddRemove: false,
        skipTargetFind: false,
        perPixelTargetFind: false,
      });
    }

    // Hide controls during drag for better performance
    const activeObject = this.canvas.getActiveObject();
    if (activeObject?.controls) {
      Object.keys(activeObject.controls).forEach(key => {
        if (activeObject.controls[key]) {
          activeObject.controls[key].setVisibility(false);
        }
      });
    }

    // Disable hover borders during drag
    this.canvas.hoverCursor = 'grabbing';
    this.canvas.moveCursor = 'grabbing';
  }

  private disableDragMode() {
    console.log('✅ Global drag mode DISABLED');
    this.isGlobalDragMode = false;

    // Safari-specific optimizations
    if (this.isSafari) {
      this.canvas.set({
        renderOnAddRemove: true,
        perPixelTargetFind: false, // Keep disabled for Safari
        imageSmoothingEnabled: false, // Keep disabled for Safari
        // enableRetinaScaling: false, // Keep disabled for Safari
        selection: true
      });
    } else {
      this.canvas.set({
        renderOnAddRemove: true,
        perPixelTargetFind: true,
      });
    }

    // Re-enable controls
    const activeObject = this.canvas.getActiveObject();
    if (activeObject?.controls) {
      Object.keys(activeObject.controls).forEach(key => {
        if (activeObject.controls[key]) {
          activeObject.controls[key].setVisibility(true);
        }
      });
    }

    // Restore cursors
    this.canvas.hoverCursor = 'move';
    this.canvas.moveCursor = 'move';

    // Force final render
    this.canvas.renderAll();
  }

  private queueCoordsUpdate(objectId: string) {
    this.coordsUpdateQueue.add(objectId);
    this.batchCoordsUpdate();
  }

  private executeCoordsUpdate() {
    if (this.coordsUpdateQueue.size === 0) return;

    console.log(`🔄 Batch updating coords for ${this.coordsUpdateQueue.size} objects`);

    // Update coordinates for all queued objects
    this.coordsUpdateQueue.forEach(objectId => {
      const object = this.canvas.getObjects().find(obj => obj.id === objectId);
      if (object) {
        // Call original setCoords method directly
        FabricObject.prototype.setCoords.call(object);
      }
    });

    this.coordsUpdateQueue.clear();
  }

  private performRender() {
    // Safari-specific render optimization
    if (this.isSafari) {
      // Reduce render quality during drag for Safari
      this.canvas.set({
        imageSmoothingEnabled: false,
        // enableRetinaScaling: false
      });
    }
    
    // Only render visible changes during drag
    this.canvas.renderAll();
  }

  private prepareDragOptimization(object: FabricObject) {
    // Pre-calculate expensive operations before drag starts
    if (object.type === 'ArcText') {
      // Prepare ArcText for optimized rendering
      const arcTextOptimizer = (window as any).arcTextOptimizer;
      if (arcTextOptimizer) {
        arcTextOptimizer.startDragOptimization(object.id);
      }
    }
    
    // Safari-specific object preparation
    if (this.isSafari && object.type === 'image') {
      // Disable expensive operations for images in Safari
      object.set({
        objectCaching: false,
        perPixelTargetFind: false
      });
    }
  }

  private clearAllDragStates() {
    this.dragStates.forEach((state, id) => {
      if (state.object.type === 'ArcText') {
        const arcTextOptimizer = (window as any).arcTextOptimizer;
        if (arcTextOptimizer) {
          arcTextOptimizer.endDragOptimization(id);
        }
      }
    });

    this.dragStates.clear();
    this.coordsUpdateQueue.clear();
    this.isGlobalDragMode = false;
  }

  private emergencyCleanup() {
    // Emergency cleanup in case events get missed
    setTimeout(() => {
      if (this.dragStates.size > 0) {
        console.log('🚨 Emergency drag cleanup triggered');
        this.clearAllDragStates();
        this.disableDragMode();
      }
    }, 200);
  }

  public getDragStats() {
    return {
      activeDrags: this.dragStates.size,
      queuedCoords: this.coordsUpdateQueue.size,
      isGlobalDragMode: this.isGlobalDragMode,
      isSafari: this.isSafari
    };
  }

  public forceCleanup() {
    this.clearAllDragStates();
    this.disableDragMode();
    this.executeCoordsUpdate();
  }

  public dispose() {
    this.batchCoordsUpdate.cancel();
    this.renderThrottle.cancel();
    this.clearAllDragStates();
  }
}