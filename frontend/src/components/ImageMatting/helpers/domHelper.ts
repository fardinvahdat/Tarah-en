import { DEFAULT_IMAGE_SMOOTH_CHOICE, GLOBAL_COMPOSITE_OPERATION_DESTINATION_IN, GRADIENT_BEGIN_OFFSET, GRADIENT_END_OFFSET, GRADIENT_INNER_RADIUS, IMAGE_BORDER_STYLE, INITIAL_IMAGE_BORDER_WIDTH, ONE_TURN_DEGREES, REPAIR_POINT_INNER_COLOR, REPAIR_POINT_OUTER_COLOR, ZERO_DEGREES } from '../constants'
import { PositionRange } from '../types/common'
import { CreateContext2DConfig, DrawImageLineBorderConfig, DrawingCircularConfig, GetImageSourceConfig, InitHiddenBoardConfig, InitHiddenBoardWithImageConfig, ResizeCanvasConfig, TransformedDrawingImageConfig } from '../types/dom'
// import { isString } from 'lodash-es'

function isString(value: string) {
  return typeof value === 'string'
}

export function resizeCanvas(config: ResizeCanvasConfig) {
  const { ctx, targetWidth, targetHeight, hiddenCtx, transformConfig, withBorder = false } = config
  const { positionRange, scaleRatio } = transformConfig
  ctx.canvas.width = targetWidth
  ctx.canvas.height = targetHeight
  ctx.imageSmoothingEnabled = DEFAULT_IMAGE_SMOOTH_CHOICE
  transformedDrawImage({ ctx, hiddenCtx, positionRange, scaleRatio, withBorder, clearOld: false })
}

/** Create a 2D drawing context */
export function createContext2D(createConfig: CreateContext2DConfig = {}): CanvasRenderingContext2D {
  const { targetSize, cloneCanvas } = createConfig
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  const context2D: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D
  if (targetSize) {
    canvas.width = targetSize.width
    canvas.height = targetSize.height
  }
  if (cloneCanvas) {
    domHelpers.copyImageInCanvas(context2D, cloneCanvas)
  }
  return context2D
}

/** Copy the image in the canvas */
function copyImageInCanvas(hiddenContext: CanvasRenderingContext2D, cloneCanvas: HTMLCanvasElement) {
  hiddenContext.canvas.width = cloneCanvas.width
  hiddenContext.canvas.height = cloneCanvas.height
  hiddenContext.drawImage(cloneCanvas, 0, 0)
}

/** Hide each canvas */
export function hideCanvas(...ctxs: CanvasRenderingContext2D[]) {
  for (const ctx of ctxs) {
    ctx.canvas.style.display = 'none'
  }
}

/** Display each canvas */
export function showCanvas(...ctxs: CanvasRenderingContext2D[]) {
  for (const ctx of ctxs) {
    ctx.canvas.style.display = 'initial'
  }
}

/** Get the bitmap image under the specified link */
export async function getLoadedImage(picFile: File | string): Promise<ImageBitmap> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = isString(picFile) ? picFile : URL.createObjectURL(picFile)
  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
  })
  return createImageBitmap(img)
}

export function initHiddenBoardWithSource(initConfig: InitHiddenBoardWithImageConfig) {
  initHiddenBoard(initConfig)
  const {
    hiddenCtx: ctx,
    imageSource,
    targetSize: { width, height },
  } = initConfig
  return getImageSourceFromCtx({ ctx, imageSource, width, height })
}

/** Initialize the hidden drawing board and result board */
export function initHiddenBoard(initConfig: InitHiddenBoardConfig): void {
  const { targetSize, hiddenCtx, drawingCtx } = initConfig
  const { width, height } = targetSize
  hiddenCtx.canvas.width = width
  hiddenCtx.canvas.height = height
  drawingCtx.canvas.width = width
  drawingCtx.canvas.height = height
}

/** Get the image after the canvas is drawn full screen */
export function getImageSourceFromCtx(config: GetImageSourceConfig) {
  const { ctx, imageSource, width, height } = config
  ctx.drawImage(imageSource, 0, 0, width, height)
  return createImageBitmap(ctx.canvas)
}

/** Clear the previous content in the canvas */
function clearCanvas(ctx: CanvasRenderingContext2D) {
  const {
    canvas: { width, height },
  } = ctx
  ctx.clearRect(0, 0, width, height)
}

