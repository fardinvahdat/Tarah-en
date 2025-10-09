import { watch } from "vue";
import { storeToRefs } from "pinia";
import {
  Canvas,
  FabricObject,
  FabricImage,
  Textbox,
  Group,
  Point,
  IText,
  Line,
  ModifiedEvent,
} from "fabric";
import {
  WorkSpaceThumbType,
  WorkSpaceDrawType,
  propertiesToInclude,
  WorkSpaceCommonType,
} from "@/configs/canvas";
import { useFabricStore } from "@/store/modules/fabric";
import { useElementBounding } from "@vueuse/core";
import { FabricTool } from "@/app/fabricTool";
import { FabricGuide } from "@/app/fabricGuide";
import { HoverBorders } from "@/app/hoverBorders";
import { WheelScroll } from "@/app/wheelScroll";
import { FabricRuler } from "@/app/fabricRuler";
import { FabricTouch } from "@/app/fabricTouch";
import { isMobile } from "@/utils/common";
import { FabricCanvas } from "@/app/fabricCanvas";
import { Keybinding } from "@/app/keybinding";
import { defaultControls, textboxControls } from "@/app/fabricControls";
import { getObjectsBoundingBox } from "@/extension/util/common";
import { useTemplatesStore } from "@/store";
import useCommon from "./useCommon";
import { SnapshotType, Snapshot } from "@/types/history";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import { nonid } from "@/utils/common";
import { WebGLContextManager } from "@/services/webglContextManager";
import { imageOptimizerService } from "@/services/imageOptimizerService";
import { MobileInteractionController } from "@/services/mobileInteractionController";
import { FabricPerformanceOptimizer } from "@/services/fabricPerformanceOptimizer";
import { ArcTextPerformanceOptimizer } from "@/services/arcTextPerformanceOptimizer";
import { DragPerformanceController } from "@/services/dragPerformanceController";
import { LargeImagePerformanceController } from "@/services/largeImagePerformanceController";
import { safariOptimizer } from '@/services/safariOptimizer'

// Debounce helper: ensures fn runs at most once per animation frame
function debounceRaf<T extends (...args: any[]) => void>(fn: T): T {
  let frame: number | null = null;
  return ((...args: any[]) => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = null;
      fn(...args);
    });
  }) as T;
}

let canvas: FabricCanvas | null = null;
let webglContextManager: WebGLContextManager | null = null;
let mobileInteractionController: MobileInteractionController | null = null;
let performanceOptimizer: FabricPerformanceOptimizer | null = null;
let dragController: DragPerformanceController | null = null;
let largeImageController: LargeImagePerformanceController | null = null;

// Initial Fabric defaults
const initConf = () => {
  FabricObject.ownDefaults.objectCaching = false;
  FabricObject.ownDefaults.borderColor = "blue";
  FabricObject.ownDefaults.cornerColor = "white";
  FabricObject.ownDefaults.cornerStrokeColor = "#22319e";
  FabricObject.ownDefaults.borderOpacityWhenMoving = 1;
  FabricObject.ownDefaults.borderScaleFactor = 1;
  FabricObject.ownDefaults.cornerSize = 10;
  FabricObject.ownDefaults.cornerStyle = "circle";
  FabricObject.ownDefaults.centeredScaling = false;
  FabricObject.ownDefaults.centeredRotation = true;
  FabricObject.ownDefaults.transparentCorners = false;
  FabricObject.ownDefaults.controls = defaultControls();

  Object.assign(Textbox.ownDefaults, { controls: textboxControls() });

  // Mixins for width/height convenience
  const mixin = {
    getWidthHeight(noFixed = false): Point {
      const objScale = (this as FabricObject).getObjectScaling();
      const point = (this as FabricObject)._getTransformedDimensions({
        scaleX: objScale.x,
        scaleY: objScale.y,
      });
      if (!noFixed) {
        point.setX(point.x);
        point.setY(point.y);
      }
      return point;
    },
    getHeight() {
      return this.getWidthHeight().y;
    },
    getWidth() {
      return this.getWidthHeight().x;
    },
  };
  Object.assign(FabricObject.prototype, mixin);

  // Mobile-specific object optimizations
  FabricObject.prototype.optimizeForMobile = function () {
    if (isMobile()) {
      this.set({
        perPixelTargetFind: false,
        objectCaching: true,
        statefullCache: true,
        borderOpacityWhenMoving: 0.7,
        cornerSize: 12,
        touchCornerSize: 16,
      });
    }
    return this;
  };

  // Enhanced WebGL handling
  Canvas.prototype.initializeWebGLHandling = function () {
    if (this.contextContainer?.tagName === "CANVAS") {
      webglContextManager = new WebGLContextManager(this as FabricCanvas);
      if (isMobile) {
        mobileInteractionController = new MobileInteractionController(
          this as FabricCanvas
        );
      }
    }
  };
};

