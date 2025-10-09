import { EventType } from '../constants'
import { UnbindDownUpCache, UnbindMoveCache, MouseListenerContext, UnbindDownUpConfig, ListenerConfig, UnbindWheelCache, WheelListenerContext } from '../types/listenerManager'

const { MouseDown, Mouseup, Mousemove } = EventType

export default class ListenerManager {
  private unbindDownUpCache: UnbindDownUpCache = new WeakMap()
  private unbindMoveCache: UnbindMoveCache = new WeakMap()
  private unbindWheelCache: UnbindWheelCache = new Set()

  /** 初始化鼠标相关事件监听器 */
  initMouseListeners(ctx: MouseListenerContext) {
    const { mouseTarget } = ctx
    this.removeMouseListeners(mouseTarget)
    const unbindConfig = this.bindMouseListeners(ctx)
    this.unbindDownUpCache.set(mouseTarget, unbindConfig)
  }

  removeMouseListeners(mouseTarget: HTMLElement) {
    const unbindConfig = this.unbindDownUpCache.get(mouseTarget)
    if (unbindConfig) {
      const { unbindDown, unbindUp } = unbindConfig
      unbindDown()
      unbindUp()
    }
  }

  private bindMouseListeners(listenersContext: MouseListenerContext): UnbindDownUpConfig {
    const { mouseTarget, down, move, up } = listenersContext
    // const moveListener = (ev: Event) => {
    //   requestAnimationFrame(() => move(ev as MouseEvent))
    // }
    const downListener = (ev: Event) => {
      const isTarget = ev.target === mouseTarget
      const extraCondition = down && down(ev as MouseEvent)
      const shouldBindMove = extraCondition !== false
      if (isTarget && shouldBindMove) {
        const removeMove = this.listenEvent({
          eventType: Mousemove,
          listener: moveListener,
          stop: true,
          prevent: true,
        })
        this.unbindMoveCache.set(mouseTarget, removeMove)
      }
    }
    const upListener = (ev: Event) => {
      up && up(ev as MouseEvent)
      this.unbindMoveListeners(mouseTarget)
    }
    const unbindDown = this.listenEvent({
      eventType: MouseDown,
      listener: downListener,
    })
    const unbindUp = this.listenEvent({
      eventType: Mouseup,
      listener: upListener,
    })
    return { unbindDown, unbindUp }
  }

  /** Remove the mousemove listener */
  private unbindMoveListeners(mouseTarget: HTMLElement) {
    const unbindMove = this.unbindMoveCache.get(mouseTarget)
    unbindMove && unbindMove()
    this.unbindMoveCache.delete(mouseTarget)
  }

  /** Initialize wheel event listener */
  initWheelListener(listenersConfig: WheelListenerContext): VoidFunction {
    this.removeWheelListeners()
    const removeWheel = this.bindWheelListener(listenersConfig)
    this.unbindWheelCache.add(removeWheel)
    return removeWheel
  }

  /** Unbind wheel event listener */
  removeWheelListeners() {
    this.unbindWheelCache.forEach((unbind) => unbind())
    this.unbindWheelCache.clear()
  }

  /** Bind wheel event listener */
  private bindWheelListener(listenersConfig: WheelListenerContext) {
    const { mattingBoards, wheel } = listenersConfig
    return this.listenEvent(
      {
        eventType: EventType.Wheel,
        listener: (ev) => {
          if (this.canWheel(ev, mattingBoards)) {
            wheel(ev as WheelEvent)
          }
        },
      },
      false,
      ...mattingBoards,
    )
  }

  /** Is scrolling possible? */
  private canWheel(ev: Event, mattingBoards: HTMLCanvasElement[]): boolean {
    return mattingBoards.some((board) => ev.target === board)
  }

  /** Listen for events and return a callback to remove the listener */
  private listenEvent(listenerConfig: ListenerConfig, options: boolean | AddEventListenerOptions = false, ...targets: HTMLElement[]): VoidFunction {
    const { eventType } = listenerConfig
    const wrapListener = this.genWrapListener(listenerConfig)
    let removeListenerCallback: VoidFunction
    if (!this.isNeedToBindToTargets(targets)) {
      removeListenerCallback = this.bindListener(window, eventType, wrapListener, options)
    } else {
      removeListenerCallback = this.bindListeners(targets, eventType, wrapListener, options)
    }
    return removeListenerCallback
  }

  private genWrapListener(listenerConfig: ListenerConfig) {
    const { listener, stop, prevent } = listenerConfig
    return (ev: Event) => {
      if (stop) {
        ev.stopPropagation()
      }
      if (prevent) {
        ev.preventDefault()
      }
      listener(ev)
    }
  }

  /** Whether to bind to the target element */
  private isNeedToBindToTargets(targets: HTMLElement[]) {
    return targets.length !== 0
  }

  /** Bind a listener to a single target */
  private bindListener(target: Window | HTMLElement, eventType: string, listener: EventListener, options: boolean | AddEventListenerOptions): VoidFunction {
    target.addEventListener(eventType, listener, options)
    return () => target.removeEventListener(eventType, listener, options)
  }

  /** Bind listeners to multiple targets */
  private bindListeners(targets: HTMLElement[], eventType: string, listener: EventListener, options: boolean | AddEventListenerOptions): VoidFunction {
    targets.forEach((target) => {
      target.addEventListener(eventType, listener, options)
    })
    return () =>
      targets.forEach((target) => {
        target.removeEventListener(eventType, listener, options)
      })
  }
}
