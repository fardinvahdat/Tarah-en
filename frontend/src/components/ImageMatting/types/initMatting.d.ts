
import { MaskRendererType } from './matting'
import { RefObject } from 'react'
import { ListenerManagerOptions } from './listenerManager'
import { DrawingComputeOptions, DrawingOptions } from './drawing'

export interface InitMattingOptions extends ListenerManagerOptions {
  containerRef: RefObject<HTMLDivElement>
  imgRef: RefObject<HTMLImageElement>
  canvasRef: RefObject<HTMLCanvasElement>
  resultCanvasRef: RefObject<HTMLCanvasElement>
  strokeCanvasRef: RefObject<HTMLCanvasElement>
  drawingCanvasRef: RefObject<HTMLCanvasElement>
  zoomRef: RefObject<HTMLDivElement>
  controlPointsRef: RefObject<HTMLDivElement>
  width?: number
  height?: number
  drawingOptions?: DrawingOptions
  drawingComputeOptions?: DrawingComputeOptions
  initialMask?: Uint8ClampedArray
  format?: string
  onReady?: () => void
  onMaskChange?: (mask: Uint8ClampedArray) => void
  onMattingModeChange?: (mode: string) => void
  onScaleChange?: (scale: number) => void
  onPositionChange?: (position: { x: number; y: number }) => void
}

export interface MattingModeType {
  mode: string
  renderer: MaskRendererType
  label: string
  icon: string
}
