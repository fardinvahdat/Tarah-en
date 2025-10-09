/* * @Author: ShawnPhang * @Date: 2023-10-05 16:33:07 * @Description: * @LastEditors: ShawnPhang <https://m.palxp.cn> * @LastEditTime: 2023-10-08 11:09:59 */
import { HIDDEN_BOARD_GAP_SIZE, HIDDEN_BOARD_MAX_SIZE, INITIAL_SCALE_RATIO } from '../constants'
import { BoardRect, GapSize, RectSize } from '../types/common'
import { TransformParameters, TransformParametersConfig } from '../types/initMatting'
import { computeScaledImageSize, fixed } from './util'

/** Calculate the coordinates of the upper left corner and the width and height of the drawing board */
export function computeBoardRect(canvas: HTMLCanvasElement): BoardRect {
  const inputBoardRect: DOMRect = canvas.getBoundingClientRect()
  const domRect: DOMRect = document.documentElement.getBoundingClientRect()
  return computeBoardRectSize(inputBoardRect, domRect)
}

export function computeBoardRectSize(inputBoardRect: DOMRect, domRect: DOMRect) {
  const { width, height, left: boardLeft, top: boardTop } = inputBoardRect
  const { left: domLeft, top: domTop } = domRect
  const left = boardLeft - domLeft
  const top = boardTop - domTop
  return { left, top, width, height }
}

/** Legal image size (less than 2k resolution) */
export function computeValidImageSize(imageSource: ImageBitmap): RectSize {
  let { width, height } = imageSource
  const imageScaleRatio = computeScaleRatio({
    imageSize: { width, height },
    gapSize: HIDDEN_BOARD_GAP_SIZE,
    targetSize: HIDDEN_BOARD_MAX_SIZE,
  })
  width *= imageScaleRatio
  height *= imageScaleRatio
  return { width, height }
}

/** Calculate adaptive scaling */
export function computeScaleRatio(transformParametersConfig: TransformParametersConfig): number {
  const { imageSize, gapSize, targetSize } = transformParametersConfig
  const drawingAreaSize = getDrawingAreaSize(targetSize, gapSize)
  return Math.min(Math.min(drawingAreaSize.width / imageSize.width, drawingAreaSize.height / imageSize.height), INITIAL_SCALE_RATIO)
}

/** The default maximum drawing area size (i.e. the frame size minus the gap) */
export function getDrawingAreaSize(boardSize: RectSize, gapSize: GapSize): RectSize {
  return {
    width: boardSize.width - gapSize.horizontal * 2,
    height: boardSize.height - gapSize.vertical * 2,
  }
}

/** Calculate adaptive transformation (scaling, translation) parameters */
export function computeTransformParameters(transformParametersConfig: TransformParametersConfig): TransformParameters {
  const scaleRatio = computeScaleRatio(transformParametersConfig)
  const positionRange = computePositionRange(transformParametersConfig, scaleRatio)
  return { scaleRatio, positionRange }
}

/** Calculate the drawing area after adaptive transformation */
function computePositionRange(transformParametersConfig: TransformParametersConfig, scaleRatio: number) {
  const scaledImageSize = computeScaledImageSize(transformParametersConfig.imageSize, scaleRatio)
  return {
    minX: getPositionRangeMinX(transformParametersConfig, scaledImageSize),
    maxX: getPositionRangeMaxX(transformParametersConfig, scaledImageSize),
    minY: getPositionRangeMinY(transformParametersConfig, scaledImageSize),
    maxY: getPositionRangeMaxY(transformParametersConfig, scaledImageSize),
  }
}

/** Calculate the minimum x coordinate of the drawing area (relative to the upper left corner of the canvas) */
function getPositionRangeMinX(transformParametersConfig: TransformParametersConfig, scaledImageSize: RectSize) {
  const { gapSize, targetSize } = transformParametersConfig
  return fixed((getDrawingAreaSize(targetSize, gapSize).width - scaledImageSize.width) / 2) + gapSize.horizontal
}

function getPositionRangeMinY(transformParametersConfig: TransformParametersConfig, scaledImageSize: RectSize) {
  const { gapSize, targetSize } = transformParametersConfig
  return fixed((getDrawingAreaSize(targetSize, gapSize).height - scaledImageSize.height) / 2) + gapSize.vertical
}

function getPositionRangeMaxX(transformParametersConfig: TransformParametersConfig, scaledImageSize: RectSize) {
  return fixed(getPositionRangeMinX(transformParametersConfig, scaledImageSize) + scaledImageSize.width)
}

function getPositionRangeMaxY(transformParametersConfig: TransformParametersConfig, scaledImageSize: RectSize) {
  return fixed(getPositionRangeMinY(transformParametersConfig, scaledImageSize) + scaledImageSize.height)
}

export const computeHelpers = {
  computeBoardRect,
  computeTransformParameters,
  computeScaleRatio,
  computeValidImageSize,
  computePositionRange,
  getPositionRangeMinX,
  getPositionRangeMaxX,
  getPositionRangeMinY,
  getPositionRangeMaxY,
}
