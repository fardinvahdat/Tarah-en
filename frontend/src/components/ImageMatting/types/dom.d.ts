import { InitTransformedDrawBaseConfig, PositionRange, RectSize, TransformConfig } from './common';

/** Canvas size reset configuration object */
export interface ResizeCanvasConfig extends InitTransformedDrawBaseConfig {
/** Canvas 2D context */
ctx: CanvasRenderingContext2D;
hiddenCtx: CanvasRenderingContext2D;
/** Target width for size reset */
targetWidth: number;
/** Target height for size reset */
targetHeight: number;
}

/** Create a 2D drawing context configuration object */
export interface CreateContext2DConfig {
targetSize?: RectSize;
cloneCanvas?: HTMLCanvasElement;
}

/** Initialize the hidden board configuration object */
export interface InitHiddenBoardConfig {
targetSize: RectSize;
hiddenCtx: CanvasRenderingContext2D;
drawingCtx: CanvasRenderingContext2D;
}

/** Initialize the hidden canvas and return the image configuration object */
export interface InitHiddenBoardWithImageConfig extends InitHiddenBoardConfig {
imageSource: ImageBitmap;
}

/** Get the configuration object of the image resource from the canvas */
export interface GetImageSourceConfig {
ctx: CanvasRenderingContext2D;
imageSource: ImageBitmap;
width: number;
height: number;
}

/** Context object for drawing when the canvas is transformed */
export interface DirectlyDrawingContext {
/** Drawing context */
ctx: CanvasRenderingContext2D;
/** Hidden drawing context */
hiddenCtx: CanvasRenderingContext2D;
}

/** Configuration object for drawing images when the canvas is transformed */
export interface TransformedDrawingImageConfig extends DirectlyDrawingContext, TransformConfig {
clearOld?: boolean;
withBorder?: boolean;
}

/** Configuration object for drawing image border */
export interface DrawImageLineBorderConfig {
/** Border position information */
positionRange: PositionRange;
ctx: CanvasRenderingContext2D;
/** Border color */
lineStyle: string;
lineWidth: number;
}

/** Configuration object for drawing circle */
export interface DrawingCircularConfig {
ctx: CanvasRenderingContext2D | CanvasRenderingContext2D;
x: number;
y: number;
radius: number;
hardness: number;
innerColor?: string;
outerColor?: string;
}