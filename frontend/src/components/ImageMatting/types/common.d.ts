import { Ref } from 'vue';

/** Mouse pointer movement distance */
export interface MouseMovements {
/** Horizontal movement distance */
movementX: number;
/** Vertical movement distance */
movementY: number;
}

/** Pixel coordinates */
export interface PixelPosition {
x: number;
y: number;
}

/** Transformation configuration object */
export interface TransformConfig {
positionRange: PositionRange;
scaleRatio: number;
}

/** Drawing position range */
export interface PositionRange {
minX: number;
maxX: number;
minY: number;
maxY: number;
}

/** Rectangle size */
export interface RectSize {
width: number;
height: number;
}

/** Parameters of the drawing board rectangle */
export interface BoardRect extends RectSize {
left: number;
top: number;
}

/** Rectangle size */
export interface RectSize {
width: number;
height: number;
}

/** Board drawing context */
export interface BoardDrawingContexts {
/** Board drawing context */
ctx: Ref<CanvasRenderingContext2D | null>;
/** Hidden drawing context for drawing input image */
hiddenCtx: Ref<CanvasRenderingContext2D>;
/** Temporary drawing board for drawing brush shape */
drawingCtx: CanvasRenderingContext2D;
}

/** Board drawing context object */
export interface BoardContext2Ds {
/** Input board drawing context */
inputCtx: Ref<CanvasRenderingContext2D | null>;
/** Output board drawing context */
outputCtx: Ref<CanvasRenderingContext2D | null>;
inputDrawingCtx: CanvasRenderingContext2D;
outputDrawingCtx: CanvasRenderingContext2D;
/** Drawing context of hidden board for drawing input image */
inputHiddenCtx: Ref<CanvasRenderingContext2D>;
/** Drawing context of hidden board for drawing output image */
outputHiddenCtx: Ref<CanvasRenderingContext2D>;
}

/** Drawing basic configuration object */
export interface MattingBoardBaseConfig {
boardContexts: BoardContext2Ds;
/** Canvas target size */
targetSize: RectSize;
/** Minimum gap between image and canvas edge when drawing */
gapSize?: GapSize;
}

/**
* Default size of image in navigation window area: scale proportionally with the center of the image as the origin
* Leave at least 80px for top and bottom margins of the image, and leave at least 40px for left and right margins. The top and bottom margins have higher priority than the left and right margins
* For example: when the image has 80px of white space above and below, and the left and right white space is greater than 40px, the upper and lower white space of 80px shall prevail
*/
export interface GapSize {
horizontal: number;
vertical: number;
}

/** Initialize the basic configuration object for drawing images according to the transformation configuration */
export interface InitTransformedDrawBaseConfig {
/** Transformation configuration */
transformConfig: TransformConfig;
/** Whether to draw the image border */
withBorder?: boolean;
}