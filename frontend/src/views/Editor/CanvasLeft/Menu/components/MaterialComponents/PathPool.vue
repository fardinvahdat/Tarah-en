<template>
  <div class="shape-explorer">
    <div class="shape-category" v-for="(item, categoryIndex) in PathShapeLibs" :key="item.type">
      <div class="category-header">
        <h3 class="category-title">{{ item.type }}</h3>
        <div class="category-indicator"></div>
      </div>

      <div class="shape-grid">
        <div class="shape-item" v-for="(shape, index) in visibleShapes(item)" :key="index" @click="selectShape(shape)">
          <div class="shape-content">
            <svg overflow="visible" width="40px" height="40px">
              <g
                :transform="`scale(${32 / shape.viewBox[0]}, ${32 / shape.viewBox[1]}) translate(0,0) matrix(1,0,0,1,0,0)`">
                <path class="shape-path" :class="{ 'outlined': shape.outlined }" vector-effect="non-scaling-stroke"
                  stroke-linecap="butt" stroke-miterlimit="8" :fill="shape.outlined ? 'transparent' : '#001087'"
                  :stroke="shape.outlined ? '#001087' : 'transparent'" stroke-width="1" :d="shape.path">
                </path>
              </g>
            </svg>
          </div>
        </div>
        <!-- Show More/Less Button -->
        <div class="show-more-container !m-0" v-if="item.children.length > 9">
          <button class="show-more-button w-full h-full" @click="toggleShowMore(item.type)">
            {{ showMoreStates[item.type] ? ' Less' : ' More' }}
          </button>
        </div>
      </div>


    </div>
  </div>
</template>

<script lang="ts" setup>
import { PathShapeLibs } from '@/configs/shape'
import { PathPoolItem } from '@/types/elements'
import { ref, reactive } from 'vue';

// Existing emits
const emit = defineEmits<{
  (event: 'select', payload: PathPoolItem): void
}>()

// Track show more states per category
const showMoreStates = reactive<Record<string, boolean>>({});

const selectShape = (path: PathPoolItem) => {
  emit('select', path)
}

// Get visible shapes for a category
const visibleShapes = (category: { type: string; children: PathPoolItem[] }) => {
  if (showMoreStates[category.type]) {
    return category.children;
  }
  return category.children.slice(0, 9);
}

// Toggle show more/less state
const toggleShowMore = (categoryType: string) => {
  showMoreStates[categoryType] = !showMoreStates[categoryType];
}
</script>

<style lang="scss">
.shape-explorer {
  width: 100%;
  font-family: 'IRANSans', Arial, sans-serif;
  padding: 10px;
}

.shape-category {
  margin-bottom: 28px;
  animation: fadeIn 0.5s ease forwards;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:nth-child(1) {
    animation-delay: 0.1s;
  }

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.3s;
  }

  &:nth-child(4) {
    animation-delay: 0.4s;
  }

  &:nth-child(5) {
    animation-delay: 0.5s;
  }
}

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  position: relative;

  .category-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 0;
    position: relative;
    z-index: 2;
    padding-right: 12px;
    padding-left: 10px;
    background-color: white;
  }

  .category-indicator {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, $themeColor 0%, rgba($themeColor, 0.4) 100%);
    z-index: 1;
  }
}

.shape-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;

}

.shape-item {
  aspect-ratio: 1;
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  &:before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
    z-index: 1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);

    &:before {
      opacity: 1;
    }

    .shape-path {
      &:not(.outlined) {
        stroke: $themeColor;
      }

      &.outlined {
        fill: $themeColor;
      }
    }
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  }
}

.shape-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20%;

  svg:not(:root) {
    overflow: visible;
    width: 100%;
    height: 100%;
  }

  .shape-path {
    transition: all 0.2s ease;
  }
}

.show-more-container {
  text-align: center;
  margin-top: 15px;
}

.show-more-button {
  background-color: transparent;
  border: none;
  color: $themeColor;
  cursor: pointer;
  font-size: 10px;
  font-weight: 500;
  // padding: 5px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba($themeColor, 0.1);
  }

  &:active {
    transform: translateY(1px);
  }
}
</style>
