/**
 * Hybrid PixiJS + Fabric.js Rendering System
 * This system uses PixiJS for high-performance rendering and Fabric.js for interactions
 * Optimized specifically for low-end mobile devices
 */

import { Application, Container, Sprite, Graphics, Text as PixiText, Texture, Ticker } from 'pixi.js'
import { FabricCanvas } from '@/app/fabricCanvas'
import { FabricObject, Image as FabricImage, Textbox as FabricTextbox, Path as FabricPath } from 'fabric'

interface RenderableObject {
  id: string
  type: string
  fabricObject: FabricObject
  pixiObject?: Container
  needsUpdate: boolean
  lastRenderTime: number
  priority: 'high' | 'medium' | 'low'
}

interface ViewportBounds {
  left: number
  top: number
  right: number
  bottom: number
}

export class HybridPixiFabricRenderer {
  private pixiApp: Application
  private fabricCanvas: FabricCanvas
  private renderableObjects = new Map<string, RenderableObject>()
  private viewportBounds: ViewportBounds = { left: 0, top: 0, right: 0, bottom: 0 }
  private renderQueue: string[] = []
  private isRendering = false
  private frameId: number | null = null
  
  // Mobile optimization flags
  private isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  private isLowEndDevice = navigator.hardwareConcurrency <= 2
  private maxFPS = this.isMobile ? 30 : 60
  private frameInterval = 1000 / this.maxFPS
  private lastFrameTime = 0
  
  // Performance settings
  private readonly MAX_RENDERED_OBJECTS = this.isMobile ? 30 : 100
  private readonly VIEWPORT_PADDING = 50 // Extra pixels around viewport
  private readonly TEXTURE_CACHE_SIZE = this.isMobile ? 20 : 50

  constructor(fabricCanvas: FabricCanvas, container: HTMLElement) {
    this.fabricCanvas = fabricCanvas
    this.initPixiApplication(container)
    this.setupEventListeners()
    this.startRenderLoop()
  }

  private initPixiApplication(container: HTMLElement) {
    // Optimized PixiJS settings for mobile
    this.pixiApp = new Application({
      width: container.clientWidth,
      height: container.clientHeight,
      resolution: this.isMobile ? 1 : Math.min(window.devicePixelRatio, 2),
      antialias: !this.isLowEndDevice, // Disable antialiasing on low-end devices
      backgroundAlpha: 0,
      clearBeforeRender: true,
      preserveDrawingBuffer: false, // Better performance
      powerPreference: this.isMobile ? 'low-power' : 'high-performance'
    })

    // Configure ticker for mobile optimization
    this.pixiApp.ticker.maxFPS = this.maxFPS
    this.pixiApp.ticker.minFPS = 15 // Minimum acceptable FPS

    // Position PixiJS canvas behind Fabric.js canvas
    this.pixiApp.view.style.position = 'absolute'
    this.pixiApp.view.style.left = '0'
    this.pixiApp.view.style.top = '0'
    this.pixiApp.view.style.zIndex = '1'
    this.pixiApp.view.style.pointerEvents = 'none' // Let Fabric.js handle interactions
    
    container.insertBefore(this.pixiApp.view as any, container.firstChild)
  }

  private setupEventListeners() {
    // Listen to Fabric.js events
    this.fabricCanvas.on('after:render', this.onFabricRender.bind(this))
    this.fabricCanvas.on('object:moving', this.onObjectMoving.bind(this))
    this.fabricCanvas.on('object:modified', this.onObjectModified.bind(this))
    this.fabricCanvas.on('path:created', this.onPathCreated.bind(this))
    this.fabricCanvas.on('viewport:change', this.onViewportChange.bind(this))

    // Viewport change detection
    this.fabricCanvas.on('mouse:wheel', this.scheduleViewportUpdate.bind(this))
    this.fabricCanvas.on('mouse:move', this.scheduleViewportUpdate.bind(this))
  }

  private onFabricRender() {
    // Sync all objects when Fabric renders
    this.syncAllObjects()
  }

  private onObjectMoving(e: any) {
    if (e.target?.id) {
      this.markObjectForUpdate(e.target.id, 'high')
    }
  }

