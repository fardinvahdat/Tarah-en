import { useMainStore, useTemplatesStore } from '@/store'
import { Canvas, FabricObject, FabricImage, Point, TMat2D } from 'fabric'
import { shallowRef } from 'vue'
import { toRef } from './attribute/toRef'
import { check } from '@/utils/check'
import { nonid } from '@/utils/common'
import { FabricRuler } from './fabricRuler'

export class FabricCanvas extends Canvas {
  public ruler?: FabricRuler
  public loading?: FabricImage 
  public activeObject = shallowRef<FabricObject>()

  constructor(el: string | HTMLCanvasElement, options?: any) {
    super(el, options)
  }

  // @ts-ignore
  public get _activeObject() {
    return this.activeObject ? this.activeObject.value : undefined
  }

  public set _activeObject(value) {
    const mainStore = useMainStore()
    mainStore.setCanvasObject(value as FabricObject)
    this.activeObject.value = value
  }

  override add(...objects: FabricObject[]): number {
    return super.add(
      ...objects.map((obj) => {
        this.setDefaultAttr(obj)
        return toRef(obj)
      }),
    )
  }

  override insertAt(index: number, ...objects: FabricObject[]): number {
    return super.insertAt(
      index,
      ...objects.map((obj) => {
        this.setDefaultAttr(obj)
        return toRef(obj)
      }),
    )
  }

  private setDefaultAttr(target: FabricObject) {
    // add name
    if (!target.name) {
      target.set({name: target.type})
    }
    // add id - ensure every object has a unique ID
    if (!target.id) {
      target.set({id: nonid(8)})
    }
    // Ensure ID is always a string and unique
    if (typeof target.id !== 'string' || target.id.length < 4) {
      target.set({id: nonid(8)})
    }
    if (check.isTextObject(target)) {
      target.set({color: target.fill})
    }
    if (check.isCollection(target)) {
      target._objects.forEach((obj) => {
        this.setDefaultAttr(obj)
      })
    }
  }

  override absolutePan(point: Point, skipSetCoords?: boolean) {
    const vpt: TMat2D = [...this.viewportTransform]
    vpt[4] = -point.x
    vpt[5] = -point.y
    // Executing setCoords causes lag, add a skip attribute
    if (skipSetCoords) {
      this.viewportTransform = vpt
      // this.getObjects()?.forEach((board) => {
      // FabricObject.prototype.setCoords.call(board)
      // })
      this.requestRenderAll()
      return
    }
    this.setViewportTransform(vpt)
  }

  override relativePan(point: Point, skipSetCoords?: boolean) {
    return this.absolutePan(
      new Point(
        -point.x - this.viewportTransform[4],
        -point.y - this.viewportTransform[5]
      ),
      skipSetCoords
    );
  }
}