/** Draw the wireframe of the cutout result */
function drawImageBorder(borderConfig: DrawImageLineBorderConfig) {
  const { ctx, lineStyle, lineWidth, positionRange } = borderConfig
  const { minY: top, maxX: right, maxY: bottom, minX: left } = positionRange
  ctx.imageSmoothingEnabled = !DEFAULT_IMAGE_SMOOTH_CHOICE
  ctx.fillStyle = lineStyle
  ctx.fillRect(left, top, right - left + lineWidth, lineWidth)
  ctx.fillRect(left, bottom, right - left + lineWidth, lineWidth)
  ctx.fillRect(left, top + lineWidth, lineWidth, bottom - top - lineWidth)
  ctx.fillRect(right, top + lineWidth, lineWidth, bottom - top - lineWidth)
  ctx.imageSmoothingEnabled = DEFAULT_IMAGE_SMOOTH_CHOICE
}

/** Draw the border of the image on the drawing board */
function drawBoardImageBorder(ctx: CanvasRenderingContext2D, hiddenCtx: CanvasRenderingContext2D) {
  const { width, height } = hiddenCtx.canvas
  const positionRange: PositionRange = { minX: 0, minY: 0, maxX: width, maxY: height }
  drawImageBorder({
    ctx,
    positionRange,
    lineStyle: IMAGE_BORDER_STYLE,
    lineWidth: INITIAL_IMAGE_BORDER_WIDTH,
  })
}

/** Perform transformation and drawing */
export function transformedDrawImage(transformedConfig: TransformedDrawingImageConfig) {
  const { ctx, positionRange, scaleRatio, hiddenCtx } = transformedConfig
  const { clearOld = true, withBorder } = transformedConfig
  const { minX: translateX, minY: translateY } = positionRange
  if (clearOld) {
    clearCanvas(ctx)
  }
  ctx.save()
  ctx.translate(translateX, translateY)
  ctx.scale(scaleRatio, scaleRatio)
  ctx.drawImage(hiddenCtx.canvas, 0, 0)
  if (withBorder) {
    drawBoardImageBorder(ctx, hiddenCtx)
  }
  ctx.restore()
}

/** Draw the patching brush dots */
export function drawBrushPoint(drawingConfig: DrawingCircularConfig) {
  const { ctx, x, y, radius, hardness } = drawingConfig
  const { innerColor = REPAIR_POINT_INNER_COLOR, outerColor = REPAIR_POINT_OUTER_COLOR } = drawingConfig
  ctx.beginPath()
  const gradient = ctx.createRadialGradient(x, y, GRADIENT_INNER_RADIUS, x, y, radius)
  gradient.addColorStop(GRADIENT_BEGIN_OFFSET, innerColor)
  gradient.addColorStop(hardness, innerColor)
  gradient.addColorStop(GRADIENT_END_OFFSET, outerColor)
  ctx.fillStyle = gradient
  ctx.arc(x, y, radius, ZERO_DEGREES, ONE_TURN_DEGREES)
  ctx.fill()
}

/** Generate the URL of the resulting image */
export function generateResultImageURL(rawImage: ImageBitmap, resultCtx: CanvasRenderingContext2D) {
  const resultImageCtx = createResultImageContext2D(rawImage, resultCtx)
  return resultImageCtx.canvas.toDataURL()
}

/** Create a drawing context for drawing the original size result image */
function createResultImageContext2D(imageSource: ImageBitmap, resultImageCtx: CanvasRenderingContext2D): CanvasRenderingContext2D {
  const context2D = createRawImageContext2D(imageSource)
  drawResultImageInContext2D(context2D, resultImageCtx, imageSource)
  return context2D
}

/** Create a drawing context for drawing images of original size */
function createRawImageContext2D(imageSource: ImageBitmap): CanvasRenderingContext2D {
  const context2D = createContext2D({ targetSize: imageSource })
  context2D.drawImage(imageSource, 0, 0)
  return context2D
}

/** Draw the result image of the original size on the passed drawing context */
function drawResultImageInContext2D(ctx: CanvasRenderingContext2D, resultImageCtx: CanvasRenderingContext2D, imageSource: ImageBitmap): void {
  ctx.globalCompositeOperation = GLOBAL_COMPOSITE_OPERATION_DESTINATION_IN
  ctx.drawImage(resultImageCtx.canvas, 0, 0, imageSource.width, imageSource.height)
}

export const domHelpers = {
  copyImageInCanvas,
}
