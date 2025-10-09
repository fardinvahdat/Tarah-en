
import { DRAWING_STEP_BASE, DRAWING_STEP_BASE_BASE, MIN_RADIUS } from '../constants'
import { RectSize, TransformConfig } from '../types/common'

const { sqrt, max } = Math

export function fixed(num: number): number {
  return num | 0
}
// Faster than Math.hypot(x,y) (when orders of magnitude larger)
export function getRawDistance(xDistance: number, yDistance: number): number {
  return sqrt(xDistance ** 2 + yDistance ** 2)
}

/** Calculate the interval step size for interpolation drawing */
export function computeStepBase(radius: number) {
  return radius / DRAWING_STEP_BASE_BASE
}

/** Calculate the radius of the brush drawing point of the real (relatively real, if the image resolution is controlled within 2K to ensure performance) size */
export function computeRealRadius(rawRadius: number, scaleRatio: number) {
  return max(MIN_RADIUS, rawRadius) / scaleRatio
}

/** Calculate the throttling step size for mobile drawing */
export function computeStep(radius: number) {
  return radius / DRAWING_STEP_BASE
}

/** Calculate the new drawing range based on the new zoom ratio */
export function computeNewTransformConfigByScaleRatio(transformConfig: TransformConfig, pictureSize: RectSize, scaleRatio: number): TransformConfig {
  const { minX, minY } = transformConfig.positionRange
  const { width, height } = pictureSize
  const maxX = minX + width * scaleRatio
  const maxY = minY + height * scaleRatio
  return { positionRange: { minX, maxX, minY, maxY }, scaleRatio }
}

/** Get the actual size of the image scaled to the frame area */
export function computeScaledImageSize(imageSize: RectSize, scaleRatio: number): RectSize {
  return {
    width: imageSize.width * scaleRatio,
    height: imageSize.height * scaleRatio,
  }
}
