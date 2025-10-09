import { Ref } from 'vue';

/** Mouse cursor style */
export interface CursorStyle {
display?: string;
left?: string;
top?: string;
cursor?: string;
width?: string;
}

/** Configuration object for using the mouse cursor combination API */
export interface UseCursorConfig {
inputCtx: Ref<CanvasRenderingContext2D | null>;
isDragging: Ref<boolean>;
isErasing: Ref<boolean>;
radius: Ref<number>;
hardness: Ref<number>;
}