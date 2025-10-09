<template>
  <svg class="rounded-lg md:h-[35px] md:w-[35px] w-full h-full max-h-[55px]" :style="customStyle">
    <defs>
      <linearGradient v-if="type === 'linear'" :id="uniqueId" :x1="x1" :y1="y1" :x2="x2" :y2="y2">
        <stop v-for="(item, index) in colors" :key="index" :offset="`${item.offset * 100}%`" :stop-color="item.color" />
      </linearGradient>

      <radialGradient :id="uniqueId" v-else :cx="cx" :cy="cy" :r="r" :fx="fx" :fy="fy">
        <stop v-for="(item, index) in colors" :key="index" :offset="`${item.offset * 100}%`" :stop-color="item.color" />
      </radialGradient>
    </defs>
    <g class="h-full w-full">
      <path vector-effect="non-scaling-stroke" stroke-linecap="butt" class="h-full w-full"
        :d="`M 0 0 L ${windowWidth > 768 ? 35 : 60} 0 L ${windowWidth > 768 ? 35 : 60} ${windowWidth > 768 ? 35 : 60} L 0 ${windowWidth > 768 ? 35 : 60} Z`"
        :fill="`url(#${uniqueId})`" stroke-width="0" stroke="#fff" stroke-dasharray='0 0'></path>
    </g>
  </svg>
</template>

<script lang="ts" setup>
import { PropType, computed } from 'vue'
import { ColorStop } from '@/types/elements'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String as PropType<'linear' | 'radial'>,
    default: 'linear'
  },
  colors: {
    type: Array as PropType<ColorStop[]>,
    required: true,
  },
  angle: {
    type: Number,
    default: 0,
  },
  width: {
    type: Number,
    default: 35,
  },
  height: {
    type: Number,
    default: 35,
  },
  customStyle: {
    type: Object,
    default: () => ({}),
  }
})
const windowWidth = ref(window.innerWidth);
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

// Add event listener when the component is mounted
onMounted(async () => {
  window.addEventListener('resize', updateWindowWidth);
  // await getUser()
});

// Remove event listener when the component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
});

// Create a unique ID for each gradient to avoid conflicts
const uniqueId = computed(() => `gradient-${props.name}-${Math.floor(Math.random() * 10000)}`)

// Calculate gradient coordinates based on angle for linear gradients
const { x1, y1, x2, y2 } = computed(() => {
  if (props.type !== 'linear') return { x1: '0%', y1: '0%', x2: '100%', y2: '0%' }

  const angle = props.angle % 360
  const angleRad = (angle * Math.PI) / 180

  const x = Math.cos(angleRad)
  const y = Math.sin(angleRad)

  // Convert to percentage coordinates for the SVG
  return {
    x1: `${50 - x * 50}%`,
    y1: `${50 - y * 50}%`,
    x2: `${50 + x * 50}%`,
    y2: `${50 + y * 50}%`
  }
}).value

// For radial gradients
const { cx, cy, r, fx, fy } = computed(() => {
  return {
    cx: '50%',
    cy: '50%',
    r: '50%',
    fx: '50%',
    fy: '50%'
  }
}).value
</script>

<style lang="scss" scoped>
svg {
  display: block;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;

  &:hover {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }
}
</style>
