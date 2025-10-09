// ArcText Specific Performance Optimizer - Addresses Character Rendering Bottlenecks
import { ArcText } from "@/extension/object/ArcText";
import { debounce, throttle } from "lodash-es";

interface CharacterCache {
  char: string;
  transform: any;
  gradient: any;
  lastUsed: number;
}

interface RenderState {
  isRendering: boolean;
  isDirty: boolean;
  lastRender: number;
  cacheVersion: number;
}

export class ArcTextPerformanceOptimizer {
  private static instance: ArcTextPerformanceOptimizer;
  private characterCache = new Map<string, CharacterCache>();
  private renderStates = new Map<string, RenderState>();
  private maxCacheSize = 500;
  private cacheHitCount = 0;
  private cacheMissCount = 0;
  

  // Throttled render methods
  private throttledRender = throttle(this.performRender.bind(this), 16); // 60fps
  private debouncedCacheClean = debounce(this.cleanCache.bind(this), 5000);

  public static getInstance(): ArcTextPerformanceOptimizer {
    if (!ArcTextPerformanceOptimizer.instance) {
      ArcTextPerformanceOptimizer.instance = new ArcTextPerformanceOptimizer();
    }
    return ArcTextPerformanceOptimizer.instance;
  }

  constructor() {
    this.overrideArcTextMethods();
  }

  private overrideArcTextMethods() {
    const originalRenderCharCallback = ArcText.prototype.renderCharCallback;
    const optimizer = this;

    // Override the most expensive method in ArcText
    ArcText.prototype.renderCharCallback = function (
      method: any,
      ctx: CanvasRenderingContext2D,
      lineIndex: number,
      charIndex: number,
      endCharIndex: number,
      left: number,
      top: number,
      fullDecl: any
    ) {
      if (!optimizer.shouldOptimize(this)) {
        return originalRenderCharCallback.call(
          this,
          method,
          ctx,
          lineIndex || 0,
          charIndex,
          endCharIndex,
          left,
          top,
          fullDecl
        );
      }

      // Use optimized rendering
      optimizer.renderCharactersOptimized.call(
        this,
        method,
        ctx,
        lineIndex,
        charIndex,
        endCharIndex,
        left,
        top,
        fullDecl
      );
    };

    // Override dimension calculations
    const originalInitDimensions = ArcText.prototype.initDimensions;
    ArcText.prototype.initDimensions = function () {
      const state = optimizer.getRenderState(this.id || "");

      // Skip expensive recalculations if not dirty
      if (state && !state.isDirty && state.cacheVersion > 0) {
        return;
      }

      const result = originalInitDimensions.call(this);

      if (state) {
        state.isDirty = false;
        state.cacheVersion++;
      }

      return result;
    };
  }

  private shouldOptimize(arcText: ArcText): boolean {
    // Optimize if text is long or has complex styling
    return (
      arcText.text.length > 10 ||
      this.hasComplexStyling(arcText) ||
      this.isInMovement(arcText)
    );
  }

  private hasComplexStyling(arcText: ArcText): boolean {
    return (
      !!(arcText.fill && typeof arcText.fill === "object") || // Has gradient
      arcText.stroke !== undefined ||
      arcText.shadow !== undefined
    );
  }

  private isInMovement(arcText: ArcText): boolean {
    const state = this.getRenderState(arcText.id || "");
    return state ? state.isRendering : false;
  }

  private renderCharactersOptimized(
    this: ArcText,
    method: any,
    ctx: CanvasRenderingContext2D,
    lineIndex: number,
    charIndex: number,
    endCharIndex: number,
    left: number,
    top: number,
    fullDecl: any
  ) {
    const optimizer = ArcTextPerformanceOptimizer.getInstance();
    const charTransformations = this.getCharTransformations();

    // Batch character rendering to reduce context switches
    const characters = [];
    for (let index = charIndex; index <= endCharIndex; index++) {
      debugger
      const tr = charTransformations[lineIndex][index];
      if (tr.char) {
        characters.push({ index, tr });
      }
    }

    // Group characters by similar transforms to batch rendering
    const batches = optimizer.groupCharactersByTransform(characters);

    batches.forEach((batch) => {
      ctx.save();

      // Apply common transform for the batch
      optimizer.applyBatchTransform(ctx, batch);

      // Render all characters in the batch
      batch.forEach(({ tr }) => {
        optimizer.renderSingleCharacterCached(ctx, method, tr, fullDecl);
      });

      ctx.restore();
    });
  }

  private groupCharactersByTransform(characters: any[]): any[][] {
    // Simple grouping by angle similarity (within 0.1 radians)
    const batches: any[][] = [];
    let currentBatch: any[] = [];
    let lastAngle = null;

    characters.forEach((char) => {
      const angle = Math.round(char.tr.charAngle * 10) / 10; // Round to 0.1

      if (lastAngle === null || Math.abs(angle - lastAngle) < 0.1) {
        currentBatch.push(char);
      } else {
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
        }
        currentBatch = [char];
      }
      lastAngle = angle;
    });

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  private applyBatchTransform(ctx: CanvasRenderingContext2D, batch: any[]) {
    if (batch.length === 0) return;

    // Use the first character's transform as the base
    // const baseTransform = batch[0]?.tr;
    ctx.textAlign = "center";
  }

