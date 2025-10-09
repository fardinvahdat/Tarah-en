/**
 * Large Image Performance Controller
 * Specifically handles performance issues with images larger than 1.5MB
 */

import { Canvas, FabricImage, FabricObject } from 'fabric';
import { debounce, throttle } from 'lodash-es';

interface LargeImageState {
  id: string;
  originalData: any;
  isOptimized: boolean;
  fileSize: number;
  dimensions: { width: number; height: number };
  lastSelectionTime: number;
  selectionCount: number;
}

export class LargeImagePerformanceController {
  private canvas: Canvas;
  private largeImages = new Map<string, LargeImageState>();
  private readonly SIZE_THRESHOLD = 1.5 * 1024 * 1024; // 1.5MB
  private readonly CRITICAL_SIZE = 3 * 1024 * 1024; // 3MB
  private isOptimizing = false;

  // Critical: Prevent selection spam
  private selectionThrottle = throttle(this.handleSelection.bind(this), 150);

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.initialize();
  }

  private initialize() {
    this.setupEventListeners();
    this.analyzeExistingImages();
  }

  private setupEventListeners() {
    // CRITICAL: Throttle selection events for large images
    this.canvas.on('selection:created', (e) => {
      const target = e.selected?.[0] || e.target;
      if (this.isLargeImage(target)) {
        e.e?.preventDefault?.();
        this.selectionThrottle(target, 'created');
      }
    });

    this.canvas.on('selection:updated', (e) => {
      const target = e.selected?.[0] || e.target;
      if (this.isLargeImage(target)) {
        e.e?.preventDefault?.();
        this.selectionThrottle(target, 'updated');
      }
    });

    this.canvas.on('selection:cleared', (e) => {
      this.handleSelectionCleared();
    });

    // CRITICAL: Override object selection for large images
    this.canvas.on('mouse:down', (e) => {
      const target = this.canvas.findTarget(e.e, false);
      if (this.isLargeImage(target)) {
        this.prepareForSelection(target as FabricImage);
      }
    });

    // Monitor object additions
    this.canvas.on('object:added', (e) => {
      if (e.target && this.isLargeImage(e.target)) {
        this.registerLargeImage(e.target as FabricImage);
      }
    });
  }

  private isLargeImage(object: FabricObject | undefined): boolean {
    if (!object || object.type !== 'image') return false;
    
    const img = object as FabricImage;
    const element = img.getElement() as HTMLImageElement;
    
    if (!element) return false;

    // Check if already tracked
    if (this.largeImages.has(object.id || '')) {
      return true;
    }

    // Estimate file size
    const estimatedSize = this.estimateImageSize(element);
    return estimatedSize > this.SIZE_THRESHOLD;
  }

  private estimateImageSize(element: HTMLImageElement): number {
    if (!element) return 0;
    
    // Try to get actual file size from src if it's a data URL
    if (element.src?.startsWith('data:')) {
      const base64Data = element.src.split(',')[1];
      if (base64Data) {
        return (base64Data.length * 3) / 4; // Base64 to bytes conversion
      }
    }
    
    // Fallback: estimate based on dimensions
    const pixelCount = element.naturalWidth * element.naturalHeight;
    return pixelCount * 0.5; // Rough JPEG compression estimate
  }

  private registerLargeImage(image: FabricImage) {
    const element = image.getElement() as HTMLImageElement;
    const fileSize = this.estimateImageSize(element);
    
    const state: LargeImageState = {
      id: image.id || '',
      originalData: image.toObject(),
      isOptimized: false,
      fileSize,
      dimensions: {
        width: element.naturalWidth,
        height: element.naturalHeight
      },
      lastSelectionTime: 0,
      selectionCount: 0
    };

    this.largeImages.set(image.id || '', state);
    
    // Auto-optimize critical size images
    if (fileSize > this.CRITICAL_SIZE) {
      this.optimizeImage(image, state);
    }

    console.log(`📊 Large image registered: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
  }

  private prepareForSelection(image: FabricImage) {
    const state = this.largeImages.get(image.id || '');
    if (!state) return;

    console.log(`🎯 Preparing large image selection: ${(state.fileSize / 1024 / 1024).toFixed(2)}MB`);
    
    // Emergency optimization for critical size
    if (state.fileSize > this.CRITICAL_SIZE && !state.isOptimized) {
      this.emergencyOptimizeImage(image, state);
    }

    // Disable expensive features temporarily
    this.canvas.set({
      perPixelTargetFind: false,
      skipTargetFind: false, // Keep false to allow selection
      renderOnAddRemove: false
    });
  }

  private handleSelection(target: FabricObject, type: 'created' | 'updated') {
    if (!target || target.type !== 'image') return;

    const state = this.largeImages.get(target.id || '');
    if (!state) return;

    const now = performance.now();
    state.lastSelectionTime = now;
    state.selectionCount++;

    console.log(`🖼️ Large image selected (${type}): ${state.selectionCount} times`);

    // CRITICAL: Skip setCoords for large images during selection
    if (target.setCoords) {
      const originalSetCoords = target.setCoords;
      target.setCoords = function() {
        // Skip coordinate calculation for large images
        console.log('⚡ Skipping setCoords for large image');
        return;
      };

      // Restore after a delay
      setTimeout(() => {
        target.setCoords = originalSetCoords;
        originalSetCoords.call(target);
      }, 200);
    }

    // Hide controls for very large images
    if (state.fileSize > this.CRITICAL_SIZE) {
      this.hideImageControls(target);
    }

    // Optimize rendering
    this.optimizeSelectionRendering(target as FabricImage);
  }

  private handleSelectionCleared() {
    // Restore canvas settings
    this.canvas.set({
      perPixelTargetFind: true,
      renderOnAddRemove: true
    });

    // Restore controls for all large images
    this.largeImages.forEach((state, id) => {
      const obj = this.canvas.getObjects().find(o => o.id === id);
      if (obj) {
        this.showImageControls(obj);
      }
    });
  }

  private optimizeImage(image: FabricImage, state: LargeImageState) {
    if (state.isOptimized) return;

    console.log(`🔧 Optimizing large image: ${(state.fileSize / 1024 / 1024).toFixed(2)}MB`);

    // Disable expensive features
    image.set({
      objectCaching: false, // Disable caching for large images
      perPixelTargetFind: false,
      shadow: null, // Remove shadows
      filters: [], // Remove filters temporarily
    });

    state.isOptimized = true;
  }

  private emergencyOptimizeImage(image: FabricImage, state: LargeImageState) {
    console.log(`🚨 Emergency optimization for ${(state.fileSize / 1024 / 1024).toFixed(2)}MB image`);

    // Most aggressive optimizations
    image.set({
      objectCaching: false,
      perPixelTargetFind: false,
      shadow: null,
      filters: [],
      stroke: null,
      strokeWidth: 0,
    });

    // Reduce image quality temporarily
    const element = image.getElement() as HTMLImageElement;
    if (element && element.style) {
      element.style.imageRendering = 'pixelated';
    }

    state.isOptimized = true;
  }

  private optimizeSelectionRendering(image: FabricImage) {
    // Use RAF to prevent blocking
    requestAnimationFrame(() => {
      // Only render the image, skip unnecessary updates
      this.canvas.renderAll();
    });
  }

  private hideImageControls(object: FabricObject) {
    if (!object.controls) return;

    Object.keys(object.controls).forEach(key => {
      if (object.controls[key]) {
        object.controls[key].setVisibility(false);
      }
    });
  }

  private showImageControls(object: FabricObject) {
    if (!object.controls) return;

    Object.keys(object.controls).forEach(key => {
      if (object.controls[key]) {
        object.controls[key].setVisibility(true);
      }
    });
  }

  private analyzeExistingImages() {
    const objects = this.canvas.getObjects();
    objects.forEach(obj => {
      if (obj.type === 'image' && this.isLargeImage(obj)) {
        this.registerLargeImage(obj as FabricImage);
      }
    });
  }

  // Public methods
  public getStats() {
    return {
      largeImageCount: this.largeImages.size,
      totalSize: Array.from(this.largeImages.values()).reduce((sum, state) => sum + state.fileSize, 0),
      optimizedCount: Array.from(this.largeImages.values()).filter(s => s.isOptimized).length,
      averageSelections: Array.from(this.largeImages.values()).reduce((sum, state) => sum + state.selectionCount, 0) / this.largeImages.size || 0
    };
  }

  public forceOptimizeAll() {
    this.largeImages.forEach((state, id) => {
      const obj = this.canvas.getObjects().find(o => o.id === id) as FabricImage;
      if (obj && !state.isOptimized) {
        this.optimizeImage(obj, state);
      }
    });
  }

  public dispose() {
    this.selectionThrottle.cancel();
    this.largeImages.clear();
  }
}