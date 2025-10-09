import { GapSize, RectSize, TransformConfig } from '../types/common'
import { GLColor } from '../types/mattingDrawing'

export enum EventType {
  Mouseover = 'mouseover',
  Mouseenter = 'mouseenter',
  Mouseout = 'mouseout',
  Mouseleave = 'mouseleave',
  Mouseup = 'mouseup',
  Mousemove = 'mousemove',
  MouseDown = 'mousedown',
  DblClick = 'dblclick',
  Click = 'click',
  ContextMenu = 'contextmenu',
  KeyDown = 'keydown',
  Keyup = 'keyup',
  Keypress = 'keypress',
  Scroll = 'scroll',
  Resize = 'resize',
  Wheel = 'wheel',
  UndoRedoStateChanged = 'undoRedoStateChanged',
}

export const INITIAL_RADIUS = 12.5
export const INITIAL_HARDNESS = 0.5
/**  */
export const RADIUS_TO_BRUSH_SIZE_RATIO = 4

export const RADIUS_SLIDER_MIN = 0.25
export const RADIUS_SLIDER_STEP = 0.25
export const RADIUS_SLIDER_MAX = 25
/** The minimum radius of the brush drawing point in pixels */
export const MIN_RADIUS = 0.5

export const HARDNESS_SLIDER_MIN = 0
export const HARDNESS_SLIDER_STEP = 0.01
export const HARDNESS_SLIDER_MAX = 1
/** The magnification of the hardness to the value range displayed by the slider */
export const HARDNESS_ZOOM_TO_SLIDER_RATIO = 100

export const INITIAL_SCALE_RATIO = 1
/** Default transformation configuration object */
export const INITIAL_TRANSFORM_CONFIG: TransformConfig = {
  scaleRatio: INITIAL_SCALE_RATIO,
  positionRange: {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  },
}
/**
* Default size of the image in the navigation window area: scale proportionally with the center of the image as the origin
* Leave at least 80px in the top and bottom margins of the image, and leave at least 40px in the left and right margins. The top and bottom margins have higher priority than the left and right margins
* For example: When the top and bottom margins of the image are 80px, and the left and right margins are greater than 40px, the top and bottom margins of 80px shall prevail
*/
export const INITIAL_GAP_SIZE: GapSize = {
  horizontal: 40,
  vertical: 80,
}

/** Hide the gap object of the artboard - no blank space is required for hidden artboards */
export const HIDDEN_BOARD_GAP_SIZE: GapSize = {
  horizontal: 0,
  vertical: 0,
}
/** The maximum size of the hidden artboard - by default, it is the same as the original size of the image, but cannot exceed 2000px. If it exceeds 2000px, it will be scaled to avoid affecting performance */
export const HIDDEN_BOARD_MAX_SIZE: RectSize = {
  width: 2000,
  height: 2000,
}

/** Default image smoothing option value */
export const DEFAULT_IMAGE_SMOOTH_CHOICE = false
export const IMAGE_BORDER_STYLE = '#000000'
export const INITIAL_IMAGE_BORDER_WIDTH = 1

export const DEFAULT_MASK_COLOR: GLColor = [0.47, 0.42, 0.9, 0.5]

/** Update the throttling wait time of boardRect when the window is scrolling */
export const UPDATE_BOARDRECT_DEBOUNCE_TIME = 100
/** Calculate the inverse of the coefficient of stepBase (the increment in the iteration of drawing the infill line, based on the radius of the real size) */
export const DRAWING_STEP_BASE_BASE = 20
/** Calculate the inverse of the coefficient of the throttling step size for drawing dots */
export const DRAWING_STEP_BASE = 3.5

export const GLOBAL_COMPOSITE_OPERATION_SOURCE_OVER = 'source-over'
export const GLOBAL_COMPOSITE_OPERATION_DESTINATION_IN = 'destination-in'
export const GLOBAL_COMPOSITE_OPERATION_DESTINATION_OUT = 'destination-out'

/** Calculate the inverse of the coefficient of the throttling step for drawing interpolation lines */
export const DRAW_INTERPOLATION_STEP_BASE = 2.5
/** Brush radius threshold for drawing interpolation lines */
export const DRAW_INTERPOLATION_RADIUS_THRESHOLD = 1
/** Radius of the radial gradient start circle */
export const GRADIENT_INNER_RADIUS = 0
/** Offset value for the start of the gradient */
export const GRADIENT_BEGIN_OFFSET = 0
/** Offset value for the end of the gradient */
export const GRADIENT_END_OFFSET = 1
/** Color for patching the start of the gradient */
export const REPAIR_POINT_INNER_COLOR = 'rgba(119,106,230,1)'
/** Color for patching the end of the gradient */
export const REPAIR_POINT_OUTER_COLOR = 'rgba(119,106,230,0)'
/** Erasing gradient start color */
export const ERASE_POINT_INNER_COLOR = 'rgba(255,255,255,1)'
/** Erasing end color */
export const ERASE_POINT_OUTER_COLOR = 'rgba(255,255,255,0)'
/** 0° */
export const ZERO_DEGREES = 0
/** 360° */
export const ONE_TURN_DEGREES = Math.PI * 2
/** Anti-shake time when executing forward and backward actions */
export const ACTION_THROTTLE_TIME = 300
/** Amplification factor */
export const ZOOM_IN_COEFFICIENT = 1
/** Zoom coefficient */
export const ZOOM_OUT_COEFFICIENT = -1
/** Zoom ratio change step size */
export const SCALE_STEP = 0.04
export const MIN_SCALE_RATIO = 0.15
export const MAX_SCALE_RATIO = 10