// Resize & center canvas to content
const setCanvasTransform = () => {
  if (!canvas) return;
  const fabricStore = useFabricStore();
  const { zoom, wrapperRef, scalePercentage } = storeToRefs(fabricStore);
  const { width, height } = useElementBounding(wrapperRef.value);
  canvas.setDimensions({ width: width.value, height: height.value });

  const objects = canvas
    .getObjects()
    .filter((o) => !WorkSpaceThumbType.includes(o.id));
  const boundingBox = getObjectsBoundingBox(objects);
  if (!boundingBox) return;
  let { width: boxWidth, height: boxHeight, centerX, centerY } = boundingBox;

  const draw = canvas.getObjects().find((o) => o.id === WorkSpaceDrawType);
  if (draw) {
    boxWidth = draw.width;
    boxHeight = draw.height;
    centerX = draw.left + draw.width / 2;
    centerY = draw.top + draw.height / 2;
  }

  zoom.value =
    (Math.min(canvas.getWidth() / boxWidth, canvas.getHeight() / boxHeight) *
      scalePercentage.value) /
    100;
  canvas.setZoom(zoom.value);
  canvas.absolutePan(
    new Point(centerX, centerY)
      .scalarMultiply(zoom.value)
      .subtract(canvas.getCenterPoint()),
    true
  );
};

// Initialize the FabricCanvas and tools
const initCanvas = () => {
  const fabricStore = useFabricStore();
  const { canvasRef } = storeToRefs(fabricStore);
  if (!canvasRef.value) return;

  const isLowEnd = detectLowEndDevice();
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  canvas = new FabricCanvas(canvasRef.value, {
    width: fabricStore.getWidth(),
    height: fabricStore.getHeight(),
    renderOnAddRemove: false,
    skipOffscreen: true,
    renderer: isLowEnd ? undefined : "webgl", // Keep WebGL for now
    imageSmoothingEnabled: true, // Keep enabled for now
    allowTouchScrolling: isMobile(),
    selection: true,
    preserveObjectStacking: true,
    perPixelTargetFind: !isMobile(),
    targetFindTolerance: isMobile() ? 8 : 4,
    devicePixelRatio: false,
  });

  // CRITICAL: Initialize Safari optimizer (but less aggressive)
  if (isSafari) {
    safariOptimizer.setCanvas(canvas);
    console.log('🦁 Safari optimizer initialized (conservative mode)');
  }

  // Debounced renderAll
  const renderDebounced = debounceRaf(() => canvas?.renderAll());
  let debounceTimeout: ReturnType<typeof setTimeout>;

  // CRITICAL: Remove the performance-killing event handlers
  // These events are now handled by DragPerformanceController for optimal performance

  // Initialize tools & plugins
  new FabricTool(canvas);
  new FabricGuide(canvas);
  new HoverBorders(canvas);
  new WheelScroll(canvas);
  new FabricRuler(canvas);
  new FabricTouch(canvas);
  new Keybinding();
  canvas.preserveObjectStacking = true;
  canvas.initializeWebGLHandling();
  if (isMobile()) setupImageOptimizations(canvas);

  // CRITICAL: Initialize performance optimizers (less aggressive)
  performanceOptimizer = new FabricPerformanceOptimizer(canvas, {
    maxObjectsBeforeOptimization: 10, // Less aggressive
    enableViewportCulling: true,
    aggressiveMode: false, // Disable aggressive mode for now
  });

  dragController = new DragPerformanceController(canvas);
  
  // CRITICAL: Initialize large image controller for images >1.5MB
  largeImageController = new LargeImagePerformanceController(canvas);

  console.log("🚀 Performance optimizers initialized (conservative mode)");
  canvas.renderAll();
};

