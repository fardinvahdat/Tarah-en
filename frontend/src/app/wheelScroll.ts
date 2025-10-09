
import { CanvasEvents, Canvas, Point, TPointerEvent, TPointerEventInfo } from 'fabric'
import { useIntervalFn, useMagicKeys } from '@vueuse/core'
import { Disposable, toDisposable } from '@/utils/lifecycle'
import { debounce } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { useFabricStore } from '@/store'

/**
 * Artboard default scrolling behavior
 */
export class WheelScroll extends Disposable {
  private edgeMoveStatus = true

  constructor(private readonly canvas: Canvas) {
    super()
    this.initWhellScroll()
    this.initEdgeMove()
  }

  /**
   * Mouse scroll
   */
  private initWhellScroll() {
    const { ctrl, cmd, shift } = useMagicKeys()
    const fabricStore = useFabricStore()
    const { zoom } = storeToRefs(fabricStore)
    const mouseWheel = (e: CanvasEvents['mouse:wheel']) => {
      e.e.preventDefault()
      e.e.stopPropagation()
      const { deltaX, deltaY, offsetX, offsetY } = e.e
      // Zoom Window
      if (ctrl.value || cmd.value) {
        const zoomFactor = Math.abs(deltaY) < 10 ? deltaY * 2 : deltaY / 3
        const canvasZoom = this.canvas.getZoom()
        let zoomVal = canvasZoom * (1 - zoomFactor / 200)
        if (zoomVal > 0.97 && zoomVal < 1.03) {
          zoomVal = 1
        }
        zoom.value = zoomVal
        this.canvas.zoomToPoint(new Point(offsetX, offsetY), zoomVal)
        this.setCoords()
        return
      }
      
      // Scrolling the canvas
      const deltaPoint = new Point()
      if (shift.value) {
        deltaPoint.x = deltaY > 0 ? -20 : 20
      } else {
        deltaPoint.y = deltaY > 0 ? -20 : 20
      }
      this.canvas.relativePan(deltaPoint)
      this.setCoords()
    }

    this.canvas.on('mouse:wheel', mouseWheel)
    this._register(
      toDisposable(() => {
        this.canvas.off('mouse:wheel', mouseWheel)
      }),
    )
  }

  /**
   * Update all element coordinates
   */
  private setCoords = debounce(() => {
    const { renderOnAddRemove } = this.canvas
    this.canvas.renderOnAddRemove = false
    this.canvas.setViewportTransform(this.canvas.viewportTransform)
    this.canvas.renderOnAddRemove = renderOnAddRemove
  }, 150)

  /**
   * Edge Mobility
   */
  private initEdgeMove() {
    let event: TPointerEventInfo<TPointerEvent> | undefined

    /** Whether to execute setCoords */
    let needSetCoords = false

    const { pause, resume } = useIntervalFn(() => {
        if (!event) return

        const A = new Point(24, 24)
        const B = new Point(this.canvas.width, this.canvas.height).subtract(A)
        const [pos, distance] = this.judgePosition(event.absolutePointer, A, B)
        if (pos === 0) return

        let deltaPoint = new Point()
        const amount = Math.min(distance, 20)
        if (pos & 1) deltaPoint.x = amount
        if (pos & 2) deltaPoint.x = -amount
        if (pos & 4) deltaPoint.y = amount
        if (pos & 8) deltaPoint.y = -amount

        // Move to the four corners and slow down
        if (deltaPoint.x !== 0 && deltaPoint.y !== 0) {
          deltaPoint = deltaPoint.scalarDivide(1.5)
        }

        this.canvas.relativePan(deltaPoint)
        this.canvas._onMouseMove(event.e)
        needSetCoords = true
      },
      16, // 1000 / 60
      {
        immediate: false,
      },
    )

    // const { isSwiping } = useFabricSwipe({
    //   onSwipeStart: () => {
    //     if (!this.edgeMoveStatus) return
    //     isSwiping.value = true
    //     resume()
    //   },
    //   onSwipe: (e) => {
    //     if (!this.edgeMoveStatus) return
    //     event = e
    //   },
    //   onSwipeEnd: () => {
    //     pause()
    //     event = undefined
    //     if (needSetCoords) {
    //       this.setCoords()
    //       needSetCoords = false
    //     }
    //   },
    // })

    // this.eventbus.on('setEdgeMoveStatus', (value) => {
    //   this.edgeMoveStatus = value
    // })
  }

/**
* Determine the position and distance of point T relative to the rectangle
* @param {Point} T - point to be determined
* @param {Point} A - point at the upper left corner of the rectangle
* @param {Point} B - point at the lower right corner of the rectangle
* @returns {Array} the first element is pos, the second element is distance
*/
  private judgePosition(T: Point, A: Point, B: Point): [number, number] {
    let pos = 0
    let distance = 0
    if (T.x < A.x) (pos |= 1), (distance += A.x - T.x)
    else if (T.x > B.x) (pos |= 2), (distance += T.x - B.x)
    if (T.y < A.y) (pos |= 4), (distance += A.y - T.y)
    else if (T.y > B.y) (pos |= 8), (distance += T.y - B.y)
    return [pos, distance]
  }
}
