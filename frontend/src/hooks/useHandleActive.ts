
import { isDefined } from '@vueuse/core'
import { ObjectRef, Textbox, Object as FabricObject, Rect } from 'fabric'
import { clampAngle, toFixed } from '@/utils/common'
import { isEqual, isNumber } from 'lodash-es'
import { check } from '@/utils/check'
import { ref, watchEffect, computed } from 'vue'
import { useMainStore } from '@/store'
import { storeToRefs } from 'pinia'
import { px2mm, mm2px } from '@/utils/image'
import type { WritableComputedRef } from 'vue'
import NP from 'number-precision'
import useCanvas from '@/views/Canvas/useCanvas'



export default () => {
  const mainStore = useMainStore()
  const { unitMode } = storeToRefs(mainStore)

  const handleUnit = (val: number) => {
    return unitMode.value === 0 ? px2mm(val) : val
  }
  const handleInput = (val: number) => {
    return unitMode.value === 0 ? mm2px(val) : val
  }
  const handleActive = <K extends keyof ObjectRef, T = ObjectRef[K] | undefined>(key: K): WritableComputedRef<{
    modelValue: T
    onSwipe: (value: T) => void
    onChange: (value: T) => void
  }> => {
    const [ canvas ] = useCanvas()
    
    const modelValue = ref()

    // If the input component is not confirmed after modification, onChange will be triggered when switching objects, resulting in the modification of the wrong object value.
    let lockChange = false

    watchEffect(() => {
      if (!isDefined(canvas.activeObject)) {
        modelValue.value = undefined
        return
      }

      const activeObject = canvas.activeObject.value as FabricObject & Textbox & Rect
      // Lock Modifications
      lockChange = true

      let value
      switch (key) {
        case 'width':
          value = handleUnit(activeObject.getWidth())
          break

        case 'height':
          value = handleUnit(activeObject.getHeight())
          break

        case 'opacity':
          value = NP.times(activeObject.opacity, 100)
          break

        case 'angle':
          value = clampAngle(activeObject.angle)
          break

        case 'left':
          // console.log('activeObject.getParent(true):', activeObject.getParent(true))
          // value = activeObject.getParent(true) ? handleUnit(activeObject.getLeftTop().x) : handleUnit(activeObject.left)
          value = handleUnit(activeObject.left)
          break

        case 'top':
          // value = activeObject.getParent(true) ? handleUnit(activeObject.getLeftTop().y) : handleUnit(activeObject.top)
          value = handleUnit(activeObject.top)
          break

        case 'fontSize':
          if (check.isTextObject(activeObject)) {
            // Font size
            let lastStyle = activeObject.getStyleAtPosition(0).fontSize
            let allSameStyle = true
            for (let i = 1; i < activeObject.text.length; i++) {
              const thisStyle = activeObject.getStyleAtPosition(i).fontSize
              if (!isEqual(thisStyle, lastStyle)) {
                allSameStyle = false
                break
              }
              lastStyle = thisStyle
            }
            if (!allSameStyle) {
              value = 'Multiple Values'
            } 
            else {
              value = activeObject.fontSize
            }
          } 
          else {
            value = activeObject[key]
          }
          break

        default:
          value = activeObject[key]
          break
      }

      modelValue.value = isNumber(value) ? toFixed(value) : value
      // requestAnimationFrame(() => (lockChange = false))
    })

    const setObjectValue = (obj: FabricObject, newValue: any) => {
      if (key === 'opacity') {
        newValue = NP.divide(newValue, 100)
      }
      if (obj.get(key) !== newValue) {
        obj.set(key, newValue)
      }
    }

    /**
     * Changing a value
     */
    const changeValue = (newValue: T, type: 'swipe' | 'change') => {
      const activeObject = canvas.activeObject.value as FabricObject & Textbox
      if (lockChange || !isDefined(activeObject)) return
      if (['width', 'height', 'left', 'top', 'angle'].includes(key)) {
        activeObject.set(key, Number(newValue))
        if (type === 'change' && activeObject.group?.updateLayout) {
          activeObject.group.updateLayout()
        }
      }
      else if (
        activeObject.isType<Textbox | Text>('Text', 'Textbox') &&
        ['fontSize'].includes(key) &&
        activeObject.selectionEnd - activeObject.selectionStart > 0
      ) {
        activeObject.setSelectionStyles({
          fontSize: newValue,
        })
      } 
      // Group
      else if (check.isCollection(activeObject) && !['left', 'top', 'visible', 'globalCompositeOperation', 'opacity'].includes(key)) {
        activeObject.forEachObject((obj) => {
          setObjectValue(obj, newValue)
        })
      }
      // other
      else {
        setObjectValue(activeObject, newValue)
      }

      canvas.requestRenderAll()
    }

    return computed(() => ({
      disabled: !isDefined(canvas.activeObject.value),
      modelValue: modelValue.value as T,
      onSwipe: (value: T) => {
        changeValue(value, 'swipe')
      },
      onChange: (value: T) => {
        changeValue(value, 'change')
        if (!isDefined(canvas.activeObject)) return
        canvas.fire('object:modified', { target: canvas.activeObject.value })
      },
    }))
  }

  return {
    handleActive,
    handleInput,
    handleUnit
  }
}