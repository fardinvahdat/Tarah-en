import { EventType, GLOBAL_COMPOSITE_OPERATION_DESTINATION_OUT, GLOBAL_COMPOSITE_OPERATION_SOURCE_OVER } from '../constants'
import { MouseMovements, PixelPosition } from '../types/common'
import { BoardDrawingConfig, BrushDrawingBaseConfig, CanDrawAndBindMouseListenerConfig, ComputePositionAndMovementConfig, ComputeRealPositionConfig, DrawingListenerConfig, InitDrawingConfig, InitDrawingListenerConfig, PositionAndMovements } from '../types/drawingListeners'
import { isInImageRange } from './drawingCompute'
import { executeMattingDrawing } from './drawingHelper'
import { transformHelpers, updateRangeByMovements } from './transformHelper'
import { computeRealRadius, computeStep, computeStepBase, getRawDistance } from './util'

export function initDrawingListeners(config: InitDrawingListenerConfig) {
  const { listenerManager, initDrawingConfig } = config
  const listenerConfig = generateDrawingListenerConfig(config)
  let spaceDown = false
  const {
    inputBoardDrawingConfig: { ctx: inputCtx, hiddenCtx: inputHiddenCtx },
    outputBoardDrawingConfig: { hiddenCtx: outputHiddenCtx },
    brushDrawingBaseConfig: { positionRange },
  } = listenerConfig
  const { boardRect, draggingInputBoard } = listenerConfig
  resetPivotalOptions(listenerConfig)
  const drawingListener = generateDrawingListener(listenerConfig)
  let canDrawAndBindListener = false
  // --- TODO: Temporary shortcut key test ----
  document.removeEventListener('keydown', handleKeydown, false)
  function handleKeydown(e: any) {
    if (e.code === 'Space') {
      e.preventDefault()
    }
    spaceDown = e.code === 'Space'
  }
  document.addEventListener('keydown', handleKeydown, false)
  function handleKeyup(e: any) {
    spaceDown = false
  }
  document.removeEventListener('keydown', handleKeyup, false)
  document.addEventListener('keyup', handleKeyup, false)
  // --- END ---
  listenerManager.initMouseListeners({
    mouseTarget: (inputCtx.value as CanvasRenderingContext2D).canvas,
    down(ev) {
      if (!spaceDown) {
        canDrawAndBindListener = canDrawAndBindMoveListener({
          ev,
          boardRect,
          positionRange,
          draggingInputBoard,
        })
        if (canDrawAndBindListener) {
          drawingListener(ev)
        }
        return canDrawAndBindListener
      }
    },
    move(ev) {
      const { positionRange } = initDrawingConfig.transformConfig
      spaceDown && updateRangeByMovements(ev, positionRange)
      if (!draggingInputBoard && canDrawAndBindListener) {
        drawingListener(ev)
      }
    },
    up(ev) {
      if (!draggingInputBoard && canDrawAndBindListener) {
        canDrawAndBindListener = false
        drawingListener(ev)
      }
    },
  })
}

/** Generate a configuration object for the drawing listener */
function generateDrawingListenerConfig(config: InitDrawingListenerConfig): DrawingListenerConfig {
  const {
    imageSources,
    imageSources: { raw, mask },
    initDrawingConfig,
    boardContexts,
    ...restConfig
  } = config
  const { inputCtx, inputHiddenCtx, inputDrawingCtx, outputCtx, outputHiddenCtx, outputDrawingCtx } = boardContexts
  const brushDrawingBaseConfig: BrushDrawingBaseConfig = generateBrushBaseConfig(initDrawingConfig)
  const inputBoardDrawingConfig: BoardDrawingConfig = {
    ctx: inputCtx,
    hiddenCtx: inputHiddenCtx,
    drawingCtx: inputDrawingCtx,
    mattingSource: mask,
  }
  const outputBoardDrawingConfig: BoardDrawingConfig = {
    ctx: outputCtx,
    hiddenCtx: outputHiddenCtx,
    drawingCtx: outputDrawingCtx,
    mattingSource: raw,
  }
  return {
    brushDrawingBaseConfig,
    mattingSources: imageSources,
    inputBoardDrawingConfig,
    outputBoardDrawingConfig,
    ...restConfig,
  }
}

