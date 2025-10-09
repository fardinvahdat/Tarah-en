import { BoardDrawingContexts, MouseMovements, PixelPosition, PositionRange } from './common';
import { BrushDrawingBaseConfig } from './drawingListeners';

/** Configuration object for cutout drawing */
export interface MattingDrawingConfig extends MouseMovements, BrushDrawingBaseConfig, BoardDrawingContexts, PixelPosition {
stepBase: number;
mattingSource: ImageBitmap;
/** Is it an erasing brush */
isErasing?: boolean;
}

export interface ComputedMovements {
unsignedMovementX: number;
unsignedMovementY: number;
maxMovement: number;
}

/** Configuration object for drawing points that handle interpolation */
export interface RenderInterpolationConfig {
/** Configuration object for drawing points */
drawingConfig: MattingDrawingConfig;
/** Unsigned horizontal movement distance */
unsignedMovementX: number;
/** Unsigned horizontal movement distance */
unsignedMovementY: number;
/** The larger unsigned horizontal/vertical movement distance */
maxMovement: number;
}

/** Determine whether it is within the image range */
export type InImageRangeConfig = PositionRange & PixelPosition;

/** Interpolation step length */
export interface InterpolationStep {
stepX: number;
stepY: number;
}