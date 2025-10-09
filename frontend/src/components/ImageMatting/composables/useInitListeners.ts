import { transformedDrawImage } from '../helpers/domHelper'
import { initDrawingListeners } from '../helpers/initDrawingListeners'
import { initDragListener, initScaleListener } from '../helpers/initTransformListener'
import { BoardRect } from '../types/common'
import { ImageSources, MattingProps, UseInitListenersConfig } from '../types/initMatting'
import { onBeforeUnmount, watch, watchEffect } from 'vue'

export function useInitDrawingListeners(props: MattingProps, config: UseInitListenersConfig) {
  const { radius, hardness, isErasing } = props
  const { boardContexts, transformConfig, mattingSources, draggingInputBoard, initialized, boardRect, listenerManager } = config
  const { inputCtx } = boardContexts
  watchEffect(() => {
    if (initialized.value) {
      initDrawingListeners({
        listenerManager,
        imageSources: mattingSources.value as ImageSources,
        boardContexts,
        initDrawingConfig: { radius, hardness, transformConfig },
        isErasing: isErasing.value,
        draggingInputBoard: draggingInputBoard.value,
        boardRect: boardRect.value as BoardRect,
      })
    }
  })
  onBeforeUnmount(() => {
    listenerManager.removeMouseListeners((inputCtx.value as CanvasRenderingContext2D).canvas)
  })
}

export function useInitTransformListener(config: UseInitListenersConfig) {
  const { boardContexts, initialized, draggingInputBoard, transformConfig, isDrawing, listenerManager } = config
  const { inputCtx, inputHiddenCtx, outputCtx, outputHiddenCtx } = boardContexts
  watch(
    [initialized, draggingInputBoard, isDrawing],
    () => {
      if (initialized.value && !isDrawing.value) {
        const initConfig = {
          inputContexts: { ctx: inputCtx.value as CanvasRenderingContext2D, hiddenCtx: inputHiddenCtx.value },
          outputContexts: { ctx: outputCtx.value as CanvasRenderingContext2D, hiddenCtx: outputHiddenCtx.value },
          draggingInputBoard: draggingInputBoard.value,
          listenerManager,
          transformConfig,
        }
        initDragListener(initConfig)
        initScaleListener(initConfig)
        // Trigger rebinding of drawing listener. You must enter the end of dragging the artboard to rebind, otherwise the drawing listener will cover the drag listener
        if (!draggingInputBoard.value) {
          transformConfig.positionRange = { ...transformConfig.positionRange }
        }
      }
    },
    { deep: true },
  )
  watch([transformConfig], async () => {
    if (initialized.value) {
      const { positionRange, scaleRatio } = transformConfig
      const commonConfig = { positionRange, scaleRatio }
      transformedDrawImage({
        ctx: inputCtx.value as CanvasRenderingContext2D,
        hiddenCtx: inputHiddenCtx.value,
        ...commonConfig,
      })
      transformedDrawImage({
        ctx: outputCtx.value as CanvasRenderingContext2D,
        hiddenCtx: outputHiddenCtx.value,
        withBorder: true,
        ...commonConfig,
      })
    }
  })
  onBeforeUnmount(() => {
    if (initialized.value) {
      listenerManager.removeMouseListeners((outputCtx.value as CanvasRenderingContext2D).canvas)
      listenerManager.removeWheelListeners()
    }
  })
}