/** Reset key options in the artboard configuration object */
function resetPivotalOptions(config: DrawingListenerConfig) {
  const { inputBoardDrawingConfig, outputBoardDrawingConfig } = config
  const {
    mattingSources: { raw, mask },
    isErasing,
  } = config
  if (isErasing) {
    inputBoardDrawingConfig.mattingSource = raw
    outputBoardDrawingConfig.hiddenCtx.value.globalCompositeOperation = GLOBAL_COMPOSITE_OPERATION_DESTINATION_OUT
  } else {
    inputBoardDrawingConfig.mattingSource = mask
    outputBoardDrawingConfig.hiddenCtx.value.globalCompositeOperation = GLOBAL_COMPOSITE_OPERATION_SOURCE_OVER
  }
}

/** Generate the basic configuration object of the brush */
function generateBrushBaseConfig(config: InitDrawingConfig): BrushDrawingBaseConfig {
  const {
    radius: rawRadius,
    hardness,
    transformConfig: { scaleRatio, positionRange },
  } = config
  const radius = computeRealRadius(rawRadius.value, scaleRatio)
  const stepBase = computeStepBase(radius)
  const step = computeStep(radius)
  return { radius, step, stepBase, scaleRatio, positionRange, hardness: hardness.value }
}

/** Generate a drawing listener for the patching brush */
function generateDrawingListener(config: DrawingListenerConfig) {
  const {
    brushDrawingBaseConfig,
    brushDrawingBaseConfig: { step, scaleRatio, positionRange },
    boardRect: { left, top },
  } = config
  const { inputBoardDrawingConfig, outputBoardDrawingConfig, isErasing } = config
  let totalMovement = 0
  return (ev: MouseEvent) => {
    // TODO: draw
    const positionAndMovements = computePositionAndMovements({
      ev,
      scaleRatio,
      positionRange,
      left,
      top,
    })
    const { movementX, movementY } = positionAndMovements
    const commonPointConfig = {
      ...brushDrawingBaseConfig,
      ...positionAndMovements,
    }
    totalMovement += getRawDistance(movementX, movementY)
    if (canDrawing(totalMovement, step, ev.type)) {
      totalMovement = 0
      executeMattingDrawing([
        { ...commonPointConfig, ...inputBoardDrawingConfig },
        { ...commonPointConfig, ...outputBoardDrawingConfig, isErasing },
      ])
    }
  }
}

/** Determine whether drawing is possible */
function canDrawing(totalMovement: number, step: number, eventType: string): boolean {
  return totalMovement >= step || eventType === EventType.MouseDown
}

/** Calculate the coordinate position of the drawing point and the horizontal and vertical movement distance of the mouse pointer */
function computePositionAndMovements(config: ComputePositionAndMovementConfig): PositionAndMovements {
  const { ev, scaleRatio, positionRange, left, top } = config
  const { minX, minY } = positionRange
  const { movementX, movementY, pageX, pageY } = ev
  const realPosition = computeRealPosition({ pageX, pageY, left, top, minX, minY, scaleRatio })
  const realMovements = computeRealMovements({ movementX, movementY }, scaleRatio)
  return { ...realPosition, ...realMovements }
}

/** Calculate the mouse position relative to the real image size */
function computeRealPosition(config: ComputeRealPositionConfig): PixelPosition {
  const { pageX, pageY, left, top, minX, minY, scaleRatio } = config
  const x = (pageX - left - minX) / scaleRatio
  const y = (pageY - top - minY) / scaleRatio
  return { x, y }
}

/** Calculate the moving distance relative to the actual image size */
function computeRealMovements(rawMovements: MouseMovements, scaleRatio: number) {
  const { movementX: rawMovementX, movementY: rawMovementY } = rawMovements
  const movementX = rawMovementX / scaleRatio
  const movementY = rawMovementY / scaleRatio
  return { movementX, movementY }
}

/** Determine whether drawing can be done and bind the listener for mouse movement drawing */
function canDrawAndBindMoveListener(canDrawAndBindConfig: CanDrawAndBindMouseListenerConfig) {
  const { ev, boardRect, positionRange, draggingInputBoard } = canDrawAndBindConfig
  const { pageX, pageY } = ev
  const { left, top } = boardRect
  const { minX, maxX, minY, maxY } = positionRange
  const x = transformHelpers.computePivot(pageX, left)
  const y = transformHelpers.computePivot(pageY, top)
  const inImageRange = isInImageRange({ x, y, minX, maxX, minY, maxY })
  return inImageRange && !draggingInputBoard
}