  private renderSingleCharacterCached(
    ctx: CanvasRenderingContext2D,
    method: any,
    tr: any,
    fullDecl: any
  ) {
    const cacheKey = this.generateCacheKey(tr.char, tr.charAngle, fullDecl);
    const cached = this.characterCache.get(cacheKey);

    if (cached && performance.now() - cached.lastUsed < 10000) {
      // 10 second cache
      this.cacheHitCount++;
      cached.lastUsed = performance.now();

      // Use cached render data
      this.applyCachedRender(ctx, cached, tr);
    } else {
      this.cacheMissCount++;

      // Render and cache
      this.renderAndCacheCharacter(ctx, method, tr, fullDecl, cacheKey);
    }
  }

  private generateCacheKey(char: string, angle: number, fullDecl: any): string {
    const roundedAngle = Math.round(angle * 100) / 100; // Round to 0.01
    const fillKey =
      typeof fullDecl.fill === "string" ? fullDecl.fill : "gradient";
    return `${char}_${roundedAngle}_${fillKey}_${fullDecl.fontSize || 16}`;
  }

  private applyCachedRender(
    ctx: CanvasRenderingContext2D,
    cached: CharacterCache,
    tr: any
  ) {
    ctx.save();
    ctx.translate(tr.cl.x, tr.cl.y);
    ctx.rotate(tr.charAngle);

    // Apply cached transform
    if (cached.transform) {
      ctx.fillStyle = cached.transform.fillStyle || ctx.fillStyle;
    }

    ctx.fillText(cached.char, 0, 0);
    ctx.restore();
  }

  private renderAndCacheCharacter(
    ctx: CanvasRenderingContext2D,
    method: any,
    tr: any,
    fullDecl: any,
    cacheKey: string
  ) {
    ctx.save();
    ctx.translate(tr.cl.x, tr.cl.y);
    ctx.rotate(tr.charAngle);

    // Store original fillStyle
    const originalFillStyle = ctx.fillStyle;

    // Apply gradient if needed (simplified)
    if (fullDecl.fill && typeof fullDecl.fill === "object") {
      // Simplified gradient application for performance
      ctx.fillStyle = this.createSimplifiedGradient(ctx, fullDecl.fill);
    }

    ctx.fillText(tr.char, 0, 0);

    // Cache the result
    if (this.characterCache.size < this.maxCacheSize) {
      this.characterCache.set(cacheKey, {
        char: tr.char,
        transform: {
          fillStyle: ctx.fillStyle,
        },
        gradient: fullDecl.fill,
        lastUsed: performance.now(),
      });
    }

    ctx.restore();
    this.debouncedCacheClean();
  }

  private createSimplifiedGradient(
    ctx: CanvasRenderingContext2D,
    gradient: any
  ): string {
    // For performance, use a simplified gradient approach
    if (gradient.colorStops && gradient.colorStops.length > 0) {
      // Use the dominant color for performance
      // return gradient.colorStops[0].color;
    }
    return "#000000";
  }

  private getRenderState(id: string): RenderState {
    let state = this.renderStates.get(id);
    if (!state) {
      state = {
        isRendering: false,
        isDirty: true,
        lastRender: 0,
        cacheVersion: 0,
      };
      this.renderStates.set(id, state);
    }
    return state;
  }

  private performRender() {
    // Implement batched rendering logic
    console.log("🎨 ArcText batch render executed");
  }

  private cleanCache() {
    const now = performance.now();
    const expiredKeys: string[] = [];

    this.characterCache.forEach((cache, key) => {
      if (now - cache.lastUsed > 30000) {
        // 30 seconds
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => this.characterCache.delete(key));

    console.log(`🧹 Cleaned ${expiredKeys.length} cached characters`);
  }

  public startDragOptimization(arcTextId: string) {
    const state = this.getRenderState(arcTextId);
    state.isRendering = true;
  }

  public endDragOptimization(arcTextId: string) {
    const state = this.getRenderState(arcTextId);
    state.isRendering = false;
    state.isDirty = true;
  }

  public getCacheStats() {
    return {
      cacheSize: this.characterCache.size,
      hitCount: this.cacheHitCount,
      missCount: this.cacheMissCount,
      hitRate:
        (this.cacheHitCount / (this.cacheHitCount + this.cacheMissCount)) * 100,
    };
  }

  public clearCache() {
    this.characterCache.clear();
    this.renderStates.clear();
    this.cacheHitCount = 0;
    this.cacheMissCount = 0;
  }
}
