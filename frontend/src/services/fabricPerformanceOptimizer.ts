// Critical Performance Optimizer for FabricJS - Addresses Root CPU Issues
import { Canvas, FabricObject, Group, Point } from 'fabric';
import { debounce, throttle } from 'lodash-es';

interface PerformanceConfig {
  maxObjectsBeforeOptimization: number;
  renderFrameRate: number;
  coordsUpdateDelay: number;
  enableViewportCulling: boolean;
  aggressiveMode: boolean;
}

interface ObjectState {
  id: string;
  isDragging: boolean;
  needsCoords: boolean;
  lastCoordsUpdate: number;
  isInViewport: boolean;
}

export class FabricPerformanceOptimizer {
  private canvas: Canvas;
  private config: PerformanceConfig;
  private objectStates = new Map<string, ObjectState>();
  private renderQueue = new Set<string>();
  private isOptimizing = false;
  private coordsUpdateRaf: number | null = null;
  private renderRaf: number | null = null;
  private isSafari: boolean;
  
  // Critical: Prevent setCoords spam
  private coordsThrottle = throttle(this.updateAllCoords.bind(this), 100);
  private renderThrottle = throttle(this.performRender.bind(this), 16); // 60fps max

  constructor(canvas: Canvas, config?: Partial<PerformanceConfig>) {
    this.canvas = canvas;
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.config = {
      maxObjectsBeforeOptimization: 10, // Less aggressive
      renderFrameRate: 60, // Keep normal frame rate
      coordsUpdateDelay: 100, // Normal delay
      enableViewportCulling: true,
      aggressiveMode: false, // Disable aggressive mode
      ...config
    };

    this.initialize();
  }

  private initialize() {
    this.enablePerformanceMode();
    this.setupEventListeners();
    this.optimizeCanvasSettings();
  }

  private enablePerformanceMode() {
    const objectCount = this.canvas.getObjects().length;
    this.isOptimizing = objectCount > this.config.maxObjectsBeforeOptimization;

    if (this.isOptimizing) {
      console.log('🚀 FabricJS Performance Mode ENABLED');
      
      // Safari-specific optimizations
      if (this.isSafari) {
        this.canvas.set({
          renderOnAddRemove: false,
          skipTargetFind: false,
          perPixelTargetFind: false, // Critical for Safari
          // enableRetinaScaling: false, // Reduce pixel density
          imageSmoothingEnabled: false, // Reduce GPU load
          selection: true,
          preserveObjectStacking: true
        });
      } else {
        this.canvas.set({
          renderOnAddRemove: false,
          skipTargetFind: false,
          perPixelTargetFind: false,
          // enableRetinaScaling: false,
          imageSmoothingEnabled: false
        });
      }
    }
  }

  private optimizeCanvasSettings() {
    // Override fabric's default setCoords behavior
    this.overrideSetCoordsMethod();
    this.overrideRenderMethods();
  }

  private overrideSetCoordsMethod() {
    const originalSetCoords = FabricObject.prototype.setCoords;
    const optimizer = this;

    FabricObject.prototype.setCoords = function(this: FabricObject) {
      if (!optimizer.isOptimizing) {
        return originalSetCoords.call(this);
      }

      // CRITICAL: Check if object is properly initialized
      if (!this.canvas || !this.id) {
        return originalSetCoords.call(this);
      }

      const state = optimizer.objectStates.get(this.id || '');
      if (!state) {
        optimizer.objectStates.set(this.id || '', {
          id: this.id || '',
          isDragging: false,
          needsCoords: true,
          lastCoordsUpdate: 0,
          isInViewport: true
        });
      }

      // CRITICAL: Safari-specific coords update optimization
      const now = performance.now();
      const coordsDelay = optimizer.isSafari ? 200 : optimizer.config.coordsUpdateDelay;
      
      if (!state || now - state.lastCoordsUpdate > coordsDelay) {
        try {
          const result = originalSetCoords.call(this);
          if (state) {
            state.lastCoordsUpdate = now;
            state.needsCoords = false;
          }
          return result;
        } catch (error) {
          console.warn('setCoords error, skipping optimization:', error);
          return originalSetCoords.call(this);
        }
      }

      // Mark for later update
      if (state) {
        state.needsCoords = true;
      }
    };
  }

  private overrideRenderMethods() {
    const originalRequestRenderAll = this.canvas.requestRenderAll;
    const optimizer = this;

    this.canvas.requestRenderAll = function() {
      if (!optimizer.isOptimizing) {
        return originalRequestRenderAll.call(this);
      }

      // Safari-specific render optimization
      if (optimizer.isSafari) {
        // Use RAF for Safari to prevent blocking
        if (optimizer.renderRaf) {
          cancelAnimationFrame(optimizer.renderRaf);
        }
        optimizer.renderRaf = requestAnimationFrame(() => {
          optimizer.renderThrottle();
          optimizer.renderRaf = null;
        });
      } else {
        // Queue render instead of immediate execution
        optimizer.queueRender();
      }
    };
  }