  private onObjectModified(e: any) {
    if (e.target?.id) {
      this.markObjectForUpdate(e.target.id, 'high')
    }
  }

  private onPathCreated(e: any) {
    if (e.path?.id) {
      this.addObject(e.path)
    }
  }

  private scheduleViewportUpdate = this.debounce(() => {
    this.updateViewportBounds()
    this.performViewportCulling()
  }, 50)

  private onViewportChange() {
    this.updateViewportBounds()
    this.performViewportCulling()
  }

  // Add Fabric.js object to hybrid renderer
  public addObject(fabricObject: FabricObject) {
    if (!fabricObject.id) return

    const renderableObject: RenderableObject = {
      id: fabricObject.id,
      type: fabricObject.type || 'unknown',
      fabricObject,
      needsUpdate: true,
      lastRenderTime: 0,
      priority: this.getObjectPriority(fabricObject)
    }

    this.renderableObjects.set(fabricObject.id, renderableObject)
    this.scheduleRender(fabricObject.id)
  }

  // Remove object from hybrid renderer
  public removeObject(objectId: string) {
    const renderableObject = this.renderableObjects.get(objectId)
    if (renderableObject?.pixiObject) {
      this.pixiApp.stage.removeChild(renderableObject.pixiObject)
      renderableObject.pixiObject.destroy({ children: true, texture: false })
    }
    this.renderableObjects.delete(objectId)
  }

  // Mark object for update
  private markObjectForUpdate(objectId: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    const renderableObject = this.renderableObjects.get(objectId)
    if (renderableObject) {
      renderableObject.needsUpdate = true
      renderableObject.priority = priority
      this.scheduleRender(objectId)
    }
  }

  // Get object rendering priority
  private getObjectPriority(fabricObject: FabricObject): 'high' | 'medium' | 'low' {
    // High priority for selected/active objects
    if (fabricObject === this.fabricCanvas.getActiveObject()) return 'high'
    
    // Medium priority for text and paths
    if (fabricObject.type === 'textbox' || fabricObject.type === 'path') return 'medium'
    
    // Low priority for static images
    if (fabricObject.type === 'image') return 'low'
    
    return 'medium'
  }

  // Schedule object for rendering
  private scheduleRender(objectId: string) {
    if (!this.renderQueue.includes(objectId)) {
      this.renderQueue.push(objectId)
    }
    
    if (!this.isRendering) {
      this.requestRender()
    }
  }

