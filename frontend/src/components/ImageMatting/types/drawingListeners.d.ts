import ListenerManager from '../helpers/listenerManager'
import { Ref } from 'vue'
import { BoardContext2Ds, BoardDrawingContexts, BoardRect, MouseMovements, PixelPosition, PositionRange, TransformConfig } from './common'
import { ImageSources } from './initMatting'

/** Initialize the configuration object for cutout drawing */
export interface InitDrawingListenerConfig {
/** Listener manager */
listenerManager: ListenerManager
/** Image drawing source */
imageSources: ImageSources
/** Drawing board drawing context */
boardContexts: BoardContext2Ds
/** Initialize drawing configuration */
initDrawingConfig: InitDrawingConfig
/** Is it an erasing brush */
isErasing: boolean
/** Is the left input area drawing board being dragged */
draggingInputBoard: boolean
boardRect: BoardRect
}

/** Basic configuration for brush drawing */
export interface BrushDrawingBaseConfig extends TransformConfig {
/** Brush radius */
radius: number
/** Drawing distance interval (drawing will only be performed when the moving distance is greater than step) */
step: number
/** Interval step length for interpolation drawing */
stepBase: number
/** Brush hardness */
hardness: number
}
/** Initialize the drawing configuration object */
interface InitDrawingConfig {
radius: Ref<number>
hardness: Ref<number>
transformConfig: TransformConfig
}

/** Drawing board drawing configuration */
export interface BoardDrawingConfig extends BoardDrawingContexts {
mattingSource: ImageBitmap
}
/** Configuration object for executing drawing */
export interface DrawingListenerConfig {
/** Basic configuration for brush drawing */
brushDrawingBaseConfig: BrushDrawingBaseConfig
/** Parameters of drawing board rectangle */
boardRect: BoardRect
mattingSources: ImageSources
/** Drawing input context */
inputBoardDrawingConfig: BoardDrawingConfig
/** Drawing output context */
outputBoardDrawingConfig: BoardDrawingConfig
/** Whether the left input area drawing board is being dragged */
draggingInputBoard: boolean
/** Whether it is an erasing brush */
isErasing: boolean
}

/** Configuration object for calculating the coordinate position of the drawing point and the horizontal and vertical movement distance of the mouse pointer */
export interface ComputePositionAndMovementConfig {
ev: MouseEvent
scaleRatio: number
positionRange: PositionRange
left: number
top: number
}

/** Pixel coordinates and mouse pointer movement */
export type PositionAndMovements = MouseMovements & PixelPosition

/** Configuration object for calculating the position of the mouse pointer relative to the real image size */
export interface ComputeRealPositionConfig {
/** Mouse pointer pageX */
pageX: number
/** Mouse pointer pageY */
pageY: number
/** Canvas pageX */
left: number
/** Canvas pageY */
top: number
/** The x coordinate of the left edge of the image relative to the upper left corner of the canvas */
minX: number
/** The y coordinate of the top edge of the image relative to the upper left corner of the canvas */
minY: number
/** Image scaling ratio */
scaleRatio: number
}

/** Configuration object for determining whether it is possible to draw and bind a mouse event listener */
export interface CanDrawAndBindMouseListenerConfig {
ev: MouseEvent
boardRect: BoardRect
positionRange: PositionRange
/** Whether the left input area drawing board is being dragged */
draggingInputBoard: boolean
}