  private queueRender() {
    if (this.renderRaf) {
      cancelAnimationFrame(this.renderRaf);
    }

    this.renderRaf = requestAnimationFrame(() => {
      this.renderThrottle();
      this.renderRaf = null;
    });
  }

  private performRender() {
    if (this.config.enableViewportCulling) {
      this.performViewportCulling();
    }
    
    // Safari-specific render optimization
    if (this.isSafari) {
      // Reduce render quality for Safari
      this.canvas.set({
        imageSmoothingEnabled: false,
        // enableRetinaScaling: false
      });
    }
    
    this.canvas.renderAll();
  }

  private performViewportCulling() {
    const viewport = this.canvas.calcViewportBoundaries();
    const objects = this.canvas.getObjects();

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      const isInViewport = !(
        bounds.left > viewport.br.x ||
        bounds.top > viewport.br.y ||
        bounds.left + bounds.width < viewport.tl.x ||
        bounds.top + bounds.height < viewport.tl.y
      );

      // Hide objects outside viewport to reduce render load
      if (obj.visible !== isInViewport) {
        obj.set('visible', isInViewport);
      }

      const state = this.objectStates.get(obj.id || '');
      if (state) {
        state.isInViewport = isInViewport;
      }
    });
  }

  private updateAllCoords() {
    if (this.coordsUpdateRaf) {
      cancelAnimationFrame(this.coordsUpdateRaf);
    }

    this.coordsUpdateRaf = requestAnimationFrame(() => {
      this.objectStates.forEach((state, id) => {
        if (state.needsCoords && state.isInViewport) {
          const obj = this.canvas.getObjects().find(o => o.id === id);
          if (obj) {
            FabricObject.prototype.setCoords.call(obj);
            state.needsCoords = false;
            state.lastCoordsUpdate = performance.now();
          }
        }
      });
      this.coordsUpdateRaf = null;
    });
  }

  private setupEventListeners() {
    // Optimize object movement events
    this.canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (!obj) return;

      const state = this.objectStates.get(obj.id || '');
      if (state) {
        state.isDragging = true;
      }

      // During movement, disable expensive operations
      if (this.isOptimizing) {
        this.canvas.set({
          skipTargetFind: true,
          selection: false
        });

        // Hide controls during drag for better performance
        if (obj.controls) {
          Object.keys(obj.controls).forEach(key => {
            if (obj.controls[key]) {
              obj.controls[key].setVisibility(false);
            }
          });
        }
      }
    });

    this.canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (!obj) return;

      const state = this.objectStates.get(obj.id || '');
      if (state) {
        state.isDragging = false;
        state.needsCoords = true;
      }

      // Re-enable features after movement
      if (this.isOptimizing) {
        this.canvas.set({
          skipTargetFind: false,
          selection: true
        });

        // Show controls again
        if (obj.controls) {
          Object.keys(obj.controls).forEach(key => {
            if (obj.controls[key]) {
              obj.controls[key].setVisibility(true);
            }
          });
        }
      }

      // Batch coords update
      this.coordsThrottle();
    });

    // Clean up object states when objects are removed
    this.canvas.on('object:removed', (e) => {
      if (e.target?.id) {
        this.objectStates.delete(e.target.id);
      }
    });
  }

  // Public methods for external control
  public enableAggressiveMode() {
    this.config.aggressiveMode = true;
    this.canvas.set({
      renderOnAddRemove: false,
      skipTargetFind: true,
      perPixelTargetFind: false,
      // enableRetinaScaling: false,
      imageSmoothingEnabled: false,
      selection: false
    });
  }

  public disableAggressiveMode() {
    this.config.aggressiveMode = false;
    this.canvas.set({
      renderOnAddRemove: true,
      skipTargetFind: false,
      perPixelTargetFind: true,
      // enableRetinaScaling: true,
      imageSmoothingEnabled: true,
      selection: true
    });
  }

  public forceRender() {
    this.canvas.renderAll();
  }

  public forceUpdateCoords() {
    this.updateAllCoords();
  }

  public getPerformanceStats() {
    return {
      objectCount: this.canvas.getObjects().length,
      isOptimizing: this.isOptimizing,
      aggressiveMode: this.config.aggressiveMode,
      pendingCoordsUpdates: Array.from(this.objectStates.values()).filter(s => s.needsCoords).length,
      isSafari: this.isSafari
    };
  }

  public dispose() {
    if (this.renderRaf) {
      cancelAnimationFrame(this.renderRaf);
    }
    if (this.coordsUpdateRaf) {
      cancelAnimationFrame(this.coordsUpdateRaf);
    }
    this.coordsThrottle.cancel();
    this.renderThrottle.cancel();
    this.objectStates.clear();
  }
}