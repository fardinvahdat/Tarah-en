/* * @Author: ShawnPhang * @Date: 2023-10-05 16:33:07 * @Description: * @LastEditors: ShawnPhang <https://m.palxp.cn> * @LastEditTime: 2023-10-08 11:09:55 */
import { GLOBAL_COMPOSITE_OPERATION_DESTINATION_IN, GLOBAL_COMPOSITE_OPERATION_SOURCE_OVER } from '../constants'
import { MattingDrawingConfig, RenderInterpolationConfig } from '../types/drawing'
import { createContext2D, drawBrushPoint, transformedDrawImage } from './domHelper'
import { computeInterpolationStep, computeMovements, needDrawInterpolation, needDrawInterpolationPoint } from './drawingCompute'
import { fixed } from './util'

/** Batch execution of cutout (patch/erase) drawing */
export function executeMattingDrawing(drawingConfigs: MattingDrawingConfig[]) {
  for (const config of drawingConfigs) {
    const { radius } = config
    const { maxMovement, unsignedMovementX, unsignedMovementY } = computeMovements(config)
    if (needDrawInterpolation(maxMovement, radius)) {
      renderMattingInterpolation({ drawingConfig: config, unsignedMovementX, unsignedMovementY, maxMovement })
    } else {
      drawMattingPoint(config)
    }
    drawResultArea(config)
  }
}

/** Hidden auxiliary interpolation drawing context object */
const interpolationCtx = createContext2D()

/** Render interpolated image area */
function renderMattingInterpolation(interpolationConfig: RenderInterpolationConfig) {
  const { drawingConfig, maxMovement } = interpolationConfig
  const { step, stepBase, drawingCtx, radius, hardness } = drawingConfig
  let { x, y } = drawingConfig
  const { stepX, stepY } = computeInterpolationStep(interpolationConfig)
  resetInterpolationCtx(drawingCtx)
  for (let movement = 0, moved = movement; movement < maxMovement; movement += stepBase, x += stepX, y += stepY) {
    if (needDrawInterpolationPoint(movement, moved, step)) {
      moved = movement
      drawBrushPoint({ ctx: interpolationCtx, x: fixed(x), y: fixed(y), radius, hardness })
    }
  }
  drawMattingInterpolationTrack(drawingConfig)
}

/** Draw interpolation trajectory */
function drawMattingInterpolationTrack(drawingConfig: MattingDrawingConfig) {
  const { isErasing, hiddenCtx, drawingCtx } = drawingConfig
  if (isErasing) {
    hiddenCtx.value.drawImage(interpolationCtx.canvas, 0, 0)
  } else {
    drawMattingTrack(drawingConfig, () => {
      drawingCtx.drawImage(interpolationCtx.canvas, 0, 0)
    })
  }
}

/** Reset the artboard used for interpolation drawing */
function resetInterpolationCtx(drawingCtx: CanvasRenderingContext2D) {
  const { width, height } = drawingCtx.canvas
  interpolationCtx.canvas.width = width
  interpolationCtx.canvas.height = height
  interpolationCtx.clearRect(0, 0, width, height)
}

/** Draw dots in the patching/cutout area */
function drawMattingPoint(drawingConfig: MattingDrawingConfig) {
  const { isErasing, hiddenCtx, drawingCtx } = drawingConfig
  const { x, y, radius, hardness } = drawingConfig
  if (isErasing) {
    drawBrushPoint({ ctx: hiddenCtx.value, x, y, radius, hardness })
  } else {
    drawMattingTrack(drawingConfig, () => {
      drawBrushPoint({ ctx: drawingCtx, x, y, radius, hardness })
    })
  }
}

/** TODO: draw the track of patching/subtraction */
async function drawMattingTrack(drawingConfig: MattingDrawingConfig, drawingCallback: VoidFunction) {
  const { hiddenCtx, drawingCtx, mattingSource } = drawingConfig
  drawingCtx.globalCompositeOperation = GLOBAL_COMPOSITE_OPERATION_SOURCE_OVER
  drawingCtx.drawImage(mattingSource, 0, 0)
  drawingCtx.globalCompositeOperation = GLOBAL_COMPOSITE_OPERATION_DESTINATION_IN
  drawingCallback()
  hiddenCtx.value.drawImage(drawingCtx.canvas, 0, 0)
}

/** Draw the image on the rendered canvas */
function drawResultArea(drawingConfig: MattingDrawingConfig) {
  const { ctx, hiddenCtx, positionRange, scaleRatio, isErasing } = drawingConfig
  transformedDrawImage({
    ctx: ctx.value as CanvasRenderingContext2D,
    hiddenCtx: hiddenCtx.value,
    positionRange,
    scaleRatio,
    withBorder: isInResultBoard(isErasing),
  })
}

/** Whether the drawing board where the image is drawn is the output drawing board */
export function isInResultBoard(isErasing: boolean | undefined) {
  return isErasing !== undefined
}
