
import { DEFAULT_IMAGE_SMOOTH_CHOICE, INITIAL_GAP_SIZE } from '../constants'
import { TransformConfig } from '../types/common'
import { ComputeTransformConfigConfig, GenerateMaskSourceConfig, GetValidTransformParametersConfig, InitMattingConfig, InitMattingResult } from '../types/initMatting'
import { getLoadedImage, initHiddenBoard, initHiddenBoardWithSource, transformedDrawImage } from './domHelper'
import { computeTransformParameters, computeValidImageSize } from './initCompute'
import { initMaskRenderer } from './maskRenderer'

export async function initMatting(initMattingConfig: InitMattingConfig): Promise<InitMattingResult> {
  const {
    boardContexts: { inputCtx, outputCtx, inputHiddenCtx, inputDrawingCtx, outputHiddenCtx, outputDrawingCtx },
    picFile,
    transformConfig,
    targetSize,
    gapSize,
  } = initMattingConfig
  // hideCanvas(inputContext2D, outputContext2D);
  ;(inputCtx.value as CanvasRenderingContext2D).imageSmoothingEnabled = DEFAULT_IMAGE_SMOOTH_CHOICE
  ;(outputCtx.value as CanvasRenderingContext2D).imageSmoothingEnabled = DEFAULT_IMAGE_SMOOTH_CHOICE
  const imageSource = await getLoadedImage(picFile)
  const { scaleRatio, positionRange } = getValidTransformConfig({ imageSource, transformConfig, targetSize, gapSize })
  const validImageSize = computeValidImageSize(imageSource)
  initHiddenBoardWithSource({
    imageSource,
    targetSize: validImageSize,
    hiddenCtx: inputHiddenCtx.value,
    drawingCtx: inputDrawingCtx,
  })
  transformedDrawImage({
    hiddenCtx: inputHiddenCtx.value,
    ctx: inputCtx.value as CanvasRenderingContext2D,
    scaleRatio,
    positionRange,
  })
  initHiddenBoard({
    targetSize: validImageSize,
    hiddenCtx: outputHiddenCtx.value,
    drawingCtx: outputDrawingCtx,
  })

  const raw = await createImageBitmap(inputHiddenCtx.value.canvas)
  const mask = await generateMaskImageSource({ targetSize: validImageSize, imageSource })
  return { orig: imageSource, raw, mask, positionRange, scaleRatio }
}

/** Generate masked image resources */
function generateMaskImageSource(config: GenerateMaskSourceConfig): Promise<ImageBitmap> {
  const {
    targetSize: { width, height },
    imageSource,
  } = config
  const cvs = document.createElement('canvas')
  cvs.width = width
  cvs.height = height
  const render = initMaskRenderer(cvs)
  if (render) {
    render(imageSource)
  }
  return createImageBitmap(cvs)
}

/** Get the valid transformation configuration */
function getValidTransformConfig(getParametersConfig: GetValidTransformParametersConfig): TransformConfig {
  const { transformConfig, ...computeConfig } = getParametersConfig
  if (isInvalidTransformConfig(transformConfig)) {
    const { scaleRatio, positionRange } = computeTransformConfig(computeConfig)
    transformConfig.scaleRatio = scaleRatio
    transformConfig.positionRange = positionRange
  }
  return transformConfig as TransformConfig
}

/** Determine whether the transformation configuration is invalid */
function isInvalidTransformConfig(transformConfig: Partial<TransformConfig>) {
  const { scaleRatio, positionRange } = transformConfig
  return !scaleRatio || !positionRange
}

/** Calculate the transformation configuration object of the drawing board */
function computeTransformConfig(computeConfig: ComputeTransformConfigConfig): TransformConfig {
  const { imageSource, targetSize, gapSize = INITIAL_GAP_SIZE } = computeConfig
  const imageSize = computeValidImageSize(imageSource)
  return computeTransformParameters({
    gapSize,
    imageSize,
    targetSize,
  })
}