  // Request frame for rendering
  private requestRender() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
    }

    this.frameId = requestAnimationFrame(this.processRenderQueue.bind(this))
  }

  // Process rendering queue with frame rate limiting
  private processRenderQueue(timestamp: number) {
    if (timestamp - this.lastFrameTime < this.frameInterval) {
      this.frameId = requestAnimationFrame(this.processRenderQueue.bind(this))
      return
    }

    this.lastFrameTime = timestamp
    this.isRendering = true

    const startTime = performance.now()
    const maxProcessingTime = this.isMobile ? 8 : 16 // 8ms for mobile, 16ms for desktop

    // Sort queue by priority
    this.renderQueue.sort((a, b) => {
      const objA = this.renderableObjects.get(a)
      const objB = this.renderableObjects.get(b)
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      
      return (priorityOrder[objB?.priority || 'low'] || 0) - (priorityOrder[objA?.priority || 'low'] || 0)
    })

    // Process queue until time limit
    while (this.renderQueue.length > 0 && (performance.now() - startTime) < maxProcessingTime) {
      const objectId = this.renderQueue.shift()!
      this.renderObject(objectId)
    }

    // Continue processing if queue not empty
    if (this.renderQueue.length > 0) {
      this.frameId = requestAnimationFrame(this.processRenderQueue.bind(this))
    } else {
      this.isRendering = false
      this.frameId = null
    }
  }

  // Render individual object to PixiJS
  private renderObject(objectId: string) {
    const renderableObject = this.renderableObjects.get(objectId)
    if (!renderableObject || !renderableObject.needsUpdate) return

    const { fabricObject } = renderableObject

    // Viewport culling - skip if object is outside viewport
    if (!this.isObjectInViewport(fabricObject)) {
      if (renderableObject.pixiObject) {
        renderableObject.pixiObject.visible = false
      }
      renderableObject.needsUpdate = false
      return
    }

    try {
      // Create or update PixiJS object
      if (!renderableObject.pixiObject) {
        renderableObject.pixiObject = this.createPixiObject(fabricObject)
        if (renderableObject.pixiObject) {
          this.pixiApp.stage.addChild(renderableObject.pixiObject)
        }
      } else {
        this.updatePixiObject(renderableObject.pixiObject, fabricObject)
      }

      renderableObject.needsUpdate = false
      renderableObject.lastRenderTime = performance.now()
    } catch (error) {
      console.warn(`Failed to render object ${objectId}:`, error)
    }
  }

  // Create PixiJS object from Fabric.js object
  private createPixiObject(fabricObject: FabricObject): Container | null {
    switch (fabricObject.type) {
      case 'image':
        return this.createPixiImage(fabricObject as FabricImage)
      case 'textbox':
        return this.createPixiText(fabricObject as FabricTextbox)
      case 'path':
        return this.createPixiPath(fabricObject as FabricPath)
      default:
        return this.createPixiGraphics(fabricObject)
    }
  }

  // Create PixiJS image sprite
  private createPixiImage(fabricImage: FabricImage): Container | null {
    try {
      const container = new Container()
      const texture = Texture.from(fabricImage.getSrc())
      const sprite = new Sprite(texture)
      
      // Apply transformations
      this.applyTransformations(container, fabricImage)
      container.addChild(sprite)
      
      return container
    } catch (error) {
      console.warn('Failed to create PixiJS image:', error)
      return null
    }
  }

  // Create PixiJS text
  private createPixiText(fabricTextbox: FabricTextbox): Container | null {
    try {
      const container = new Container()
      const pixiText = new PixiText(fabricTextbox.text || '', {
        fontFamily: fabricTextbox.fontFamily || 'Arial',
        fontSize: fabricTextbox.fontSize || 16,
        fill: fabricTextbox.fill || '#000000',
        wordWrap: true,
        wordWrapWidth: fabricTextbox.width || 200
      })
      
      this.applyTransformations(container, fabricTextbox)
      container.addChild(pixiText)
      
      return container
    } catch (error) {
      console.warn('Failed to create PixiJS text:', error)
      return null
    }
  }

  // Create PixiJS graphics for paths
  private createPixiPath(fabricPath: FabricPath): Container | null {
    try {
      const container = new Container()
      const graphics = new Graphics()
      
      // Basic path rendering (simplified for performance)
      graphics.lineStyle(fabricPath.strokeWidth || 1, fabricPath.stroke as any || 0x000000)
      graphics.moveTo(0, 0)
      // Add path drawing logic here
      
      this.applyTransformations(container, fabricPath)
      container.addChild(graphics)
      
      return container
    } catch (error) {
      console.warn('Failed to create PixiJS path:', error)
      return null
    }
  }

  // Create basic graphics for other objects
  private createPixiGraphics(fabricObject: FabricObject): Container | null {
    try {
      const container = new Container()
      const graphics = new Graphics()
      
      // Basic rectangle representation
      graphics.beginFill(0x000000, 0.1)
      graphics.drawRect(0, 0, fabricObject.width || 100, fabricObject.height || 100)
      graphics.endFill()
      
      this.applyTransformations(container, fabricObject)
      container.addChild(graphics)
      
      return container
    } catch (error) {
      console.warn('Failed to create PixiJS graphics:', error)
      return null
    }
  }

  // Apply Fabric.js transformations to PixiJS object
  private applyTransformations(pixiObject: Container, fabricObject: FabricObject) {
    pixiObject.x = fabricObject.left || 0
    pixiObject.y = fabricObject.top || 0
    pixiObject.scale.x = fabricObject.scaleX || 1
    pixiObject.scale.y = fabricObject.scaleY || 1
    pixiObject.rotation = (fabricObject.angle || 0) * Math.PI / 180
    pixiObject.alpha = fabricObject.opacity || 1
    pixiObject.visible = fabricObject.visible !== false
  }

  // Update existing PixiJS object
  private updatePixiObject(pixiObject: Container, fabricObject: FabricObject) {
    this.applyTransformations(pixiObject, fabricObject)
    
    // Update specific properties based on object type
    if (fabricObject.type === 'textbox' && pixiObject.children[0] instanceof PixiText) {
      const pixiText = pixiObject.children[0] as PixiText
      pixiText.text = (fabricObject as FabricTextbox).text || ''
    }
  }

  // Update viewport bounds for culling
  private updateViewportBounds() {
    const vpt = this.fabricCanvas.viewportTransform
    const zoom = this.fabricCanvas.getZoom()
    const width = this.fabricCanvas.getWidth()
    const height = this.fabricCanvas.getHeight()

    this.viewportBounds = {
      left: (-vpt[4] / zoom) - this.VIEWPORT_PADDING,
      top: (-vpt[5] / zoom) - this.VIEWPORT_PADDING,
      right: ((-vpt[4] + width) / zoom) + this.VIEWPORT_PADDING,
      bottom: ((-vpt[5] + height) / zoom) + this.VIEWPORT_PADDING
    }
  }

  // Check if object is in viewport
  private isObjectInViewport(fabricObject: FabricObject): boolean {
    const bounds = fabricObject.getBoundingRect()
    
    return !(
      bounds.left > this.viewportBounds.right ||
      bounds.top > this.viewportBounds.bottom ||
      bounds.left + bounds.width < this.viewportBounds.left ||
      bounds.top + bounds.height < this.viewportBounds.top
    )
  }

  // Perform viewport culling
  private performViewportCulling() {
    let visibleCount = 0
    
    for (const [objectId, renderableObject] of this.renderableObjects.entries()) {
      const isVisible = this.isObjectInViewport(renderableObject.fabricObject)
      
      if (renderableObject.pixiObject) {
        renderableObject.pixiObject.visible = isVisible
      }
      
      if (isVisible) {
        visibleCount++
        if (visibleCount >= this.MAX_RENDERED_OBJECTS) {
          // Hide remaining objects to maintain performance
          for (const [remainingId, remainingObject] of this.renderableObjects.entries()) {
            if (remainingId !== objectId && remainingObject.pixiObject) {
              remainingObject.pixiObject.visible = false
            }
          }
          break
        }
      }
    }
  }

  // Sync all objects from Fabric.js to PixiJS
  private syncAllObjects() {
    const fabricObjects = this.fabricCanvas.getObjects()
    
    // Remove objects that no longer exist in Fabric.js
    for (const [objectId] of this.renderableObjects.entries()) {
      const exists = fabricObjects.some(obj => obj.id === objectId)
      if (!exists) {
        this.removeObject(objectId)
      }
    }

    // Add or update existing objects
    for (const fabricObject of fabricObjects) {
      if (fabricObject.id) {
        if (!this.renderableObjects.has(fabricObject.id)) {
          this.addObject(fabricObject)
        } else {
          this.markObjectForUpdate(fabricObject.id, 'medium')
        }
      }
    }
  }

  // Start render loop
  private startRenderLoop() {
    const renderLoop = () => {
      if (this.renderQueue.length > 0 && !this.isRendering) {
        this.requestRender()
      }
      requestAnimationFrame(renderLoop)
    }
    renderLoop()
  }

  // Utility: debounce function
  private debounce(func: Function, wait: number) {
    let timeout: number | null = null
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait) as any
    }
  }

  // Resize handler
  public resize(width: number, height: number) {
    this.pixiApp.renderer.resize(width, height)
    this.updateViewportBounds()
    this.performViewportCulling()
  }

  // Cleanup
  public destroy() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
    }
    
    for (const [objectId] of this.renderableObjects.entries()) {
      this.removeObject(objectId)
    }
    
    this.pixiApp.destroy(true, { children: true, texture: true })
  }

  // Performance metrics
  public getPerformanceMetrics() {
    return {
      totalObjects: this.renderableObjects.size,
      visibleObjects: Array.from(this.renderableObjects.values())
        .filter(obj => obj.pixiObject?.visible).length,
      queueLength: this.renderQueue.length,
      isRendering: this.isRendering,
      maxFPS: this.maxFPS,
      isMobile: this.isMobile,
      isLowEndDevice: this.isLowEndDevice
    }
  }
}