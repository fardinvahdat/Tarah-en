<template>
  <el-input-number
    class="swipe-input"
    v-model="numberValue" 
    :step="step" 
    :max="max" 
    :min="min"
    :controls="false"
    :label="label"
    @change="change"
  >
  </el-input-number>
</template>
<script setup lang="ts">
import { usePointerSwipe, useVModel, isDefined, useMagicKeys } from '@vueuse/core'
import { useSlots, watch, ref, computed } from 'vue'
import { toFixed } from '@/utils/common'
// import { useMainStore } from '@/store';
// import { storeToRefs } from 'pinia';
// import { mm2px, px2mm } from '@/utils/image';
import useHandleActive from '@/hooks/useHandleActive'

const { handleInput } = useHandleActive()

const props = withDefaults(
  defineProps<{
    label?: string
    modelValue?: number
    modelEvent?: 'change' | 'input'
    step?: number
    max?: number
    min?: number
  }>(),
  {
    modelEvent: 'change',
    step: 1,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | undefined): void
  (e: 'change', value: number | undefined, ev: Event): void
  (e: 'swipe', value: number | undefined, ev: Event): void
}>()

const slots = useSlots()

const numberValue = useVModel(props, 'modelValue', emit)

watch(numberValue, (value) => {
  if (!value) return
  numberValue.value = toFixed(value)
}, { immediate: true})

const change = (value: number | undefined, ev: Event) => {
  if (!value) return
  value = handleInput(value)
  emit('change', value, ev)
}

// Swipe
// const { shift, alt } = useMagicKeys()
// const labelRef = ref<HTMLElement>()
// const startValue = ref<number>()
// const { posStart, posEnd } = usePointerSwipe(labelRef, {
// threshold: 0,
// onSwipeStart: () => {
// startValue.value = numberValue.value
// },
// onSwipe: (e) => {
// // Check if the value of startValue is a number. If not, exit the function
// if (!isNumber(startValue.value)) return
// // Adjust the step size according to the value of props.step
// let step = props.step
// if (shift.value) step *= 10
// if (alt.value) step /= 10
// step = Math.max(step, 0.01)
// // Calculate the new value based on the distance the mouse is dragged
// let value = startValue.value + Math.round(posEnd.x - posStart.x) * step
// // If props.min or props.max exists, ensure that the new value is within the specified range
// if (isDefined(props.min) && value < props.min) value = props.min
// if (isDefined(props.max) && value > props.max) value = props.max
// // Round the calculated value and assign it to numberValue
// value = toFixed(value)
// numberValue.value = value
// // Call the swipe function and pass the new value and event object
// emit('swipe', value, e)
// },
// onSwipeEnd: (e) => {
// emit('change', numberValue.value, e)
// startValue.value = undefined
// },
// })

// const hasLabel = computed(() => !!props.label || !!slots.label)
</script>



<style scoped lang="scss">
.swipe-input {
  :deep(.el-input__wrapper) {
    padding: 5px;
  }
  :deep(.el-input__prefix-inner) {
    margin: 0;
    width: 25px;
  }
  :deep(.label-ref) {
    margin: 0;
  }
}
</style>