// Hook up modification events to history
const initEvent = () => {
  if (!canvas) return;
  const { templateId } = storeToRefs(useTemplatesStore());
  canvas.on("object:modified", (e: ModifiedEvent) => {
    const active = canvas._activeObject;
    if (!active) return;
    if (!active.id) active.set({ id: nonid(8) });

    const target = active.toObject(propertiesToInclude);
    const index = canvas._objects.findIndex((o) => o.id === active.id);
    if (index < 0) return;

    const data: Snapshot = {
      type: SnapshotType.MODIFY,
      index,
      target,
      transform: e.transform,
      action: e.action,
      tid: templateId.value,
    };
    useHistorySnapshot().addHistorySnapshot(data);
  });
};

// Load template JSON
const initTemplate = async (templateId?: number) => {
  if (!canvas) return;
  const { initCommon } = useCommon();
  const { currentTemplate } = storeToRefs(useTemplatesStore());
  if (templateId && Number(templateId) > 0) return;
  await canvas.loadFromJSON(currentTemplate.value);
  setCanvasTransform();
  initCommon();
  initEvent();
};

// Public initializer
export const initEditor = async (templateId?: number) => {
  initConf();
  initCanvas();
  await initTemplate(templateId);
  watch(
    [
      () => useFabricStore().wrapperRef?.value?.clientWidth,
      () => useFabricStore().wrapperRef?.value?.clientHeight,
    ],
    () => setCanvasTransform()
  );
};

// Low-end device detection
const detectLowEndDevice = (): boolean => {
  if ("deviceMemory" in navigator) {
    return (navigator as any).deviceMemory <= 2;
  }
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl");
  if (gl) {
    const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const renderer = gl.getParameter(gl.RENDERER).toLowerCase();
    const lowGPUs = [
      "adreno 3",
      "adreno 4",
      "mali-4",
      "mali-t6",
      "mali-t7",
      "powervr sgx",
    ];
    return maxTex < 2048 || lowGPUs.some((g) => renderer.includes(g));
  }
  return false;
};

// Mobile image optimization
const setupImageOptimizations = (canvas: FabricCanvas) => {
  const orig = FabricImage.fromURL;
  FabricImage.fromURL = async (url: string, opts?: any) => {
    try {
      // CRITICAL: Safari-specific optimization
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      // Safari-specific image loading optimization
      if (isSafari) {
        // Use blob URL for better Safari performance
        if (url.startsWith('data:')) {
          const response = await fetch(url);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          img.src = blobUrl;
          
          // Clean up blob URL after loading
          img.onload = () => {
            URL.revokeObjectURL(blobUrl);
          };
        } else {
          img.src = url;
        }
      } else {
        img.src = url;
      }
      
      await new Promise((r, e) => {
        img.onload = r;
        img.onerror = e;
      });
      
      // CRITICAL: Optimize image before adding to canvas
      const optimized = await imageOptimizerService.optimizeImage(img);
      const fImg = new FabricImage(optimized.optimized, opts);
      
      // Safari-specific object optimizations
      if (isSafari) {
        fImg.set({
          objectCaching: false, // Disable caching in Safari
          perPixelTargetFind: false, // Disable per-pixel targeting
          selectable: true,
          evented: true
        });
      }
      
      return fImg.optimizeForMobile();
    } catch (error) {
      console.warn('Image optimization failed, using original:', error);
      return orig.call(FabricImage, url, opts);
    }
  };
  
  // Safari-specific WebGL context handling
  canvas.on("webgl:context-lost", () => {
    console.log('🔄 WebGL context lost, recovering...');
    imageOptimizerService.clearPool();
    
    // Force canvas re-initialization for Safari
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      setTimeout(() => {
        canvas.requestRenderAll();
      }, 100);
    }
  });
  
  // Safari-specific touch event optimization
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    canvas.set({
      allowTouchScrolling: false, // Disable touch scrolling in Safari
      selection: true,
      preserveObjectStacking: true
    });
  }
};

export default (): [FabricCanvas] => [canvas as FabricCanvas];
