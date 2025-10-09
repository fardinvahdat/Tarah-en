
import ListenerManager from '../helpers/listenerManager'
import { InitTransformedDrawBaseConfig, PositionRange } from './common'
import { DirectlyDrawingContext } from './dom'

export interface InitMattingTransformConfig extends InitTransformedDrawBaseConfig {
/** Context object drawn when input board transforms */
inputContexts: DirectlyDrawingContext
/** Context object drawn when output board transforms */
outputContexts: DirectlyDrawingContext
}

export interface InitMattingScaleConfig extends InitMattingTransformConfig {
listenerManager: ListenerManager
}

/** Configuration object for initializing cutout board changes */
export interface InitMattingDragConfig extends InitMattingScaleConfig {
/** Whether the left input area board is being dragged */
draggingInputBoard: boolean
}

/** Configuration object for generating offsets returned by drawing */
export interface GenerateRangeOffsetConfig {
pageX: number
pageY: number
positionRange: PositionRange
}