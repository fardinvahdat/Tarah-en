// Mobile-specific reload prevention utilities
import { ref } from "vue";

interface ReloadPreventionConfig {
  preventBeforeUnload: boolean;
  handleTouchEvents: boolean;
  preventBackNavigation: boolean;
  monitorMemoryUsage: boolean;
}

class MobileReloadPrevention {
  private config: ReloadPreventionConfig;
  private isActive = ref(false);
  private memoryMonitorInterval?: number;

  // For touch handling:
  private touchStartY = 0;
  private touchStartX = 0;
  private maybePreventPull = false;
  private activeTouchTarget: HTMLElement | null = null;

  private lastErrorTime = 0;

  constructor(config: Partial<ReloadPreventionConfig> = {}) {
    this.config = {
      preventBeforeUnload: true,
      handleTouchEvents: true,
      preventBackNavigation: true,
      monitorMemoryUsage: true,
      ...config,
    };
  }

  activate() {
    if (this.isActive.value) return;
    console.log("🛡️ Activating mobile reload prevention...");
    this.isActive.value = true;

    if (this.config.preventBeforeUnload) this.setupBeforeUnloadPrevention();
    if (this.config.handleTouchEvents) this.setupTouchEventHandling();
    if (this.config.preventBackNavigation) this.setupBackNavigationPrevention();
    if (this.config.monitorMemoryUsage) this.startMemoryMonitoring();

    this.setupErrorThrottling();
  }

  deactivate() {
    if (!this.isActive.value) return;
    console.log("🔓 Deactivating mobile reload prevention...");
    this.isActive.value = false;

    window.onbeforeunload = null;
    if (this.memoryMonitorInterval) clearInterval(this.memoryMonitorInterval);
  }

  private setupBeforeUnloadPrevention() {
    window.addEventListener("beforeunload", (e) => {
      if (location.pathname.includes("/studio") && this.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "You have unchanged changes. Are you sure?";
      }
    });

    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (k === "f5" || ((e.ctrlKey || e.metaKey) && k === "r")) {
        if (this.hasUnsavedChanges()) {
          e.preventDefault();
          this.showUnsavedChangesDialog();
        }
      }
    });
  }

  private setupTouchEventHandling() {
    // 1) touchstart: record start coords & find scrollable element
    document.addEventListener(
      "touchstart",
      (e) => {
        const touch = e.touches[0];
        this.touchStartY = touch.clientY;
        this.touchStartX = touch.clientX;

        // find nearest scrollable parent of the touched element
        this.activeTouchTarget = this.findScrollableParent(e.target as Element);
        // only consider pull-to-refresh if that container is at its top
        this.maybePreventPull = this.activeTouchTarget.scrollTop === 0;
      },
      { passive: true }
    );

    // 2) touchmove: block pull-to-refresh only when appropriate
    document.addEventListener(
      "touchmove",
      (e) => {
        const touch = e.touches[0];
        const deltaY = touch.clientY - this.touchStartY;
        const deltaX = Math.abs(touch.clientX - this.touchStartX);
        const absDeltaY = Math.abs(deltaY);

        // Pull-to-refresh: only when container was at top & pulling down
        if (
          this.maybePreventPull &&
          deltaY > 0 && // downward swipe
          absDeltaY > deltaX // mostly vertical
        ) {
          if (e.cancelable) {
            e.preventDefault();
            this.maybePreventPull = false;
          }
        }

        // Optional: prevent horizontal swipe in that container
        if (deltaX > absDeltaY && deltaX > 50) {
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      },
      { passive: false }
    );
  }

  private setupBackNavigationPrevention() {
    const inStudio = location.pathname.includes("/studio");
    if (inStudio) history.pushState(null, "", location.href);

    window.addEventListener("popstate", () => {
      if (inStudio && this.hasUnsavedChanges()) {
        history.pushState(null, "", location.href);
        this.showUnsavedChangesDialog();
      }
    });
  }

  private startMemoryMonitoring() {
    this.memoryMonitorInterval = setInterval(() => {
      const perfAny = performance as any;
      if (perfAny.memory) {
        const usage =
          perfAny.memory.usedJSHeapSize / perfAny.memory.jsHeapSizeLimit;
        if (usage > 0.85) {
          console.warn("🚨 High memory usage:", usage);
          this.handleHighMemoryUsage();
        }
      }
    }, 30_000);
  }

  private setupErrorThrottling() {
    window.addEventListener("error", (e) => {
      const now = Date.now();
      if (now - this.lastErrorTime < 1_000) {
        console.log("🚫 Error throttled to prevent reload loop");
        e.preventDefault();
        return false;
      }
      this.lastErrorTime = now;
    });
  }

  private findScrollableParent(el: Element): HTMLElement {
    let curr: Element | null = el;
    while (curr && curr !== document.documentElement) {
      const style = getComputedStyle(curr);
      const overflowY = style.overflowY;
      const overflowX = style.overflowX;
      if (
        (overflowY === "auto" || overflowY === "scroll") &&
        (curr as HTMLElement).scrollHeight > (curr as HTMLElement).clientHeight
      ) {
        return curr as HTMLElement;
      }
      if (
        (overflowX === "auto" || overflowX === "scroll") &&
        (curr as HTMLElement).scrollWidth > (curr as HTMLElement).clientWidth
      ) {
        return curr as HTMLElement;
      }
      curr = curr.parentElement;
    }
    // fallback to window-scrolling element
    return (document.scrollingElement ||
      document.documentElement) as HTMLElement;
  }

  private hasUnsavedChanges(): boolean {
    try {
      const canvas = (window as any).canvas;
      return !!(
        canvas &&
        (canvas.isDrawingMode || canvas.getActiveObjects().length > 0)
      );
    } catch {
      return false;
    }
  }

  private handleHighMemoryUsage() {
    console.log("🧹 Performing emergency memory cleanup...");
    window.dispatchEvent(new CustomEvent("memory:emergency-cleanup"));
    if ((window as any).gc) (window as any).gc();
    this.showMemoryWarning();
  }

  private showUnsavedChangesDialog() {
    console.log("📝 Showing unsaved changes dialog...");
    window.dispatchEvent(new CustomEvent("ui:show-unsaved-changes-dialog"));
  }

  private showMemoryWarning() {
    console.log("⚠️ Showing memory warning...");
    window.dispatchEvent(new CustomEvent("ui:show-memory-warning"));
  }
}

export const mobileReloadPrevention = new MobileReloadPrevention();

export function initMobileReloadPrevention() {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const isStudio = location.pathname.includes("/studio");
  if (isMobile && isStudio) {
    mobileReloadPrevention.activate();
  }
}
