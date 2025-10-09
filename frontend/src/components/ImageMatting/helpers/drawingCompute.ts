import { DRAW_INTERPOLATION_RADIUS_THRESHOLD, DRAW_INTERPOLATION_STEP_BASE } from '../constants'
import { MouseMovements } from '../types/common'
import { ComputedMovements, InImageRangeConfig, InterpolationStep, RenderInterpolationConfig } from '../types/drawing'

const { sign, abs, max } = Math

/** Determine whether the coordinate position is within the range of the drawn image */
export function isInImageRange(inRangeConfig: InImageRangeConfig): boolean {
  const { x, y, minX, maxX, minY, maxY } = inRangeConfig
  return x >= minX && x <= maxX && y >= minY && y <= maxY
}

/** Calculate the moving distance in the x/y axis direction and the maximum moving distance in the horizontal/vertical direction */
export function computeMovements(movements: MouseMovements): ComputedMovements {
  const { movementX, movementY } = movements
  const unsignedMovementX = abs(movementX)
  const unsignedMovementY = abs(movementY)
  const maxMovement = max(unsignedMovementX, unsignedMovementY)
  return { unsignedMovementX, unsignedMovementY, maxMovement }
}

/** Whether interpolation rendering is required */
export function needDrawInterpolation(maxMovement: number, radius: number): boolean {
  return radius > DRAW_INTERPOLATION_RADIUS_THRESHOLD && maxMovement > radius / DRAW_INTERPOLATION_STEP_BASE
}

/** Calculate the interpolation step size */
export function computeInterpolationStep(interpolationConfig: RenderInterpolationConfig): InterpolationStep {
  const { drawingConfig, unsignedMovementX, unsignedMovementY, maxMovement } = interpolationConfig
  const { movementX, movementY, stepBase } = drawingConfig
  const rawStepX = computePivotRawStep(movementX, stepBase)
  const rawStepY = computePivotRawStep(movementY, stepBase)
  const movementXIsMaximum = isMaxMovement(unsignedMovementX, maxMovement)
  const stepX = computePivotStep(movementXIsMaximum, rawStepX, unsignedMovementX, unsignedMovementY)
  const stepY = computePivotStep(!movementXIsMaximum, rawStepY, unsignedMovementY, unsignedMovementX)
  return { stepX, stepY }
}

/** Calculate the interpolation step size in the x/y axis direction towards the last mouse pointer position */
function computePivotRawStep(pivotMovement: number, stepBase: number) {
  return -sign(pivotMovement) * stepBase
}

/** Is it the maximum moving distance? */
function isMaxMovement(pivotMovement: number, maxMovement: number) {
  return pivotMovement === maxMovement
}

/** Calculate the cumulative step length in the x/y axis direction */
function computePivotStep(isMaxMovement: boolean, rawStepOfPivot: number, unsignedPivotMovement: number, unsignedCrossedMovement: number) {
  return isMaxMovement ? rawStepOfPivot : (unsignedPivotMovement / unsignedCrossedMovement) * rawStepOfPivot
}

/** Determine whether to draw interpolation points */
export function needDrawInterpolationPoint(movement: number, moved: number, step: number) {
  return movement - moved > step
}
